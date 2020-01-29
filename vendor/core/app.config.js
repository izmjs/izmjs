module.exports = (config) => {
  const { env } = config.utils;
  const host = env.get('HOST', 'http-server');
  const port = env.get('PORT', 'http-server');
  const secure = {
    ssl: env.get('HTTP_SECURE', 'http-server'),
    privateKey: env.get('PRIV_KEY', 'http-server'),
    certificate: env.get('CERTIFICATE', 'http-server'),
    caBundle: env.get('CA_BANDLE', 'http-server'),
  };

  const app = {
    title: env.get('APP_TITLE'),
    publicAddress: env.get('APP_PUBLIC_ADDRESS') || `http${secure.ssl ? 's' : ''}://${host}:${port}`,
    description: env.get('APP_DESCRIPTION'),
    pages: {
      login: '/#/auth',
    },
  };

  return {
    app,
    host,
    port,
    secure,
    prefix: env.get('APP_PREFIX'),
    sockets: {
      public: env.get('IS_PUBLIC', 'sockets'),
      adapter: env.get('ADAPTER', 'sockets'),
      redisOptions: {
        host: env.get('REDIS_HOST', 'sockets'),
        port: env.get('REDIS_PORT', 'sockets'),
      },
    },
    sessionCookie: {
      maxAge: env.get('MAX_AGE', 'sessions'),
      httpOnly: env.get('HTTP_ONLY', 'sessions'),
      secure: env.get('SECURE', 'sessions'),
    },
    sessionSecret: env.get('SECRET', 'sessions'),
    sessionKey: env.get('KEY', 'sessions'),
    sessionCollection: env.get('COLLECTION', 'sessions'),
    google: {
      gaId: env.get('APP_GOOGLE_ID'),
    },
  };
};
