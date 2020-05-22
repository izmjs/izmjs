const { resolve } = require('path');

module.exports = {
  log: {
    format:
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  },
  db: {
    promise: global.Promise,
  },
  lib: {
    mongoose: {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
  },
  i18next: {
    detector: {
      // order and from where user language should be detected
      order: ['querystring', 'cookie'],

      // keys or params to lookup language from
      lookupQuerystring: '$lng',
      lookupCookie: 'i18next',
      lookupFromPathIndex: 0,

      // cache user language
      caches: false,
    },
    init: {
      fallbackLng: 'en',
      preload: ['fr', 'en'],
      saveMissing: true,
      fallbackNS: 'vendor:core',
      defaultNS: 'vendor:core',
      debug: false,
      backend: {
        loadPath: (lng, ns) => {
          const [type, name] = ns.split(':');
          return resolve(`${type}/${name}/i18n/${lng}.json`);
        },
        addPath: (lng, ns) => {
          const [type, name] = ns.split(':');
          return resolve(`${type}/${name}/i18n/${lng}.missing.json`);
        },
      },
    },
  },
};
