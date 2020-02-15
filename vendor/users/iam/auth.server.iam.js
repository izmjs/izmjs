/**
 * Module dependencies.
 */

const users = require('../controllers/users.server.controller');

module.exports = {
  prefix: '/auth',
  routes: [
    {
      path: '/forgot',
      methods: {
        /**
         * @body
         * {
         *  "username": "{{email}}"
         * }
         */
        post: {
          parents: ['modules:users:auth'],
          middlewares: [users.forgot],
          iam: 'users:auth:passwd:forgotten',
          title: 'Reset the user password',
          description: 'Generate a reset password token and send it to the user',
        },
      },
    },
    {
      path: '/name',
      methods: {
        get: {
          parents: ['modules:users:auth'],
          middlewares: [users.name],
          iam: 'users:auth:name',
          title: 'Get the user fullname',
          description: 'API to get the current user fullname',
        },
      },
    },
    {
      path: '/reset/:token',
      methods: {
        get: {
          parents: ['modules:users:auth'],
          middlewares: [users.validateResetToken],
          iam: 'users:auth:passwd:validate-token',
          title: 'Change password',
          description: 'Redirect the user to the right page to change his password',
        },
        post: {
          parents: ['modules:users:auth'],
          middlewares: [users.reset],
          iam: 'users:auth:passwd:reset',
          title: 'Change the password',
          description: 'Change a user password using a valid reset password token',
        },
      },
    },
    {
      path: '/password',
      methods: {
        post: {
          parents: ['modules:users:auth'],
          middlewares: [users.changePassword],
          iam: 'users:passwd:change',
          title: 'Change current user password',
          description: 'API to change the current user password',
        },
      },
    },
    {
      path: '/signup',
      methods: {
        /**
         * @body
         * {
         *   "name": {
         *     "first": "{{firstname}}",
         *     "last": "{{lastname}}"
         *   },
         *   "email": "{{email}}",
         *   "password": "{{password}}",
         *   "username": "{{username}}",
         *   "phone": "{{phone}}"
         * }
         *
         * @test
         * pm.test("Status code is 200", function () {
         *   pm.response.to.have.status(200);
         *   const json = pm.response.json();
         *   pm.environment.set("userId", json._id);
         * });
         */
        post: {
          parents: ['modules:users:auth'],
          middlewares: [
            users.signup,
            users.me,
          ],
          iam: 'users:auth:signup',
          title: 'Signup',
          description: 'Sign up a new user',
        },
      },
    },
    {
      path: '/signin',
      methods: {
        /**
         * @body
         * {
         *   "username": "{{username}}",
         *   "password": "{{password}}"
         * }
         *
         * @test
         * pm.test("Status code is 200", function () {
         *   pm.response.to.have.status(200);
         *   const json = pm.response.json();
         *   pm.environment.set("userId", json._id);
         * });
         */
        post: {
          parents: ['modules:users:auth'],
          middlewares: [
            users.signin,
            users.me,
          ],
          iam: 'users:auth:signin',
          title: 'Signin',
          description: 'Sign in an existing user',
        },
      },
    },
    {
      path: '/signout',
      methods: {
        get: {
          parents: ['modules:users:auth'],
          middlewares: [users.signout],
          iam: 'users:auth:signout',
          title: 'Signout',
          description: 'Signout the current user',
        },
      },
    },
    {
      path: '/confirm',
      methods: {
        /**
         * @params
         * [{
         *   "key": "type",
         *   "value": "email",
         *   "description": "Specify the code type. the application supports two types: 'email' and 'phone'"
         * }, {
         *   "key": "uid",
         *   "value": "{{userId}}",
         *   "description": "The user ID"
         * }, {
         *   "key": "code",
         *   "value": "{{code}}",
         *   "description": "the code"
         * }]
         */
        get: {
          parents: ['modules:users:auth'],
          middlewares: [users.confirm],
          iam: 'users:auth:code:confirm',
          title: 'Confirm code',
          description: 'Confirm an automatically generated code',
        },
      },
    },
    {
      path: '/resend',
      methods: {
        get: {
          parents: ['modules:users:auth'],
          middlewares: [users.resend],
          iam: 'users:auth:code:resend',
          title: 'Resend code',
          description: 'Resend an automatically generated code',
        },
      },
    },
  ],
};
