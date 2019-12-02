const debug = require('debug')('modules:{{{lowercase name}}}');

module.exports = async () => {
  debug('Module "{{{lowercase name}}}" bootstraped');
};
