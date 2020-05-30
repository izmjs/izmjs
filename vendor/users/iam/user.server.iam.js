/**
 * Module dependencies.
 */
const utils = require('@helpers/utils');

const users = require('../controllers/users.server.controller');

const updateProfileSchema = require('../schemas/update_profile.server.schema.json');

module.exports = {
  prefix: '/me',
  routes: [
    {
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
          parents: [
            'vendor:users',
            'vendor:users:user',
            'vendor:users:user:profile',
            'vendor:users:public',
          ],
          middlewares: [users.me],
          iam: 'vendor:users:user:profile:get',
          title: 'Get current user details',
          description: 'API to fetch the current user details',
        },
        /**
         * @body
         * {
         *   "name": {
         *     "first": "{{firstname}}",
         *     "last": "{{lastname}}"
         *   }
         * }
         */
        post: {
          parents: ['vendor:users', 'vendor:users:user', 'vendor:users:auth:profile'],
          middlewares: [
            utils.validate(updateProfileSchema),
            users.update,
          ],
          iam: 'vendor:users:user:profile:edit',
          title: 'Update profile',
          description: 'Update current user details',
        },
      },
    },
    {
      path: '/accounts',
      methods: {
        delete: {
          parents: ['vendor:users', 'vendor:users:user'],
          middlewares: [users.removeOAuthProvider],
          iam: 'vendor:users:user:oauth:remove',
          title: 'Remove a social network account',
          description: 'API to remove an linked social network account',
        },
      },
    },
    {
      path: '/picture',
      methods: {
        get: {
          parents: ['vendor:users', 'vendor:users:user', 'vendor:users:user:profile'],
          middlewares: [users.getProfilePicture],
          iam: 'vendor:users:auth:profile:picture:get',
          title: 'Get current user profile picture',
          description: 'API to fetch the image of the current user',
        },
      },
    },
  ],
};
