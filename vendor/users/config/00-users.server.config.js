/* eslint-disable import/no-dynamic-require,global-require */

/**
 * Module dependencies.
 */
const passport = require('passport');
const mongoose = require('mongoose');
const { resolve, join } = require('path');

const User = mongoose.model('User');
const config = require(resolve('./config'));

/**
 * Module init function.
 */
module.exports = (app) => {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize sessions
  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id,
    })
      .select(config.app.profile.private_attrs.map((attr) => `-${attr}`).join(' '))
      .exec((err, user) => {
        done(err, user);
      });
  });

  // Initialize strategies
  config.utils.getGlobbedPaths(join(__dirname, './strategies/**/*.js')).forEach((strategy) => {
    require(resolve(strategy))(config);
  });

  // Add passport's middleware
  app.use(passport.initialize());
  app.use(passport.session());
};
