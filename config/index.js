/*
eslint-disable import/no-dynamic-require,global-require
*/

/**
 * Module dependencies.
 */
const _ = require('lodash');
const chalk = require('chalk');
const glob = require('glob');
const { existsSync } = require('fs');
const { resolve, join } = require('path');
const debug = require('debug')('app:config');

const Environment = require('./lib/env-vars');

const SKIP_MODULES = (process.env.SKIP_MODULES || '').split(',').filter(Boolean);

/**
 * Get files by glob patterns
 */
function getGlobbedPaths(globPatterns, excludes) {
  // URL paths regex
  const urlRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

  // The output array
  let output = [];

  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
  if (_.isArray(globPatterns)) {
    globPatterns.forEach((globPattern) => {
      output = _.union(output, getGlobbedPaths(globPattern, excludes));
    });
  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      let files = glob.sync(globPatterns);
      if (excludes) {
        files = files.map((file) => {
          let f = file;
          if (_.isArray(excludes)) {
            excludes.forEach((e) => {
              f = file.replace(e, '');
            });
          } else {
            f = file.replace(excludes, '');
          }
          return f;
        });
      }
      output = _.union(output, files);
    }
  }

  return output;
}

/**
 * Validate NODE_ENV existence
 */
function validateEnvironmentVariable() {
  const environmentFiles = glob.sync(`./config/env/${process.env.NODE_ENV}.js`);

  if (!environmentFiles.length) {
    if (process.env.NODE_ENV) {
      console.error(
        chalk.red(
          `+ Error: No configuration file found for "${process.env.NODE_ENV}" environment using development instead`,
        ),
      );
    } else {
      console.error(
        chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'),
      );
    }
    process.env.NODE_ENV = 'development';
  }
  // Reset console color
  chalk.white('');
}

/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
function validateSecureMode(config) {
  if (!config.secure || config.secure.ssl !== true) {
    return true;
  }

  const privateKey = existsSync(resolve(config.secure.privateKey));
  const certificate = existsSync(resolve(config.secure.certificate));

  if (!privateKey || !certificate) {
    debug(
      chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'),
    );
    debug(
      chalk.red(
        '  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh',
      ),
    );

    _.merge(config.secure, {
      ssl: false,
    });
  }

  return true;
}

/**
 * Validate Session Secret parameter is not set to default in production
 */
function validateSessionSecret(config, testing) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (config.session.secret === 'DEFAULT_SESSION_SECRET') {
    if (!testing) {
      debug(
        chalk.red(
          '+ WARNING: It is strongly recommended that you change session secret while running in production!',
        ),
      );
      debug(
        chalk.red(
          'Please add `SESSION_SECRET=super amazing secret` to `.env/.production.env`',
        ),
      );
    }
    return false;
  }
  return true;
}

/**
 * Initialize global configuration files
 */
function initGlobalConfigFiles(config, assets) {
  const { modules } = assets;

  // Appending files
  _.merge(config, {
    files: {
      server: {
        modules,
        // Setting Globbed model files
        models: getGlobbedPaths(assets.server.models),

        // Setting Globbed route files
        routes: getGlobbedPaths(assets.server.routes),

        // Setting Globbed config files
        configs: getGlobbedPaths(assets.server.config),

        // Setting Globbed config files
        appConfigs: getGlobbedPaths(assets.server.appConfig),

        // Setting Globbed Identity Access Management (IAM) files
        iam: getGlobbedPaths(assets.server.iam),

        // Setting Globbed Identity Access Management (IAM) json files
        iams: getGlobbedPaths(assets.server.iams),

        // Setting Bootstrap files
        bootstraps: getGlobbedPaths(assets.server.bootstraps),

        // Setting Bootstrap files
        sockets: getGlobbedPaths(assets.server.sockets),

        // Setting Bootstrap files
        socketsConfig: getGlobbedPaths(assets.server.socketsConfig),
      },
    },
  });

  if (SKIP_MODULES.length > 0) {
    const { server } = config.files;
    Object.keys(server).forEach((attr) => {
      const current = server[attr];
      if (Array.isArray(current)) {
        server[attr] = server[attr].filter((file) => {
          const isToSkip = SKIP_MODULES.find((mName) => file.startsWith(mName));
          return !isToSkip;
        });
      }
    });
  }
}

/**
 * Load env files
 * @param {Object} assets All assets
 */
function loadEnv(assets) {
  const env = new Environment(process.env.NODE_ENV);
  const files = getGlobbedPaths(assets.server.env);

  files.forEach((f) => {
    const m = require(resolve(f));
    Object.keys(m).forEach((key) => {
      const { scope, schema, ...item } = m[key];
      env.set(
        {
          ...item,
          key,
        },
        schema,
        scope,
      );
    });
  });

  return env;
}

/**
 * Merge modules configuration with the global configuration
 * @param {Object} config The current configuration
 */
function mergeModulesConfig(config) {
  const { appConfigs } = config.files.server;

  let result = config;

  // Loop over configurations and merge (deeply) the configuration with the current one
  if (Array.isArray(appConfigs)) {
    appConfigs.forEach((mPath) => {
      // require the module
      const m = require(resolve(mPath));

      // check if the module exports a function
      if (typeof m === 'function') {
        const c = m(config);
        // Deeply merge the configuration
        result = _.defaultsDeep(result, c);
      }
    });
  }

  // Return the constructed configuration
  return result;
}

/**
 * Initialize global configuration
 */
function initGlobalConfig() {
  // Validate NODE_ENV existence
  validateEnvironmentVariable();

  // Get the default assets
  const defaultAssets = require(join(process.cwd(), 'config/assets/default'));

  // Get the current assets
  const environmentAssets =
    require(join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

  // Merge assets
  const assets = _.merge(defaultAssets, environmentAssets);

  // Load functional modules env files
  const env = loadEnv(assets);

  // Get the default config
  const defaultConfig = require(join(process.cwd(), 'config/env/default'));

  // Get the current config
  const environmentConfig = require(join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

  // Expose configuration utilities
  const utils = {
    getGlobbedPaths,
    validateSessionSecret,
    env,
  };

  // Merge config files
  let config = _.merge({ utils }, defaultConfig, environmentConfig);

  // read package.json for MAIN project information
  const pkg = require(resolve('./package.json'));
  config.pkg = pkg;

  // We only extend the config object with the local.js custom/local environment if we are on
  // production or development environment. If test environment is used we don't merge it with
  // local.js to avoid running test suites on a prod/dev environment (which delete records and make
  // modifications)
  if (process.env.NODE_ENV !== 'test') {
    config = _.merge(
      config,
      (existsSync(join(process.cwd(), 'config/env/local.js')) &&
        require(join(process.cwd(), 'config/env/local.js'))) ||
        {},
    );
  }

  // Initialize global globbed files
  initGlobalConfigFiles(config, assets);

  // Merge modules configuration with the global confiuration
  config = mergeModulesConfig(config);

  // Validate Secure SSL mode can be used
  validateSecureMode(config);

  // Validate session secret
  validateSessionSecret(config);

  return config;
}

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
