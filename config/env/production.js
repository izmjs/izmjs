const { resolve } = require('path');

module.exports = {
  port: process.env.PORT || 8443,
  db: {
    uri:
      process.env.MONGODB_URI ||
      process.env.MONGOHQ_URL ||
      process.env.MONGOLAB_URI ||
      `mongodb://${process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost'}/app`,
    options: {
      auth: process.env.MONGODB_USERNAME ? { authSource: 'admin' } : undefined,
      user: process.env.MONGODB_USERNAME || '',
      pass: process.env.MONGODB_PASSWORD || '',
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false,
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: process.env.LOG_FORMAT || 'combined',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      stream: {
        directoryPath: process.env.LOG_DIR_PATH || resolve('logs'),
        fileName: process.env.LOG_FILE || 'access.log',
        rotatingLogs: {
          // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
          active: process.env.LOG_ROTATING_ACTIVE === 'true', // activate to use rotating logs
          fileName: process.env.LOG_ROTATING_FILE || 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
          frequency: process.env.LOG_ROTATING_FREQUENCY || 'daily',
          verbose: process.env.LOG_ROTATING_VERBOSE === 'true',
        },
      },
    },
  },
};
