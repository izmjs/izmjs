const ctrls = require('../controllers/main.server.controller');

/**
* @type { IAM.default }
*/
module.exports = {
  prefix: '/bookings/main',
  routes: [{
    path: '/ok',
    methods: {
      get: {
        iam: 'modules:bookings:main:ok',
        title: '"bookings" is ready',
        parents: ['modules:bookings', 'modules:bookings:main'],
        groups: [],
        description: 'Test if the module "modules:bookings" is up and running',
        middlewares: [
          ctrls.ok,
        ],
      },
    },
  }],
};
