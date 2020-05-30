/*
eslint-disable import/no-dynamic-require,import/no-unresolved,import/no-extraneous-dependencies
*/

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const passport = require('passport');

const User = mongoose.model('User');
const errorHandler = require('core/controllers/errors.server.controller');

const validationsHelper = require('@config/validations');
const config = require('@config/index');

// URLs for which user can't be redirected on signin
const noReturnUrls = ['/authentication/signin', '/authentication/signup'];

/**
 * Signup
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.signup = async function signup(req, res, next) {
  // For security measurement we sanitize the user object
  const b = User.sanitize(req.body);

  // Init Variables
  const user = new User(b);
  const { hooks } = validationsHelper;

  await hooks.onInit(user);

  // Add missing user fields
  user.provider = 'local';

  try {
    await user.save();
    hooks.onSignup(user, req);
    await user.save();
  } catch (err) {
    switch (true) {
      case err.code === 11000:
        return res.status(400).json({
          message: req.t('USER_ALREADY_EXISTS'),
        });
      case err.name === 'ValidationError':
        return res.status(400).json({
          message: err.message,
        });
      default:
        return next(err);
    }
  }

  req.user = user;

  return next();
};

/**
 * Signin after passport authentication
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.signin = async function signin(req, res, next) {
  passport.authenticate('local', (err, user /* , info */) => {
    if (err || !user) {
      return res.status(401).json({
        ok: false,
        message: req.t('WRONG_CREDENTIALS'),
      });
    }

    const { utils, hooks } = validationsHelper;

    try {
      utils.isValidated(user);
    } catch (err_) {
      return res.status(401).json({
        message: req.t(err_.code, err_.data),
        ok: false,
      });
    }

    return req.login(user, async (err_) => {
      if (err_) {
        return res.status(400).send(err_);
      }

      await hooks.onLogin(req, user);

      return next(null);
    });
  })(req, res, next);
};

/**
 * Signout
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.signout = async function signout(req, res) {
  req.logout();
  res.redirect(config.app.pages.login || '/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = (strategy, scope) =>
  async function oauthCall(req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };

/**
 * OAuth callback
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.oauthCallback = (strategy) =>
  async function oauthCall(req, res, next) {
    // Pop redirect URL from session
    const sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, (err, user, redirectURL) => {
      if (err) {
        return res.redirect(
          `/authentication/signin?err=${encodeURIComponent(errorHandler.getErrorMessage(err))}`,
        );
      }

      if (!user) {
        return res.redirect('/authentication/signin');
      }

      return req.login(user, (err_) => {
        if (err_) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };

/**
 * Helper function to save or update a OAuth user profile
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.saveOAuthUserProfile = (req, providerUserProfile, done) => {
  if (!req.user) {
    // Define a search query fields
    const smpif = `providerData.${providerUserProfile.providerIdentifierField}`;
    const sapif = `additionalProvidersData.${providerUserProfile.provider}.${providerUserProfile.providerIdentifierField}`;

    // Define main provider search query
    const msq = {};
    msq.provider = providerUserProfile.provider;
    msq[smpif] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    const apsq = {};
    apsq[sapif] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    const searchQuery = {
      $or: [msq, apsq],
    };

    User.findOne(searchQuery, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        const possibleUsername =
          providerUserProfile.username ||
          (providerUserProfile.email ? providerUserProfile.email.split('@')[0] : '');

        return User.findUniqueUsername(possibleUsername, null, () => {
          const userTmp = new User({
            name: {
              first: providerUserProfile.firstName,
              last: providerUserProfile.lastName,
            },
            email: providerUserProfile.email,
            profilePictureUrl: providerUserProfile.profilePictureUrl,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData,
          });

          // And save the user
          userTmp.save((err_) => done(err_, userTmp));
        });
      }

      return done(err, user);
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    const userTmp = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't
    // have that provider data already configured
    if (
      userTmp.provider !== providerUserProfile.provider &&
      (!userTmp.additionalProvidersData ||
        !userTmp.additionalProvidersData[providerUserProfile.provider])
    ) {
      // Add the provider data to the additional provider data field
      if (!userTmp.additionalProvidersData) {
        userTmp.additionalProvidersData = {};
      }

      userTmp.additionalProvidersData[providerUserProfile.provider] =
        providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      userTmp.markModified('additionalProvidersData');

      // And save the user
      userTmp.save((err) => done(err, userTmp, '/settings/accounts'));
    } else {
      return done(new Error(req.t('USER_PROVIDER_ALREADY_CONNECTED')), req.user);
    }
  }

  return null;
};

/**
 * Remove OAuth provider
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.removeOAuthProvider = async function removeOAuthProvider(req, res) {
  const { user } = req;
  const { provider } = req.query;

  if (!user) {
    return res.status(401).json({
      message: req.t('USER_NOT_LOGGEDIN'),
    });
  }
  if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  return user.save((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err),
      });
    }
    return req.login(user, (err_) => {
      if (err_) {
        return res.status(400).send(err_);
      }

      return res.json(
        user.toJSON({
          virtuals: true,
        }),
      );
    });
  });
};
