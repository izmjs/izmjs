#!/usr/bin/env node
const { resolve, join } = require('path');
const { readdirSync, existsSync } = require('fs');
const { spawn } = require('child_process');
const { platform } = require('os');

['modules', 'vendor'].forEach((base) => {
  const lib = resolve(__dirname, '..', base);
  readdirSync(lib).forEach((mod) => {
    const modPath = join(lib, mod);
    // ensure path has package.json
    if (!existsSync(join(modPath, 'package.json'))) {
      return false;
    }

    // npm binary based on OS
    const npmCmd = platform().startsWith('win') ? 'npm.cmd' : 'npm';

    // install folder
    spawn(npmCmd, ['i'], { env: process.env, cwd: modPath, stdio: 'inherit' });

    return true;
  });
});
