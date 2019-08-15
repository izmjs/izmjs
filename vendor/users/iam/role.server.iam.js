// Controllers
const ctrl = require('../controllers/role.server.controller');

// eslint-disable-next-line
const utils = require('utils');

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
          iam: 'administration:roles:list',
          parents: ['modules:users:roles:manage'],
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
          iam: 'administration:roles:create',
          parents: ['modules:users:roles:manage'],
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
          iam: 'administration:roles:get',
          parents: ['modules:users:roles:manage'],
          middlewares: [ctrl.get],
        },
        put: {
          title: 'Update a role',
          description: 'Updates the role',
          iam: 'administration:roles:update',
          parents: ['modules:users:roles:manage'],
          middlewares: [
            utils.validate(updateSchema),
            ctrl.verifyIams,
            ctrl.update,
          ],
        },
      },
    },
  ],
};
