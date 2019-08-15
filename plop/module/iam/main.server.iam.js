const ctrls = require('../controllers/main.server.controller');

/**
* @type { IAM.default }
*/
module.exports = {
  prefix: '/{{name}}',
  routes: [{
    path: '/ok',
    methods: {
      get: {
        iam: 'modules:{{name}}:ok',
        title: '{{name}} is ready',
        parents: ['modules:{{name}}'],
        groups: [],
        description: 'Test if the module {{name}} is up and running',
        middlewares: [
          ctrls.ok,
        ],
      },
    },
  }],
};
