const _ = require('lodash');
const mongoose = require('mongoose');
const chalk = require('chalk');

const config = require('..');

async function seed(collection, options) {
  // Merge options with collection options
  // eslint-disable-next-line
  options = _.merge(options || {}, collection.options || {});

  const Model = mongoose.model(collection.model);
  const {
    docs,
  } = collection;
  const skipWhen = collection.skip ? collection.skip.when : null;

  if (!Model.seed) {
    throw new Error(`Database Seeding: Invalid Model Configuration - ${collection.model}.seed() not implemented`);
  }

  if (!docs || !docs.length) {
    return;
  }

  async function skipCollection() {
    if (!skipWhen) {
      return false;
    }

    const results = await Model.find(skipWhen);
    return results && results.length;
  }

  async function seedDocuments(skipCollection_) {
    function onComplete(responses) {
      if (options.logResults) {
        responses.forEach((response) => {
          if (response.message) {
            console.info(chalk.magenta(response.message));
          }
        });
      }
    }

    if (skipCollection_) {
      return onComplete([{
        message: chalk.yellow(`Database Seeding: ${collection.model} collection skipped`),
      }]);
    }

    const workload = docs
      .filter((doc) => doc.data)
      .map((doc) => Model.seed(doc.data, {
        overwrite: doc.overwrite,
      }));

    return onComplete(await Promise.all(workload));
  }

  // First check if we should skip this collection
  // based on the collection's "skip.when" option.
  // NOTE: If it exists, "skip.when" should be a qualified
  // Mongoose query that will be used with Model.find().
  const tmp = await skipCollection();
  await seedDocuments(tmp);
}

function start(seedConfig) {
  return new Promise(((resolve, reject) => {
    const seedConfigTmp = seedConfig || {};

    const options = seedConfigTmp.options
      || (config.seedDB ? _.clone(config.seedDB.options, true) : {});
    const collections = seedConfigTmp.collections
      || (config.seedDB ? _.clone(config.seedDB.collections, true) : []);

    if (!collections.length) {
      return resolve();
    }

    const seeds = collections
      .filter((collection) => collection.model);

    // Local Promise handlers

    function onSuccessComplete() {
      if (options.logResults) {
        console.info();
        console.info(chalk.bold.green('Database Seeding: Mongo Seed complete!'));
        console.info();
      }

      return resolve();
    }

    function onError(err) {
      if (options.logResults) {
        console.info();
        console.info(chalk.bold.red('Database Seeding: Mongo Seed Failed!'));
        console.info(chalk.bold.red(`Database Seeding: ${err}`));
        console.info();
      }

      return reject(err);
    }

    // Use the reduction pattern to ensure we process seeding in desired order.
    // start with resolved promise for initial previous (p) item
    return seeds.reduce((p, item) => p.then(() => seed(item, options)), Promise.resolve())
      .then(onSuccessComplete)
      .catch(onError);
  }));
}

exports.start = start;
