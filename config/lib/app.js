/* eslint-disable no-console */

/**
 * Module dependencies.
 */
const chalk = require('chalk');
const debug = require('debug')('config:lib:app');

const config = require('..');
const mongoose = require('./mongoose');
const express = require('./express');

mongoose.loadModels();

module.exports.loadModels = function loadModels() {
  mongoose.loadModels();
};

module.exports.init = function init(callback) {
  mongoose.connect(async (db) => {
    // Initialize express
    const app = await express.init(db);
    if (callback) callback(app, db, config);
  });
};

module.exports.start = function start(callback) {
  this.init((app, db) => {
    // Start the app by listening on <port>
    const server = app.listen(config.port, config.host, () => {
      const { port, address } = server.address();
      // Logging initialization
      debug('--');
      const addr = `http${config.secure && config.secure.ssl ? 's' : ''}://${address}:${port}`;
      debug(chalk.green(`Address:\t\t\t${addr}`));
      if (config.secure.ssl) {
        debug(chalk.green('HTTPs:\t\t\t\ton'));
      }
      debug(chalk.green(`Database:\t\t\t${config.db.uri}`));
      debug(chalk.green(`Environment:\t\t\t${process.env.NODE_ENV}`));
      debug(chalk.green(`App version:\t\t\t${config.pkg.version}`));
      debug(chalk.green(`Public address:\t\t${config.app.publicAddress}`));
      debug('--');

      if (callback) callback(app, db, config);
    });
  });
};
