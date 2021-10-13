const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generates password salt
 * 
 * @param {String} enctype The password encryption type
 */
exports.generateSalt = (enctype) => {
  switch (enctype) {
    case 'bcrypt':
      return bcrypt.genSaltSync();
    case 'crypto':
    default:
      return crypto.randomBytes(16).toString('base64');
  }
};

/**
 * Hash password
 * 
 * @param {String} password The password string
 * @param {String} salt The password salt
 * @param {String} enctype The password encryption type
 */
exports.hash = (password, salt, enctype) => {
  if (salt && password) {
    switch (enctype) {
      case 'bcrypt':
        return bcrypt.hashSync(password, salt);
      case 'crypto':
      default:
        return crypto
          .pbkdf2Sync(password, Buffer.from(salt, 'base64'), 10000, 64, 'sha512')
          .toString('base64');
    }
  }

  return password;
};

/**
 * Verifies if password matches with the given hash
 * NOTE: for bcrypt encryption, we don't need to provide the salt to the compare function
 * because the salt is already included within the password hash itself
 * so we don't even need to save the salt in that case
 * 
 * @param {String} password The password string
 * @param {String} hash The password hash to compare with
 * @param {String} salt The password salt
 * @param {String} enctype The password encryption type
 */
exports.verify = (password, hash, salt, enctype) => {
  switch (enctype) {
    case 'bcrypt':
      return bcrypt.compareSync(password, hash);
    case 'crypto':
    default:
      return hash === this.hash(password, salt, enctype);
  }
};
