/**
 * Module dependencies.
 */
const { green, red } = require('chalk');
const cluster = require('cluster');
const debug = require('debug')('app:config:lib:app');

const config = require('..');
const mongoose = require('./mongoose');
const express = require('./express');

mongoose.loadModels();

module.exports.loadModels = function loadModels() {
  mongoose.loadModels();
};

module.exports.init = function init(callback) {
  mongoose.connect(async (err, db) => {
    if (err) {
      return process.exit(1);
    }

    // Initialize express
    const app = await express.init(db);
    if (callback) callback(app, db, config);

    return true;
  });
};

module.exports.start = async function start(callback) {
  const { port, host, prefix, cluster: clusterConfig } = config.app;
  const { enabled, maxWorkers } = clusterConfig;

  if (enabled && cluster.isMaster) {
    // Fork workers.
    for (let i = 0; i < maxWorkers; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      debug(`worker ${worker.process.pid} died`);
    });
  } else {
    this.init((app, db) => {
      // Start the app by listening on <port>
      const server = app.listen(port, host, () => {
        const { port: p, address } = server.address();
        const { secure, publicAddress, cors } = config.app;
        // Logging initialization
        const addr = `http${secure.ssl ? 's' : ''}://${address}:${p}`;

        debug(`--
${green('HTTPs          : ')}${secure.ssl ? green('✓') : red('𐄂')}
${green(`Address        : ${addr}`)}
${green('Cluster        : ')}${enabled ? green('✓') : red('𐄂')}
${green(`Database       : ${config.db.uri}`)}
${green(`API Prefix     : ${prefix}`)}
${green(`Environment    : ${process.env.NODE_ENV}`)}
${green(`App version    : ${config.pkg.version}`)}
${green('CORS disabled  : ')}${cors.enabled ? red('𐄂') : green('✓')}
${green(`Public address : ${publicAddress}`)}
--`);

        if (callback) callback(app, db, config);
      });
    });
  }
};
