## NodeJS, Express and MongoDB starter

[![Introduction video](https://img.youtube.com/vi/gqrCH25qjP8/0.jpg)](https://www.youtube.com/watch?v=gqrCH25qjP8)

## Table of Content

- [Getting Started](#getting-started)
- [Useful Commands](#useful-commands)
- [VSCode helpers](#vscode-helpers)

## Getting started

### Using `izm` CLI

```bash
npx izm
# Then follow the wizard
```

### Manual clone

```bash
git clone git@github.com:izmjs/izmjs.git new-project
cd new-project
npm i
echo "NODE_ENV=development" > .env/.common.env
cp .example.env .env/.development.env
```

Optional: Add `devtools` functional module:

```bash
git clone git@github.com:midrissi/devtools-fm.git modules/devtools
npm i
```

Start the project

```bash
npm start
```

## Useful Commands

- `npm start` - starts a dev server with [nodemon](https://github.com/remy/nodemon)
- `npm test` - runs tests with `mocha`
- `npm run generate:module [name]` - generate a new module (Optionnally you can give the name in the command line, otherwise you will be prompted to choose a name.)

## VSCode helpers

### iam

This shortcut will put a definition of new IAM rules in the file.

### iam:route

Will generate a new route

### iam:method

Will generate the definition of a method.

### ctrl

Create new controller.

### module:model

Generate a new mongoose model.

## Auto depmloyment (Gitlab CI)

You need to define these environment variables in your repository:

- `PRODUCTION_URL`: [The production URL](https://docs.gitlab.com/ee/ci/environments.html#making-use-of-the-environment-url)
- `PRODUCTION_DEPLOY_SERVER`: List of production servers addresses or IP addresses. Should be separated by `,`.
- `PRODUCTION_SSH_PRIVATE_KEY`: The SSH key to use to connect to production servers.
- `STAGING_URL`: [The staging URL](https://docs.gitlab.com/ee/ci/environments.html#making-use-of-the-environment-url)
- `STAGING_DEPLOY_SERVER`: List of staging servers addresses or IP addresses. Should be separated by `,`.
- `STAGING_SSH_PRIVATE_KEY`: The SSH key to use to connect to staging servers.
