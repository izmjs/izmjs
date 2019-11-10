#! /usr/bin/env node

const glob = require('glob');
const {
  resolve,
} = require('path');
const {
  promisify,
} = require('util');
const {
  spawn,
} = require('child_process');

const glob$ = promisify(glob);

(async () => {
  const dirs = (await glob$('./modules/*/.git'))
    .map((dir) => dir.substr(0, dir.length - 5));

  dirs.unshift('.');

  for (let i = 0; i < dirs.length; i += 1) {
    const dir = dirs[i];
    // eslint-disable-next-line
    await new Promise((fnResolve, fnReject) => {
      const cmd = spawn(resolve(__dirname, './update-git.sh'), [
        process.argv[2] || 'update-deps',
      ], {
        cwd: dir,
        stdio: 'inherit',
      });
      cmd.on('close', fnResolve);
      cmd.on('error', fnReject);
    });
  }

  await Promise.all(dirs);
})();
