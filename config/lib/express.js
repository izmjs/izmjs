/**
 * Module dependencies.
 */
const i18nextMiddleware = require('i18next-express-middleware');
const { lstatSync, readdirSync, readFileSync } = require('fs');
const { createServer: createHTTPsServer } = require('https');
const { createServer: createHTTPServer } = require('http');
const Backend = require('i18next-node-fs-backend');
const methodOverride = require('method-override');
const debug = require('debug')('config:express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { connection } = require('mongoose');
const bodyParser = require('body-parser');
const compress = require('compression');
const flash = require('connect-flash');
const nunjucks = require('nunjucks');
const i18next = require('i18next');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { resolve, join } = require('path');

const MongoStore = require('connect-mongo')(session);
const config = require('..');

const logger = require('./logger');
const { init: initSocketIO } = require('./socket.io');

const { vendor, custom } = config.files.server.modules;

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = (app) => {
  const { locals } = app;

  // Setting application local variables
  if (config.secure && config.secure.ssl === true) {
    locals.secure = config.secure.ssl;
  }

  // Passing the request url to environment locals
  app.use((req, res, next) => {
    res.locals.host = `${req.protocol}://${req.hostname}`;
    res.locals.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    next();
  });
};

/**
 * Run bootstrap files
 */
module.exports.runBootstrap = (app, db) => {
  const promises = config.files.server.bootstraps.map(async (f) => {
    // eslint-disable-next-line
    const m = require(resolve(f));

    if (typeof m === 'function') {
      try {
        debug('Bootstraping file %s', f);
        await m(config, app, db);
        debug('file "%s" executed successfully', f);
      } catch (e) {
        console.error('Error bootstraping file "%s"', f, e);
        return false;
      }
    }

    return true;
  });

  return Promise.all(promises);
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = (app) => {
  const { locals } = app;

  // Showing stack errors
  app.set('showStackError', true);

  // Enable jsonp
  app.enable('jsonp callback');

  // Should be placed before express.static
  app.use(compress({
    filter(req, res) {
      return /json|text|javascript|css|font|svg/.test(res.getHeader('Content-Type'));
    },
    level: 9,
  }));

  // Enable logger (morgan)
  app.use(morgan(logger.getFormat(), logger.getOptions()));

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.json({ limit: '4mb', extended: true }));
  app.use(bodyParser.urlencoded({ limit: '4mb', extended: true }));
  app.use(methodOverride());
  // Add the cookie parser and flash middleware
  app.use(cookieParser());
  app.use(flash());
  app.use('/assets', express.static('assets'));
  app.use(express.static('public'));
};

/**
 * Configure view engine
 */
module.exports.initViewEngine = (app) => {
  nunjucks.configure('./', {
    autoescape: true,
    express: app,
  });

  // Set views path and view engine
  app.set('view engine', 'server.view.swig');
};

/**
 * Configure Express session
 */
module.exports.initSession = (app) => {
  // Express MongoDB session storage
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionCookie.maxAge,
      httpOnly: config.sessionCookie.httpOnly,
      secure: config.sessionCookie.secure && config.secure.ssl,
    },
    name: config.sessionKey,
    store: new MongoStore({
      collection: config.sessionCollection,
      mongooseConnection: connection,
    }),
  }));

  // Add Lusca CSRF Middleware
  // app.use(lusca(config.csrf));
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = (app, db) => {
  config.files.server.configs.forEach((configPath) => {
    // eslint-disable-next-line
    require(resolve(configPath))(app, db, config);
  });
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = (app) => {
  // Use helmet to secure Express headers
  const SIX_MONTHS = 15778476000;
  app.use(helmet({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true,
  }));
  app.disable('x-powered-by');
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = (app) => {
  // Globbing routing files
  config.files.server.routes.forEach((routePath) => {
    // eslint-disable-next-line
    const m = require(resolve(routePath));
    if (typeof m === 'function') {
      m(app);
    } else {
      app.use(config.prefix + m.prefix, m.router(app));
    }
  });
};

module.exports.createServer = (app) => {
  let server;
  if (config.secure && config.secure.ssl === true) {
    // Load SSL key and certificate
    const privateKey = readFileSync(resolve(config.secure.privateKey), 'utf8');
    const certificate = readFileSync(resolve(config.secure.certificate), 'utf8');
    let caBundle;

    try {
      caBundle = readFileSync(resolve(config.secure.caBundle), 'utf8');
    } catch (err) {
      console.warn('Warning: couldn\'t find or read caBundle file');
    }

    const options = {
      key: privateKey,
      cert: certificate,
      ca: caBundle,
      //  requestCert : true,
      //  rejectUnauthorized : true,
      secureProtocol: 'TLSv1_method',
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-SHA256',
        'DHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'DHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA256',
        'DHE-RSA-AES256-SHA256',
        'HIGH',
        '!aNULL',
        '!eNULL',
        '!EXPORT',
        '!DES',
        '!RC4',
        '!MD5',
        '!PSK',
        '!SRP',
        '!CAMELLIA',
      ].join(':'),
      honorCipherOrder: true,
    };

    // Create new HTTPS Server
    server = createHTTPsServer(options, app);
  } else {
    // Create a new HTTP server
    server = createHTTPServer(app);
  }

  return server;
};

/**
 * Configure i18n
 */
module.exports.initI18n = (app) => {
  const lngDetector = new i18nextMiddleware.LanguageDetector(
    null,
    config.i18next.detector,
  );

  const getDirsNames = () => {
    const modules = [vendor, ...custom];
    const names = modules.map((source) => readdirSync(source)
      .map((name) => {
        const p = join(source, name);

        if (!lstatSync(p).isDirectory()) {
          return false;
        }

        return `${source}:${name}`;
      })
      .filter(Boolean));

    return Array.prototype.concat.apply([], names);
  };

  i18next
    .use(Backend)
    .use(lngDetector)
    .init({
      ...config.i18next.init,
      ns: getDirsNames(),
    });

  app.use(i18nextMiddleware.handle(i18next));
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = (app) => {
  app.use((err, req, res, next) => {
    const { options } = req.i18n;
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);

    options.defaultNS = 'vendor:core';

    // Redirect to error page
    return res.status(500).render(`${vendor}/core/views/500`, {
      error: req.t('ERROR_500'),
    });
  });
};


/**
 * Initialize the Express application
 */
module.exports.init = async (db) => {
  // Initialize express app
  const app = express();

  // Run bootstrap files
  await this.runBootstrap(app, db);

  // Initialize local variables
  this.initLocalVariables(app, db);

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Express view engine
  this.initViewEngine(app);

  // Initialize Express session
  this.initSession(app, db);

  // Initialize modules server i18n
  this.initI18n(app);

  // Initialize Modules configuration
  this.initModulesConfiguration(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize modules server routes
  this.initModulesServerRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  // create the server, then return the instance
  const server = this.createServer(app);

  // Configure Socket.io
  initSocketIO(server);

  return server;
};
