/*
eslint-disable import/no-extraneous-dependencies
*/
const path = require('path');

const config = require('@config/index');

/**
 * Generate a random number of a specific length
 * @param {Number} length The length of the code to generate
 */
function randomNumber(length) {
  let res = '';
  const l = Math.isNaN(length) ? 4 : parseInt(length, 10);

  while (res.length < l) {
    res += Math.floor(Math.random() * 10);
  }

  return res;
}

/**
 * Init the validation object
 * @param {Object} user The current user
 * @param {Object} validation The validation object
 */
exports.init = (user, validation) => {
  const v = validation;

  v.code = randomNumber(config.validations.config.phone.code_length);
  v.created = Date.now();

  return v;
};

/**
 * Hook: The pre validation hook
 * @param {Object} user The current user
 * @param {Object} validation The validation object
 */
exports.notify = (user, validation, req) => {
  const v = validation;
  const tpl = path.resolve(__dirname, '..', 'templates/confirmation-phone.swig');

  user.sendSMS(
    req.rndr(tpl, {
      app: config.app,
      code: validation.code,
    }),
  );

  return v;
};

/**
 * Check the code if it's valid
 * @param {Object} user The current user
 * @param {Object} validation The validation object
 * @param {*} code The code to check
 */
exports.isValid = (user, validation, code) => {
  if (!validation || typeof validation !== 'object') {
    return false;
  }

  return validation.code === code;
};
