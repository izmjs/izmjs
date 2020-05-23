/*
eslint-disable import/no-dynamic-require,global-require
*/

/**
 * Local dependencies.
 */
const config = require('@config/index');
const utils = require('./utils');

exports.onInit = async (user) => {
  const vConfig = config.validations;
  const types = vConfig.types || [];

  types.forEach((t) => {
    const m = require(`./types/${t}`);
    const v = utils.getValidationObj(user, t);

    m.init(user, v);
  });

  user.markModified('validations');
  return user;
};

exports.onSignup = async (user, req) => {
  const vConfig = config.validations;
  const types = vConfig.types || [];

  types.forEach((t) => utils.tryNotify(user, t, req));

  user.markModified('validations');
  return user;
};

exports.onLogin = async () => {};
