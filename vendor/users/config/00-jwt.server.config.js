const { model, Types } = require('mongoose');
const jwt = require('jsonwebtoken');

const { jwt: config } = require('@config/index');

const User = model('User');

/**
 * Module init function.
 */
module.exports = (app) => {
  if (!config.enabled) {
    return false;
  }

  const { public: pub, private: pr } = config.key;

  app.use(
    /**
     * @param {import('express').Request} req The request
     * @param {import('express').Response} res The response
     * @param {import('express').NextFunction} next Go to next middleware
     */
    async function onRequest(req, res, next) {
      let decoded;
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next();
      }

      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer' || !token) {
        return next();
      }

      try {
        decoded = jwt.verify(token, pub || pr);
      } catch (e) {
        return next();
      }

      if (!decoded || !Types.ObjectId.isValid(decoded.u)) {
        return next();
      }

      try {
        req.user = await User.findById(decoded.u);
      } catch (e) {
        return next(e);
      }

      return next();
    },
  );

  return true;
};
