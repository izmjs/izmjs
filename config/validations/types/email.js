/*
eslint-disable import/no-extraneous-dependencies
*/
const nunjucks = require('nunjucks');
const path = require('path');
const generatePassword = require('generate-password');

// eslint-disable-next-line
const config = require(path.resolve("./config"));
// eslint-disable-next-line
const utils = require('utils');

/**
 * Init the validation object
 * @param {Object} user The current user
 * @param {Object} validation The validation object
 */
exports.init = (user, validation) => {
  const v = validation;

  v.code = generatePassword.generate({
    length: config.validations.config.email.code_length,
    numbers: true,
    symbols: false,
    uppercase: false,
    excludeSimilarCharacters: true,
  });
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
  const tpl = path.resolve(__dirname, '..', 'templates/confirmation-email.swig');
  const baseURL = utils.getBaseURLFromRequest(req);
  const { _id: userId } = user;

  let url = baseURL + config.prefix;
  url += '/auth/confirm?type=email';
  url += `&uid=${userId}`;
  url += `&code=${validation.code}`;


  user.sendMail('Email validation', nunjucks.render(tpl, {
    name: user.name.full,
    url,
    app: {
      name: config.app.title,
      url: baseURL,
    },
  }));

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
