const { resolve, relative } = require('path');
const { existsSync } = require('fs');
const nunjucks = require('nunjucks');

let manifest = {};

try {
  // eslint-disable-next-line import/no-dynamic-require,global-require
  manifest = require(resolve('.env/templates.manifest'));
} catch (e) {
  manifest = {};
}

/**
 * Render a custom template
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
module.exports = function rndr(req, res, next) {
  res.rndr = (tpl, ...args) => {
    let tplPath = relative(resolve(), tpl);
    tplPath = manifest[tplPath];

    if (!tplPath || typeof tplPath !== 'string') {
      return res.render(tpl, ...args);
    }

    tplPath = nunjucks.renderString(tplPath, { req });
    tplPath = `${tplPath}.${req.app.get('view engine')}`;

    if (!existsSync(tplPath)) {
      return res.render(tpl, ...args);
    }

    return res.render(tplPath, ...args);
  };

  return next();
};
