
module.exports = {
  port: process.env.PORT || 8443,
  db: {
    uri: process.env.MONGODB_URI
      || process.env.MONGOHQ_URL
      || process.env.MONGOLAB_URI
      || `mongodb://${process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost'}/app`,
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
        directoryPath: process.env.LOG_DIR_PATH || process.cwd(),
        fileName: process.env.LOG_FILE || 'access.log',
        rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
          active: process.env.LOG_ROTATING_ACTIVE === 'true', // activate to use rotating logs
          fileName: process.env.LOG_ROTATING_FILE || 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
          frequency: process.env.LOG_ROTATING_FREQUENCY || 'daily',
          verbose: process.env.LOG_ROTATING_VERBOSE === 'true',
        },
      },
    },
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD',
      },
    },
  },
  twilio: {
    from: process.env.TWILIO_FROM || 'TWILIO_FROM',
    accountID: process.env.TWILIO_ACCOUNT_SID || 'TWILIO_ACCOUNT_SID',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'TWILIO_AUTH_TOKEN',
  },
};
