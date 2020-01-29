const { resolve } = require('path');

/**
 * Check if the module "{{{lowercase name}}}" is up and running
 * @controller Check "{{{lowercase name}}}" module
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 */
exports.ok = async function ok(req, res) {
  res.render(resolve(__dirname, '../views/main'), {
    title: '{{{lowercase name}}}',
    description: req.t('IS_OK'),
    cssFiles: ['https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'],
  });
};
