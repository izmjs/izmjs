/* eslint-disable import/no-dynamic-require */

/**
 * Module dependencies.
 */
const users = require('../controllers/users.server.controller');

module.exports = {
  prefix: '/me',
  routes: [{
    path: '/',
    methods: {
      /**
       * @params
       * [{
       *   "key": "$expand",
       *   "value": "iams",
       *   "description": "You can use this parameter to expand related attributes"
       * }, {
       *   "key": "$select",
       *   "value": "name.first,email,iams",
       *   "description": "Use this parameter to select specific attributes"
       * }]
       */
      get: {
        parents: ['modules:users:profile'],
        middlewares: [
          users.me,
        ],
        iam: 'users:profile:get',
        title: 'Get current user details',
        description: 'API to fetch the current user details',
      },
      post: {
        parents: ['modules:users:profile'],
        middlewares: [
          users.update,
        ],
        iam: 'users:profile:edit',
        title: 'Update profile',
        description: 'Update current user details',
      },
    },
  }, {
    path: '/accounts',
    methods: {
      delete: {
        parents: ['modules:users:profile'],
        middlewares: [
          users.removeOAuthProvider,
        ],
        iam: 'users:oauth:remove',
        title: 'Remove a social network account',
        description: 'API to remove an linked social network account',
      },
    },
  }, {
    path: '/picture',
    methods: {
      get: {
        parents: ['modules:users:profile'],
        middlewares: [
          users.getProfilePicture,
        ],
        iam: 'users:profile:picture:get',
        title: 'Get current user profile picture',
        description: 'API to fetch the image of the current user',
      },
    },
  }],
};
