/* eslint-disable import/no-dynamic-require */

/**
 * Module dependencies.
 */
const { resolve } = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { promisify } = require('util');
const { renderString } = require('nunjucks');

const config = require('@config/index');

const User = mongoose.model('User');

const { vendor } = config.files.server.modules;

/**
 * Forgot for reset password (forgot POST)
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.forgot = async function forgot(req, res, next) {
  if (!req.body.username) {
    return res.status(422).send({
      message: req.t('USER_BLANK_USERNAME'),
    });
  }

  let user;

  try {
    user = await User.findOne(
      {
        $or: [
          {
            email: req.body.username.toLowerCase(),
          },
          {
            username: req.body.username.toLowerCase(),
          },
        ],
      },
      '-salt -password',
    );
  } catch (e) {
    return next(e);
  }

  if (!user) {
    return res.status(400).send({
      message: req.t('USER_USERNAME_NOT_FOUND', {
        username: req.body.username,
      }),
    });
  }

  if (user.provider !== 'local') {
    return res.status(400).send({
      message: req.t('USER_NOT_LOCAL', user.toJSON()),
    });
  }

  const token = (await promisify(crypto.randomBytes)(20)).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  try {
    await user.save();
  } catch (e) {
    return next(e);
  }

  const render = promisify(res.render);

  try {
    const html = await render.bind(res)(resolve(`${vendor}/users/views/reset-password-email`), {
      user,
      app: config.app,
      url: renderString(config.links.resetPwd, {
        app: config.app,
        user,
        token,
      }),
    });
    user.sendMail('Password Reset', html);
  } catch (e) {
    return next(e);
  }

  return res.send({
    message: req.t('USER_EMAIL_SENT'),
  });
};

/**
 * Reset password GET from email token
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.validateResetToken = async function validateResetToken(req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    },
    (err, user) => {
      if (err || !user) {
        return res.redirect('/password/reset/invalid');
      }

      return res.redirect(`/password/reset/${req.params.token}`);
    },
  );
};

/**
 * Reset password POST from email token
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.reset = async function reset(req, res, next) {
  // Init Variables
  const passwordDetails = req.body;
  let user;

  try {
    user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });
  } catch (e) {
    return next(e);
  }

  if (!user) {
    return res.status(400).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  if (passwordDetails.newPassword !== passwordDetails.verifyPassword) {
    return res.status(400).send({
      message: req.t('USER_PASSWORD_NOT_MATCH'),
    });
  }

  user.password = passwordDetails.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  try {
    await user.save();
  } catch (e) {
    return next(e);
  }

  req.login(user, (e) => {
    if (e) {
      return next(e);
    }

    // Remove sensitive data before return authenticated user
    user.password = undefined;
    user.salt = undefined;
    user.validations = undefined;

    return res.json(
      user.toJSON({
        virtuals: true,
      }),
    );
  });

  return res.render(
    `${vendor}/users/templates/reset-password-confirm-email`,
    {
      name: user.name.full,
      appName: config.app.title,
    },
    (err, emailHTML) => {
      if (emailHTML) {
        user.sendMail(req.t('USER_PASSWORD_CHANGED'), emailHTML);
      }
    },
  );
};

/**
 * Change Password
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.changePassword = async function changePassword(req, res, next) {
  // Init Variables
  const passwordDetails = req.body;

  if (!req.user) {
    return res.status(401).send({
      message: req.t('USER_NOT_LOGGEDIN'),
    });
  }

  if (!passwordDetails.newPassword) {
    return res.status(422).send({
      message: req.t('USER_PASSWORD_NEW'),
    });
  }

  let user;
  const login = promisify(req.login).bind(req);

  try {
    user = await User.findById(req.user.id);
  } catch (e) {
    return next(e);
  }

  if (!user) {
    return res.status(400).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  if (!user.authenticate(passwordDetails.currentPassword)) {
    return res.status(400).send({
      message: req.t('USER_PASSWORD_INCORRECT'),
    });
  }

  if (passwordDetails.newPassword !== passwordDetails.verifyPassword) {
    return res.status(400).send({
      message: req.t('USER_PASSWORD_NOT_MATCH'),
    });
  }

  user.password = passwordDetails.newPassword;

  try {
    await user.save();
    await login(user);
  } catch (e) {
    return next(e);
  }

  return res.send({
    message: req.t('USER_PASSWORD_CHANGED_SUCCESS'),
  });
};
