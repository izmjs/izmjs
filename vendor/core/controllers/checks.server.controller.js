/**
 * Simple request check, just send a "true" word
 * @param {Express.Request} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.ok = async function ok(req, res) {
  res.json(true);
};
