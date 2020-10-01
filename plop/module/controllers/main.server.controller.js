/**
 * Check if the module "{{{lowercase name}}}" is up and running
 * @controller Check "{{{lowercase name}}}" module
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 */
exports.ok = async function ok(req, res) {
  res.json(true);
};
