const ctrls = require('../controllers/main.server.controller');

/**
* @type { IAM.default }
*/
module.exports = {
  prefix: '/cabines/main',
  routes: [{
    path: '/ok',
    methods: {
      get: {
        iam: 'modules:cabines:main:ok',
        title: '"cabines" is ready',
        parents: ['modules:cabines', 'modules:cabines:main'],
        groups: [],
        description: 'Test if the module "modules:cabines" is up and running',
        middlewares: [
          ctrls.ok,
        ],
      },
    },
  }],
};
