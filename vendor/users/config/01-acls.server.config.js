const chalk = require('chalk');
const { resolve } = require('path');
const express = require('express');
const debug = require('debug')('vendor:users:config:acls');
const { isExcluded } = require('@helpers/utils');

const Iam = require('../helpers/iam.server.helper');

function hasIam(iams, isAll = true) {
  return (...iamNames) => {
    const found = iams.filter(({ iam }) => iamNames.includes(iam));
    return isAll === true ? found.length === iamNames.length : found.length > 0;
  };
}

/**
 * Configure the modules server routes
 */
module.exports = (app, db, config) => {
  const regex = /^([a-zA-Z0-9]*)\/([^/]*)/;
  const iam = new Iam();

  app.use(async (req, res, next) => {
    const { iams } = req;
    let allIAMs;
    const roles = req.user && Array.isArray(req.user.roles) ? req.user.roles : ['guest'];

    try {
      allIAMs = await iam.IAMsFromRoles(roles);
      req.iams = allIAMs.map((item) => ({ ...item, resource: new RegExp(item.resource, 'i') }));
    } catch (e) {
      return next(e);
    }

    if (Array.isArray(iams)) {
      req.iams = req.iams.filter((one) => iams.includes(one.iam));
      const children = req.iams.reduce((prev, cur, index, arr) => {
        const result = [...prev];
        const { children: ch = [] } = cur;
        ch.forEach((one) => {
          const str = one.toString();
          if (!result.includes(str) && !arr.find(({ id }) => str === id)) {
            result.push(str);
          }
        });

        return result;
      }, []);
      req.iams = Array.prototype.concat.apply(
        req.iams,
        allIAMs.filter(({ id }) => children.includes(id)),
      );
    }

    req.hasAllIams = hasIam(req.iams, true);
    req.hasAnyIam = hasIam(req.iams, false);

    return next();
  });

  function isAllowed(route) {
    let allIAMs;
    return async (req, res, next) => {
      const { iams, user, hasAllIams } = req;
      const method = req.method.toLowerCase();
      const roles = user && Array.isArray(user.roles) ? user.roles : ['guest'];

      const index = iams.findIndex((item) => {
        const { permission, resource } = item;

        if (resource instanceof RegExp) {
          return (
            resource.test(req.baseUrl + req.route.path) &&
            (permission === 'all' || permission === '*' || method === permission) &&
            (!route.methods[method] || hasAllIams(route.methods[method].iam))
          );
        }

        if (typeof resource === 'string') {
          return (
            new RegExp(resource).test(req.baseUrl + req.route.path) &&
            method === permission &&
            (!route.methods[method] || hasAllIams(route.methods[method].iam))
          );
        }

        return false;
      });

      if (index >= 0) {
        return next();
      }

      if (!allIAMs) {
        try {
          allIAMs = await iam.IamModel.find();
        } catch (e) {
          // Do nothing, proceed
        }
      }

      const found = (allIAMs || []).find(
        (one) =>
          one.resource &&
          new RegExp(one.resource).test(req.baseUrl + req.route.path) &&
          (one.permission === 'all' ||
            one.permission === '*' ||
            one.permission === req.method.toLowerCase()) &&
          !one.excluded,
      );

      if (!found) {
        return res.status(404).json({
          message: 'Not Found',
        });
      }

      if (roles.length <= 1 && (!roles[0] || roles[0] === 'guest')) {
        return res.status(401).json({
          message: 'User is not signed in',
        });
      }

      return res.status(403).json({
        message: 'User is not authorized',
      });
    };
  }

  // Globbing routing files
  config.files.server.iam.forEach((routePath) => {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const m = require(resolve(routePath));
    const r = express.Router();
    const exec = regex.exec(routePath);

    // Detect the namespace
    r.use((req, res, next) => {
      if (exec) {
        req.i18n.setDefaultNamespace(`${exec[1]}:${exec[2]}`);
      }

      next();
    });

    // Add the before middlewares
    if (Array.isArray(m.before)) {
      m.before.forEach((middleware) => {
        r.use(middleware);
      });
    }

    // Parse the routes
    if (Array.isArray(m.routes)) {
      m.routes.forEach((route) => {
        if (
          !route ||
          typeof route !== 'object' ||
          !route.methods ||
          typeof route.methods !== 'object' ||
          !route.path
        ) {
          console.warn('Invalid route', route);
          return;
        }

        let routeTmp = r.route(route.path);
        let allMiddlwares = route.all || route['*'];

        if (allMiddlwares && !Array.isArray(allMiddlwares)) {
          allMiddlwares = [allMiddlwares];
        }

        if (!Array.isArray(allMiddlwares)) {
          allMiddlwares = [];
        }

        // Add the isAllowed middleware to all subroutes
        allMiddlwares.unshift(isAllowed(route));

        // Add 'all' middlewares
        routeTmp = routeTmp.all(allMiddlwares);

        // Scan the routes
        Object.keys(route.methods).forEach(async (k) => {
          if (
            typeof routeTmp[k] === 'function' &&
            Object.prototype.hasOwnProperty.call(route.methods, k) &&
            route.methods[k] &&
            typeof route.methods[k] === 'object' &&
            route.methods[k].middlewares
          ) {
            const method = route.methods[k];

            try {
              // Add the method middleware
              const { found, reason, data } = await isExcluded(method);
              if (!found) {
                routeTmp[k](method.middlewares);
              } else {
                debug(
                  chalk.yellow(`
IAM  excluded:
IAM     : ${method.iam}
Reason  : ${reason}
Data    : ${data}`),
                );
              }
            } catch (e) {
              const routes = method.middlewares.map((middleware) => {
                const result = typeof middleware === 'function' ? '⨍' : 'null';
                return result;
              });
              console.error(`
Error while adding route:

${chalk.red('Route')}   : ${route.path}
${chalk.red('Module')}  : ${routePath}
${chalk.red('Method')}  : ${k}
${chalk.red('Routes')}  : [${routes.join(' , ')}]

Please check your IAM configuraion
`);
              process.exit(1);
            }
          }
        });
      });
    }

    // Add the params middlewares
    if (Array.isArray(m.params)) {
      m.params.forEach((p) => {
        r.param(p.name, p.middleware);
      });
    }

    // Add the after middlewares
    if (Array.isArray(m.after)) {
      m.after.forEach((middleware) => {
        r.use(middleware);
      });
    }

    // Add the router to the app with the prefix
    if (m.is_global === true) {
      app.use(m.prefix, r);
    } else {
      app.use(config.app.prefix + m.prefix, r);
    }
  });
};
