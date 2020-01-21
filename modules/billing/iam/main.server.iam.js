const ctrls = require('../controllers/main.server.controller');

/**
* @type { IAM.default }
*/
module.exports = {
  prefix: '/billing/main',
  routes: [{
    path: '/ok',
    methods: {
      get: {
        iam: 'modules:billing:main:ok',
        title: '"billing" is ready',
        parents: ['modules:billing', 'modules:billing:main'],
        groups: [],
        description: 'Test if the module "modules:billing" is up and running',
        middlewares: [
          ctrls.ok,
        ],
      },
    },
  }],
};
