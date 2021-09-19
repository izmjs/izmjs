/* eslint-disable import/no-dynamic-require,global-require,no-restricted-globals */
/**
 * Module dependencies.
 */
const chalk = require('chalk');
const path = require('path');
const mongoose = require('mongoose');
const config = require('..');

// Load the mongoose models
module.exports.loadModels = (callback) => {
  // Globbing model files
  config.files.server.models.forEach((modelPath) => {
    require(path.resolve(modelPath));
  });

  if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = (callback) => {
  mongoose.Promise = global.Promise;

  mongoose
    .connect(config.db.uri, {
      ...config.db.options,
      autoIndex: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (callback) callback(null, mongoose.connection.db);
    })
    .catch((err) => {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.error(err);
      if (callback) callback(err);
    });
};

process.on('uncaughtException', (err) => {
  console.error(err);
  if (err.name === 'MongoError' && err.codeName === 'DuplicateKey') {
    // Do nothing
  } else {
    process.exit(0);
  }
});

module.exports.disconnect = (cb) => {
  mongoose.connection.close((err) => {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    return cb(err);
  });
};

/**
 * @returns {{ value: T[]; top: number; skip: number; count: number }}
 */
mongoose.Query.prototype.paginate = async function paginate({ top = 10, skip = 0 }) {
  const t = Number.isNaN(top) ? 10 : parseInt(top, 10);
  const s = Number.isNaN(skip) ? 10 : parseInt(skip, 10);

  if (t >= 0) {
    this.limit(t);
  }

  if (s >= 0) {
    this.skip(s);
  }

  const result = await Promise.all([
    this.exec(),
    this.model.find(this.getQuery()).countDocuments(),
  ]);

  return {
    top: t >= 0 ? t : result[1],
    skip: s >= 0 ? s : 0,
    value: result[0],
    count: result[1],
  };
};

/**
 * @returns {{ value: T[]; top: number; skip: number; count: number }}
 */
mongoose.Aggregate.prototype.paginate = async function aggregationPaginate({ top = 10, skip = 0 }) {
  const t = Number.isNaN(top) ? 10 : parseInt(top, 10);
  const s = Number.isNaN(skip) ? 10 : parseInt(skip, 10);
  const pipeline = this.pipeline();

  const countResult = await this.count('__docs_count__');
  let count = 0;

  if (countResult && countResult.length > 0) {
    [{ __docs_count__: count }] = countResult;
  }

  if (count === 0) {
    return {
      top: t >= 0 ? t : count,
      skip: s >= 0 ? s : 0,
      value: [],
      count,
    };
  }

  const result = this.model().aggregate(pipeline);

  if (s >= 0) {
    result.skip(s);
  }

  if (t >= 0) {
    result.limit(t);
  }

  const value = await result.exec();

  return {
    top: t >= 0 ? t : count,
    skip: s >= 0 ? s : 0,
    value,
    count,
  };
};
