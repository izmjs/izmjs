/* eslint-disable no-console */

const { spawn } = require('child_process');
const { resolve } = require('path');
const { platform } = require('os');
// eslint-disable-next-line import/no-extraneous-dependencies
const ora = require('ora');

const npmCmd = platform().startsWith('win') ? 'npm.cmd' : 'npm';
const spinner = ora('Installing NPM dependencies');

const spawn$ = (...args) => new Promise((fnResolve, fnReject) => {
  const cmd = spawn(...args);
  cmd.on('close', fnResolve);
  cmd.on('error', fnReject);
});

function camelize(str) {
  return str.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
}

function getKey(txt) {
  return typeof txt === 'string' && txt.match(/[- ]/)
    ? `'${txt}'`
    : txt;
}

module.exports = (plop) => {
  // controller generator
  plop.setGenerator('module', {
    description: 'Create new module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Choose a name',
      },
      {
        type: 'confirm',
        name: 'git',
        message: 'Init git repository',
      },
      {
        type: 'confirm',
        name: 'install',
        message: 'Install dependencies',
      },
    ],
    actions: [
      {
        type: 'addMany',
        templateFiles: 'plop/module/**/*!(*.hbs)',
        destination: 'modules/{{name}}',
        skipIfExists: true,
        base: 'plop/module',
        globOptions: {
          dot: true,
        },
      },
      async (answers) => {
        if (answers.git !== true) {
          return 'Git has been ignored';
        }
        console.log('Initializing git repository');
        try {
          await spawn$('git', ['init'], {
            cwd: resolve('modules', answers.name),
            detached: true,
            stdio: 'inherit',
          });
        } catch (e) {
          console.error(e);
        }
        return 'Git repository has been initialized';
      },
      async (answers) => {
        if (answers.install !== true) {
          return 'Dependencies are ignored';
        }

        spinner.start();
        await spawn$(
          npmCmd,
          ['install'],
          {
            cwd: resolve('modules', answers.name),
            detached: true,
            stdio: 'ignore',
          },
        );
        spinner.stop();
        return 'Dependencies installed successfully';
      },
    ],
  });

  // Create the camelize helper
  plop.setHelper('camelize', camelize);
  plop.setHelper('raw-helper', (options) => options.fn());
  plop.setHelper('get-key', getKey);
};
