#! /usr/bin/env node

const glob = require('glob');
const { resolve } = require('path');
const { promisify } = require('util');
const { spawn } = require('child_process');

const glob$ = promisify(glob);

(async () => {
  const REGEX = /^--(.*)=(.*)$/;
  const args = {};

  process.argv.forEach((arg) => {
    const exec = REGEX.exec(arg);
    if (exec) {
      const [, name, value] = exec;
      args[name] = value;
    }
  });

  const pattern = args.only === 'git' ? './modules/*/.git' : './modules/*/package.json';

  let dirs = (await glob$(pattern)).map((dir) => dir.substr(0, dir.lastIndexOf('/')));

  dirs.unshift('.');

  dirs = dirs.map(
    async (dir) =>
      new Promise((fnResolve, fnReject) => {
        const cmd = spawn(resolve(__dirname, './modules-tools.sh'), [args.cmd || 'npm-update'], {
          cwd: dir,
          stdio: 'inherit',
        });
        cmd.on('close', fnResolve);
        cmd.on('error', fnReject);
      }),
  );

  await Promise.all(dirs);
})();
