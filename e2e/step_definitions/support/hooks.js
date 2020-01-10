const { BeforeAll, AfterAll, Before, After, setDefaultTimeout, Status} = require('cucumber')
const scope = require('./scope')
const constants = require('./constants')
const fse = require('fs-extra')
const fs = require('fs')
const moment = require('moment')
const _ = require('lodash')

BeforeAll(async () => {
  // reset counter
  counter = 0

  const puppeteer = require('puppeteer');
  scope.driver = puppeteer;

  // set up launchProperties object with specified parameters
  // ignoreHTTPSErrors flag required for some test envs testing
  let launchProperties = { 
    headless: constants.headlessMode, 
    ignoreHTTPSErrors: true,
    args: [ '--no-sandbox',
            '--disable-setuid-sandbox',
            // debug logging
            // '--enable-logging', '--v=1'
        ],
    // set 'devtools: true' => if you want to be able to launch the dev tools console too
    //  just need to add 'await scope.page.evaluate(() => {debugger})' to the step 
    //  you want to stop at
    devtools: false
   }

   // if constants.chromiumPath is not empty, set executablePath to chromiumPath
   // for cases where you want to launch a specific version of chromium
   if(constants.chromiumPath !== '') {
     launchProperties.executablePath = constants.chromiumPath
   }

  scope.browser = await scope.driver.launch(launchProperties)

   // set default timeout to config value
  setDefaultTimeout(constants.pageTimeout * 1000) 


  // *************************************** \\
  // clear output folders 
  //  or set them up if they don't exist
  // *************************************** \\

  // clear output/report directory if it exists or create output/report directory
  if(fse.pathExistsSync('output/report')) {
    console.log('Clear report directory ...')
    // remove any .html files in the report directory > to ensure only latest reports are in the folder
    fs.readdirSync('output/report').forEach(file => {      
      if(file.match(/.*\.html/) != null) {
        console.log(`removing file: output/report/${file}`)
        fse.removeSync(`output/report/${file}`)
      }
    });
    fse.removeSync('output/results.xml')
  } else {
    fse.ensureDirSync('output/report')
  }

  // clear output/screenshots directory if it exists or create output/screenshots directory
  if(fse.pathExistsSync('output/screenshots')) {
    console.log('Clear screenshots directory ...')
    fse.removeSync('output/screenshots/')
    // recreate directory
    fse.ensureDirSync('output/screenshots')
  } else {
    fse.ensureDirSync('output/screenshots')
  }  

  // *************************************** \\
  // collect information about the run
  //  and to write details to json file
  // *************************************** \\
  const env = process.env.NODE_ENV
  const platform = process.platform === 'darwin' ? 'MAC OSX' : process.platform
  const browserVersion = await scope.browser.version()

  // look for arg that specifies output file location - starts with 'json:'
  let outputPath = _.find(process.argv, arg => {
    return arg.indexOf('json:') >= 0
  })
  // extract the path location from the argument,
  //  remove 'json:' from outputPath to extract out the actual path
  if(outputPath) {
    outputPath = outputPath.replace('json:','')
  }

  // update and create report-config.json to be used to generate cucumber html report
  let reportConfig = constants.reportConfig
  // append to reportConfig run specific parameters
  reportConfig.jsonFile = outputPath
  reportConfig.metadata["Test Environment"] = env
  reportConfig.metadata["Browser"] = browserVersion
  reportConfig.metadata["Platform"] = platform

  fse.writeJsonSync('output/report-config.json', reportConfig)
  // *************************************** \\

})

Before(async () => {
  // create new page between scenarios
  scope.page = await scope.browser.newPage()
  await scope.page.setViewport({ width: 1280, height: 800 })
  // add in accept language header - this is required when running in headless mode
  await scope.page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6'
  })
})

After(async function (scenario) {
  // *************************************** \\
  // take screenshot at end of scenario, 
  //  if failure attach screenshot to test steps
  // *************************************** \\

  let name = scenario.pickle.name.replace(/ /g, '-')
  let result = scenario.result.status

  if(Status.FAILED) {

    const stream = await scope.page.screenshot({path: `./output/screenshots/${counter}-${result}-[${name}].png`, fullPage: true});
    // close the current page at end of scenario - to ensure fresh page is loaded each time
    await scope.page.close()
    // increment counter
    counter++
    return this.attach(stream, 'image/png');
  } else {
    let timestamp = moment()
    // take screenshot of the last page
    const stream = await scope.page.screenshot({ path: `./output/screenshots/${counter}-${result}-[${name}]-${timestamp.valueOf()}.png`, fullPage: true })
    // close the current page at end of scenario - to ensure fresh page is loaded each time
    await scope.page.close()
    // increment counter
    counter++
    return this.attach(stream, 'image/png');
  }
})

AfterAll(async () => {
  if (scope.browser) {
    // close the browser at end of run
    await scope.browser.close()
  }
})
