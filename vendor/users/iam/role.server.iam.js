const utils = require('@helpers/utils');

// Controllers
const ctrl = require('../controllers/role.server.controller');

// validation schemas
const createSchema = require('../schemas/create_role.server.schema.json');
const updateSchema = require('../schemas/update_role.server.schema.json');

module.exports = {
  prefix: '/roles',
  params: [
    {
      name: 'roleId',
      middleware: ctrl.getById,
    },
  ],
  routes: [
    {
      path: '/',
      methods: {
        get: {
          title: 'Get available roles',
          decription: 'Returns a list of the roles available',
          iam: 'vendor:users:roles:list',
          parents: ['vendor:users', 'vendor:users:roles'],
          middlewares: [ctrl.listRoles],
        },
        /**
         * @body
         * {
         *   "name": "{{roleName}}",
         *   "iams": [
         *
         *   ]
         * }
         */
        post: {
          title: 'Create new role',
          description: 'Creates new role with the given permissions',
          iam: 'vendor:users:roles:create',
          parents: ['vendor:users', 'vendor:users:roles'],
          middlewares: [
            utils.validate(createSchema),
            ctrl.verifyExisting,
            ctrl.verifyIams,
            ctrl.create,
          ],
        },
      },
    },
    {
      path: '/:roleId',
      methods: {
        get: {
          title: 'Get a role by id',
          description: 'returns the object of the role',
          iam: 'vendor:users:roles:get',
          parents: ['vendor:users', 'vendor:users:roles'],
          middlewares: [ctrl.get],
        },
        put: {
          title: 'Update a role',
          description: 'Updates the role',
          iam: 'vendor:users:roles:update',
          parents: ['vendor:users', 'vendor:users:roles'],
          middlewares: [utils.validate(updateSchema), ctrl.verifyIams, ctrl.update],
        },
      },
    },
  ],
};
