/**
 * Module dependencies.
 */
const mongoose = require('mongoose');

const User = mongoose.model('User');

/**
 * User middleware
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.userByID = async function userByID(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: req.t('USER_INVALID', {
        id,
      }),
    });
  }

  return User.findOne({
    _id: id,
  }).exec((err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(
        new Error(
          req.t('USER_LOAD_FAILED', {
            id,
          }),
        ),
      );
    }

    req.profile = user;
    return next();
  });
};
