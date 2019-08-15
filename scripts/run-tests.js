#! /usr/bin/env node

/* eslint-disable no-console */
const { resolve } = require('path');
const { spawn } = require('child_process');

(() => {
  if (!process.env.npm_config_argv) {
    console.log('This is meant to be run from within npm script.');
    return;
  }

  const { platform } = process;
  const platformSpecific = spawn(
    platform === 'win32' ? 'npm.cmd' : 'npm',
    [
      'run',
      'test:prefix',
      resolve('tests/\\*\\*/\\*.test.js'),
    ],
    {
      shell: true,
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
    },
  );

  platformSpecific.on('exit', (code) => {
    process.exit(code);
  });
})();
