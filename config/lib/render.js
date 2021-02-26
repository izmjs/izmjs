const { resolve, relative } = require('path');
const { existsSync } = require('fs');
const nunjucks = require('nunjucks');

const manifest = require('./views');

/**
 * Get real template path
 * @param {string} tpl The origin template
 * @param {import('express').Request} req The user request
 */
function getRealTemplate(tpl, req) {
  let tplPath = relative(resolve(), tpl);
  tplPath = manifest[tplPath];

  if (!tplPath || typeof tplPath !== 'string') {
    return tpl;
  }

  tplPath = nunjucks.renderString(tplPath, { req });
  tplPath = `${tplPath}.${req.app.get('view engine')}`;

  if (!existsSync(tplPath)) {
    return tpl;
  }

  return tplPath;
}

/**
 * Render a custom template
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
module.exports = function rndr(req, res, next) {
  res.rndr = (tpl, ...args) => {
    const tplPath = getRealTemplate(tpl, req);
    return res.render(tplPath, ...args);
  };

  req.rndr = (tpl, ...args) => {
    const tplPath = getRealTemplate(tpl, req);
    return nunjucks.render(tplPath, ...args);
  };

  return next();
};
