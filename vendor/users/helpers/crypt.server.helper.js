const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.generateSalt = (enctype) => {
  switch (enctype) {
    case 'bcrypt':
      return bcrypt.genSaltSync();
    case 'crypto':
    default:
      return crypto.randomBytes(16).toString('base64');
  }
};

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

exports.verify = (password, hash, salt, enctype) => {
  switch (enctype) {
    case 'bcrypt':
      return bcrypt.compareSync(password, hash);
    case 'crypto':
    default:
      return hash === this.hash(password, salt, enctype);
  }
};
