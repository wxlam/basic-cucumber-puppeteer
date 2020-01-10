const { Given, When, Then } = require('cucumber')
const scope = require('./support/scope')
const constants = require('./support/constants')
const _ = require('lodash')
const expect = require('expect-puppeteer')
const chai = require('chai')
const should = chai.should()

Given('I launch the application', async () => {
    let env = process.env.NODE_ENV
    let url = constants.baseUrl
    console.log(`ENV: ${env}`)
    await scope.page.goto(url, { waitUntil: 'networkidle0' })
})

Given('You should eventually see page heading {string}', async (expectedHeading) => {
    await expect(scope.page).toMatchElement('h1', {text: expectedHeading})
})

Then ('Fill in task name field with {string}', async (text) => {
    const taskNameField = await expect(scope.page).toMatchElement('[name="addTask"]')
    await taskNameField.focus()
    await taskNameField.type(text)
})

Then ('Click the {string} button', async (buttonName) => {
    const button = await expect(scope.page).toMatchElement('button', {text: buttonName})
    await button.click()
})

Then ('You should eventually see task {int} with description {string}', async (taskNum, taskName) => {
    let taskIndex = taskNum - 1
    const tasks = await scope.page.$$('[class^=taskstyles__Content]')
    await expect(tasks[taskIndex]).toMatchElement('[class^="taskstyles__TaskDescription"]', {text: taskName})
})

Then ('You should eventually see a task with description {string}', async (taskName) => {
    await expect(scope.page).toMatchElement('[class^="taskstyles__TaskDescription"]', {text: taskName})
})

Then ('You should see {int} task(s)', async (numberOfTasks) => {
    const tasks = await scope.page.$$('[class^=taskstyles__Content]')
    tasks.length.should.equal(numberOfTasks)
})

Then ('Click on task {int}', async (taskNum) => {
    let taskIndex = taskNum - 1
    const tasks = await scope.page.$$('[class^=taskstyles__Content]')
    await tasks[taskIndex].click()
})

Then ('You should see task options for task {int}', async (taskNum) => {
    let taskIndex = taskNum - 1
    const tasks = await scope.page.$$('[class^=taskstyles__Content]')
    await expect(tasks[taskIndex]).toMatchElement('[class^=taskstyles__Options-]')
})

Then ('You should see the following options available for task {int}:', async (taskNum, dataTable) => {
    let taskIndex = taskNum - 1
    const tasks = await scope.page.$$('[class^=taskstyles__Content]')
    const options = await expect(tasks[taskIndex]).toMatchElement('[class^=taskstyles__Options-]')

    let fields = dataTable.hashes()

    for (const row of fields) {
        if(row.name === 'edit') {
            expect(options).toMatchElement('[class^=editPencilstyles__Wrapper]')
        } else if (row.name === 'delete') {
            expect(options).toMatchElement('[class^=deleteBinstyles__Wrapper]')
        } else {
            throw new Error(`${row.name} is not a valid value. Expect: edit or delete`)
        }
    }
})

Then ('Click {string} option for task {int}', async (optionName, taskNum) => {
    let taskIndex = taskNum - 1
    const tasks = await scope.page.$$('[class^=taskstyles__Content]')
    const options = await expect(tasks[taskIndex]).toMatchElement('[class^=taskstyles__Options-]')
    let option
    if(optionName === 'edit') {
        option = await expect(options).toMatchElement('[class^=editPencilstyles__Wrapper]')
    } else if (optionName === 'delete') {
        option = await expect(options).toMatchElement('[class^=deleteBinstyles__Wrapper]')
    } else {
        throw new Error(`${row.name} is not a valid value. Expect: edit or delete`)
    }
    await option.click()
})

Then ('Wait for {string} second(s)', async (numSeconds) => {
    await scope.page.waitFor(parseInt(numSeconds) * 1000)
})