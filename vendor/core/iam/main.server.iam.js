/**
 * Module dependencies.
 */

const ctrls = require('../controllers/checks.server.controller');

module.exports = {
  prefix: '',
  routes: [
    {
      path: '/ok',
      methods: {
        get: {
          middlewares: [ctrls.ok],
          iam: 'core:checks:ok',
          title: 'Check if the app is up and running',
          description: 'API to check if the application is accessible',
          affectable: false,
          parents: ['vendor:users:public'],
        },
      },
    },
  ],
};
