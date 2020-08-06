/**
 * Module dependencies.
 */
const _ = require('lodash');
const { resolve } = require('path');
const mongoose = require('mongoose');

const config = require('@config/index');
const validationModule = require('@config/validations');

const { vendor } = config.files.server.modules;

// eslint-disable-next-line import/no-dynamic-require
const errorHandler = require(resolve(`./${vendor}/core/controllers/errors.server.controller`));

const User = mongoose.model('User');

/**
 * Update user details
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.update = async function update(req, res) {
  // Init Variables
  let { user } = req;

  // For security measurement we sanitize the user object
  User.sanitize(req.body);

  // Merge existing user
  user.set(req.body);

  try {
    user = await user.save();
  } catch (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err),
    });
  }

  return res.json(
    user.toJSON({
      virtuals: true,
    }),
  );
};

/**
 * Get profile picture
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.getProfilePicture = async function getProfilePicture(req, res) {
  res.redirect(req.user.profilePictureUrl);
};

/**
 * Update profile picture
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.uploadProfilePicture = async function uploadProfilePicture(req, res, next) {
  const Grid = mongoose.model('Grid');
  const { file, user } = req;
  const { file: f } = file;
  const { _id: userId } = user;
  const { _id: fId } = f;

  try {
    let gridFile = await Grid.findOne({
      _id: fId,
    });
    gridFile.set('metadata', {
      owner: userId,
      type: 'profile',
    });
    gridFile = await gridFile.save();

    req.user.set('picture', gridFile);
    req.user = await req.user.save();
  } catch (e) {
    return next(e);
  }

  return res.json({
    ok: true,
  });
};

/**
 * Filter the profile picture mimeTypes
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.profilePictFilter = async function profilePictFilter(req, file, cb) {
  if (config.app.profile.picture.accept.lastIndexOf(file.mimetype) < 0) {
    return cb(new Error(req.t('USER_PROFILE_PIC_INVALID')));
  }

  return cb(null, true);
};

/**
 * Send User
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.me = async function me(req, res) {
  let { $expand } = req.query;
  const { $select } = req.query;
  const { iams = [] } = req;

  let result = req.user ? req.user.json() : null;

  if (!result) {
    return res.json(result);
  }

  if ($expand) {
    $expand = $expand.split(',').map((attr) => attr.trim());

    if ($expand.includes('iams')) {
      result.iams = iams.map((iam) => {
        const { resource, permission, ...toSend } = iam;
        return toSend;
      });
    }
  }

  if (!result.iams) {
    result.iams = iams.map((iam) => iam.iam);
  }

  if ($select) {
    result = _.pick(result, $select.split(','), 'id');
  }

  return res.json(result);
};

/**
 * Confirmation
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.confirm = async function confirm(req, res) {
  let user;
  const { query } = req;

  if (!query.uid) {
    return res.status(404).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  try {
    user = await User.findById(query.uid);
  } catch (e) {
    return res.status(404).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  if (!user) {
    return res.status(404).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  const { utils } = validationModule;

  try {
    await utils.tryValidate(user, query.type, query.code);
  } catch (e) {
    if (e.code === 'VALIDATIONS!INVALID_CODE') {
      await user.save();
    }

    return res.status(400).send({
      message: req.t(e.code, e.data),
    });
  }

  const baseURL = `${req.protocol}://${req.get('host')}`;

  user = await user.save();

  return res.format({
    'text/html': () => {
      res.render(`${vendor}/users/views/email-confirmed`, {
        app: {
          name: config.app.title,
          url: baseURL,
        },
        user,
      });
    },
    'application/json': () => {
      res.json({
        ok: true,
      });
    },
    default() {
      res.send('Email confirmed');
    },
  });
};

/**
 * Resend the confirmation code
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.resend = async function resend(req, res) {
  let user;
  const { query } = req;

  if (!query.uid) {
    return res.status(404).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  try {
    user = await User.findById(query.uid);
  } catch (e) {
    return res.status(404).send({
      message: req.t('USER_NOT_FOUND'),
    });
  }

  const { utils } = validationModule;

  try {
    await utils.tryNotify(user, query.type, req);
  } catch (e) {
    return res.status(400).send({
      message: req.t(e.code, {
        type: query.type,
      }),
    });
  }

  user = await user.save();

  return res.json({
    ok: true,
  });
};
