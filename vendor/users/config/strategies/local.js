/**
 * Module dependencies.
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('mongoose').model('User');

module.exports = () => {
  // Use local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    ((username, password, done) => {
      User.findOne({
        $or: [{
          username: username.toLowerCase(),
        }, {
          email: username.toLowerCase(),
        }],
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user || !user.authenticate(password)) {
          return done(null, false);
        }

        return done(null, user);
      });
    }),
  ));
};
