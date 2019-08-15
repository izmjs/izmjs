/**
 * Module dependencies.
 */
const appModulePath = require('app-module-path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: './.env/.common.env',
});

dotenv.config({
  path: `./.env/.${env}.env`,
});

if (typeof Array.prototype.flat !== 'function') {
  // eslint-disable-next-line no-extend-native
  Array.prototype.flat = function flat() {
    const stack = [...this];
    const res = [];
    while (stack.length) {
    // pop value from stack
      const next = stack.pop();
      if (Array.isArray(next)) {
      // push back array items, won't modify the original input
        stack.push(...next);
      } else {
        res.push(next);
      }
    }
    // reverse to restore input order
    return res.reverse();
  };
}

/**
 * Add app modules
 */
[
  'helpers',
  'vendor',
].map(m => appModulePath.addPath(m));
