const numCPUs = require('os').cpus().length;

module.exports = {
  WEB_FOLDER: {
    name: 'Web Folder',
    group: 'http-server',
    defaultValue: 'public',
  },
  HOST: {
    name: 'Host',
    description: 'Nework interface where the server be listening',
    group: 'http-server',
    defaultValue: '0.0.0.0',
  },
  PORT: {
    name: 'Application port',
    defaultValue: 3000,
    group: 'http-server',
    schema: {
      type: 'integer',
    },
  },
  HTTP_SECURE: {
    name: 'Is secure',
    group: 'http-server',
    defaultValue: false,
    schema: {
      type: 'boolean',
    },
  },
  ENABLE_CORS: {
    name: 'Enable CORS',
    group: 'http-server',
    defaultValue: false,
    schema: {
      type: 'boolean',
    },
  },
  CLUSTER_MODE: {
    name: 'Enable cluster mode',
    description:
      'The cluster mode allows easy creation of child processes that all share server ports.',
    link: 'https://nodejs.org/api/cluster.html',
    defaultValue: false,
    group: 'http-server',
    schema: {
      type: 'boolean',
    },
  },
  CLUSTER_MAX_WORKERS: {
    name: 'Max cluster workers',
    description: 'Maximum number of workers.',
    defaultValue: numCPUs,
    group: 'http-server',
    schema: {
      type: 'number',
    },
  },
  APP_PREFIX: {
    name: 'Application prefix',
    defaultValue: '/api/v1',
  },
  APP_PUBLIC_ADDRESS: {
    name: 'Public application address',
    description: 'Used to specify the public domain address of the application',
    defaultValue: '',
  },
  APP_TITLE: {
    name: 'Application title',
    defaultValue: 'Node API',
  },
  APP_DESCRIPTION: {
    name: 'Application description',
    defaultValue: 'My application description',
    field: {
      type: 'textarea',
    },
  },
  APP_GOOGLE_ID: {
    name: 'Google Analytics ID',
    defaultValue: 'UA-XXXXX-Y',
  },
  SESSION_SECRET: {
    name: 'Session Secret',
    description: 'Should be changed for security measures and concerns',
    defaultValue: 'DEFAULT_SESSION_SECRET',
    group: 'sessions',
  },
  SESSION_NAME: {
    name: 'Sessions secret',
    defaultValue: 'sessionId',
    group: 'sessions',
  },
  SESSION_COLLECTION: {
    name: 'Sessions collection',
    defaultValue: 'sessions',
    group: 'sessions',
  },
  COOKIE_MAX_AGE: {
    name: 'Max age',
    group: 'sessions',
    defaultValue: 86400000,
    schema: {
      type: 'integer',
    },
  },
  COOKIE_HTTP_ONLY: {
    name: 'HTTP Only',
    group: 'sessions',
    description:
      'httpOnly flag makes sure the cookie is only accessed through the HTTP protocol and not JS/browser',
    defaultValue: true,
    schema: {
      type: 'boolean',
    },
  },
  COOKIE_SECURE: {
    name: 'Secure cookie',
    group: 'sessions',
    description:
      'secure cookie should be turned to true to provide additional layer of security so that the cookie is set only when working in HTTPS mode.',
    defaultValue: false,
    schema: {
      type: 'boolean',
    },
  },
  IS_PUBLIC: {
    name: 'Guest users can use sockets',
    defaultValue: true,
    scope: 'sockets',
    schema: {
      type: 'boolean',
    },
  },
  ADAPTER: {
    name: 'Sockets adapter',
    defaultValue: 'none',
    scope: 'sockets',
    schema: {
      type: 'string',
      enum: ['none', 'redis'],
    },
  },
  REDIS_HOST: {
    name: 'Redis Hostname',
    defaultValue: 'localhost',
    scope: 'sockets',
  },
  REDIS_PORT: {
    name: 'Redis Port',
    defaultValue: '6379',
    scope: 'sockets',
  },
  SSL_PRIV_KEY: {
    name: 'SSL private key path',
    group: 'http-server',
    defaultValue: './config/sslcerts/key.pem',
  },
  SSL_CERTIFICATE: {
    name: 'SSL public certificate',
    group: 'http-server',
    defaultValue: './config/sslcerts/cert.pem',
  },
  SSL_CA_BUNDLE: {
    name: 'CA Bundle path',
    description: 'Root and intermediate certificates bundle',
    group: 'http-server',
    defaultValue: './config/sslcerts/cabundle.pem',
  },
};
