/**
 * Simple request check, just send a "true" word
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.ok = async function ok(req, res) {
  res.json(true);
};
