/**
 * Guest role
 * @type {Array}
 */
const guest = ['vendor:users:public'];

/**
 * User role
 * @type {Array}
 */
const user = [
  /**
   * Users IAMs
   */
  'vendor:users:user',
  'vendor:users:auth',
];

/**
 * Admin role
 * @type {Array}
 */
const admin = [
  ...user,

  /**
   * Admin IAMs
   */
  'vendor:users:admin',
  'vendor:users:roles',
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
