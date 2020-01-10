# Simple Cucumber/Puppeteer Example
This project is a simple example of using cucumberJS with puppeteer 

The test scenarios created tests the [create task list web app](https://mrbenhowl.github.io/auto-gen-boilerplate-code-babel-macro-codegen/) created by [mrbenhowl](https://github.com/mrbenhowl) 

## Getting started

`cd e2e`

`npm install` or `yarn`


## Run something 

### Running Tests

`npm run puppeteer` or `yarn puppeteer`

### Generate Report

`npm run report:html` or  `yarn report:html`

cucumber html report will be generated in `output/report` folder

## Folder structure

```
.
├── README.md
└── e2e
    ├── config
    │   └── properties.json
    ├── features
    │   └── simple.feature
    ├── output
    │   ├── report
    │   └── screenshots
    ├── package.json
    └── step_definitions
        ├── launch_steps.js
        └── support
            ├── constants.js
            ├── hooks.js
            └── scope.js
```