const { resolve } = require('path');

// eslint-disable-next-line import/no-dynamic-require
const config = require(resolve('config'));
const { vendor } = config.files.server.modules;

/**
 * Render the main application page
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.renderIndex = async function renderIndex(req, res) {
  res.render(`${vendor}/core/views/index`, {
    user: req.user ? req.user.toJSON({ virtuals: true }) : null,
  });
};

/**
 * Render the server error page
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.renderServerError = async function renderServerError(req, res) {
  req.i18n.setDefaultNamespace('vendor:core');
  res.status(500).render(`${vendor}/core/views/500`, {
    title: req.t('ERROR_500_TITLE'),
    error: req.t('ERROR_500'),
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 * @param {IncommingMessage} req The request
 * @param {OutcommingMessage} res The response
 * @param {Function} next Go to the next middleware
 */
exports.renderNotFound = async function renderNotFound(req, res) {
  req.i18n.setDefaultNamespace('vendor:core');
  res.status(404).format({
    'text/html': () => {
      res.render(`${vendor}/core/views/404`, {
        title: req.t('PAGE_NOT_FOUND_TITLE'),
        details: req.t('PAGE_NOT_FOUND_DETAILS', {
          url: req.originalUrl,
        }),
      });
    },
    'application/json': () => {
      res.json({
        error: req.t('ERROR_404'),
      });
    },
    default() {
      res.send(req.t('ERROR_404'));
    },
  });
};
