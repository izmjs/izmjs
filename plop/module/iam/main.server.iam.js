const ctrls = require('../controllers/main.server.controller');

/**
* @type { IAM.default }
*/
module.exports = {
  prefix: '/{{{lowercase name}}}',
  routes: [{
    path: '/ok',
    methods: {
      get: {
        iam: 'modules:{{{lowercase name}}}:ok',
        title: '"{{{lowercase name}}}" is ready',
        parents: ['modules:{{{lowercase name}}}'],
        groups: [],
        description: 'Test if the module "{{{lowercase name}}}" is up and running',
        middlewares: [
          ctrls.ok,
        ],
      },
    },
  }],
};
