/**
 * Guest role
 * @type {Array}
 */
const guest = [
  'users:profile:get',
  'users:auth:signup',
  'users:auth:signin',
  'users:auth:passwd:forgotten',
  'users:auth:passwd:validate-token',
  'users:auth:passwd:reset',
  'users:auth:code:confirm',
  'users:auth:code:resend',
  'users:auth:name',
];

/**
 * User role
 * @type {Array}
 */
const user = [
  'users:auth:name',
  'users:auth:signin',

  // Users IAMs
  'users:passwd:change',
  'users:profile:get',
  'users:profile:picture:get',
  'users:profile:picture:update',
  'users:auth:signout',
  'users:profile:edit',
];

/**
 * Admin role
 * @type {Array}
 */
const admin = [
  ...user,
  // Users IAMs
  'users:admin:list',
  'users:admin:read',
  'users:admin:update',
  'users:admin:delete',
  'users:admin:picture',
];

/**
 * All roles
 */
module.exports = [
  {
    name: 'guest',
    protected: true,
    title: 'Guest role',
    description: 'Role given for any unauthenticated user, or users who don\'t have any role.',
    iams: guest,
  },
  {
    name: 'user',
    protected: true,
    iams: user,
    title: 'User role',
    description: 'The default role.',
  },
  {
    name: 'admin',
    protected: true,
    iams: admin,
    title: 'Admin role',
    description: 'Given to advanced users.',
  },
];
