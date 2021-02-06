const numCPUs = require('os').cpus().length;

module.exports = (config) => {
  const { env } = config.utils;
  const host = env.get('HOST');
  const port = process.env.HTTP_PORT || env.get('PORT');
  const secure = {
    ssl: env.get('HTTP_SECURE'),
    privateKey: env.get('SSL_PRIV_KEY'),
    certificate: env.get('SSL_CERTIFICATE'),
    caBundle: env.get('SSL_CA_BANDLE'),
  };

  const maxWorkers = env.get('CLUSTER_MAX_WORKERS') < 0 ? numCPUs : env.get('CLUSTER_MAX_WORKERS');

  const app = {
    host,
    port,
    secure,
    webFolder: env.get('WEB_FOLDER'),
    cluster: {
      maxWorkers,
      enabled: env.get('CLUSTER_MODE'),
    },
    clusterMode: env.get('CLUSTER_MODE'),
    cors: {
      enabled: env.get('CORS_ENABLE'),
      credentials: env.get('CORS_CREDENTIALS'),
      origin: env.get('CORS_ORIGIN'),
    },
    title: env.get('APP_TITLE'),
    prefix: env.get('APP_PREFIX'),
    publicAddress:
      env.get('APP_PUBLIC_ADDRESS') || `http${secure.ssl ? 's' : ''}://${host}:${port}`,
    description: env.get('APP_DESCRIPTION'),
    pages: {
      login: '/#/auth',
    },
  };

  return {
    app,
    session: {
      name: env.get('SESSION_NAME'),
      secret: env.get('SESSION_SECRET'),
      cookie: {
        maxAge: env.get('SESSION_COOKIE_MAX_AGE'),
        httpOnly: env.get('SESSION_COOKIE_HTTP_ONLY'),
        secure: env.get('SESSION_COOKIE_SECURE'),
      },
      collection: env.get('SESSION_COLLECTION'),
    },
    sockets: {
      public: env.get('IS_PUBLIC', 'sockets'),
      adapter: env.get('ADAPTER', 'sockets'),
      redisOptions: {
        host: env.get('REDIS_HOST', 'sockets'),
        port: env.get('REDIS_PORT', 'sockets'),
      },
    },
    google: {
      gaId: env.get('APP_GOOGLE_ID'),
    },
  };
};
