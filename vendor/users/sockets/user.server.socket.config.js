const Iam = require('../helpers/iam.server.helper');

// Create the chat configuration
module.exports = (io) => {
  const iam = new Iam();

  io.use((s, next) => {
    const { request: req } = s;
    const roles = req.user && Array.isArray(req.user.roles) ? req.user.roles : ['guest'];

    iam.IAMsFromRoles(roles).then((list) => {
      req.iams = list.map((item) => ({ ...item, resource: new RegExp(item.resource, 'i') }));
      return next();
    }).catch(next);
  });
};
