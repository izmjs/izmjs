/**
 * Module dependencies.
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const crypto = require('crypto');
const validator = require('validator');
const generatePassword = require('generate-password');
const owasp = require('owasp-password-strength-test');
const path = require('path');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');
const util = require('util');
// const chalk = require("chalk");

// eslint-disable-next-line
const config = require(path.resolve('./config'));

let { twilio: twilioConfig } = config;
let isSendGrid = false;

if (
  twilioConfig &&
  twilioConfig.from &&
  twilioConfig.from !== 'TWILIO_FROM' &&
  twilioConfig.accountID &&
  twilioConfig.accountID !== 'TWILIO_ACCOUNT_SID' &&
  twilioConfig.authToken &&
  twilioConfig.authToken !== 'TWILIO_AUTH_TOKEN'
) {
  // eslint-disable-next-line new-cap
  twilioConfig = new twilio(config.twilio.accountID, config.twilio.authToken);
} else {
  if (
    (config.validations.mondatory.indexOf('phone') >= 0 ||
      config.validations.types.indexOf('phone') >= 0) &&
    (twilioConfig.from === 'TWILIO_FROM' ||
      twilioConfig.accountID === 'TWILIO_ACCOUNT_SID' ||
      twilioConfig.authToken === 'TWILIO_AUTH_TOKEN')
  ) {
    console.warn('Please configure TWILIO_FROM, TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN env vars');
  }
  twilioConfig = false;
}

if (config.sendGrid && config.sendGrid.key && config.sendGrid.key !== 'SENDGRID_API_KEY') {
  isSendGrid = true;
  sgMail.setApiKey(config.sendGrid.key);
}

let smtpTransport;

if (config.mailer.options && config.mailer.options.auth && config.mailer.options.auth.pass) {
  smtpTransport = nodemailer.createTransport(config.mailer.options);
}

async function sendMail(subject, body, users = []) {
  const msg = {
    to: users,
    from: config.mailer.from,
    subject,
    html: body,
  };

  if (!Array.isArray(users) || users.length === 0) {
    return false;
  }

  if (isSendGrid) {
    try {
      const send = util.promisify(sgMail.send).bind(sgMail);
      const data = await send(msg, false);
      if (Array.isArray(data) && data.length > 0) {
        const [d] = data;

        return d.toJSON();
      }
      return data;
    } catch (e) {
      return false;
    }
  } else if (smtpTransport) {
    const send = util.promisify(smtpTransport.sendMail).bind(smtpTransport);
    try {
      const data = await send(msg);
      return data;
    } catch (e) {
      return false;
    }
  }

  return false;
}
/**
 * A Validation function for local strategy properties
 */

const validateLocalStrategyProperty = () => true;
// return ((this.provider !== 'local' && !this.updated) || property.length);

/**
 * A Validation function for local strategy email
 */

const validateLocalStrategyEmail = (email) => validator.isEmail(email);

/**
 * A Validation function for local strategy phone
 */
const validateLocalStrategyPhone = (phone) => {
  if (!phone) {
    return true;
  }
  return (this.provider !== 'local' && !this.updated) || /^\+[1-9]{1}[0-9]{3,14}$/.test(phone);
};

/**
 * A Validation function for user roles
 */
const validateRole = async (name) => {
  const Role = mongoose.model('Role');
  try {
    const r = await Role.findOne({ name });
    return !!r;
  } catch (e) {
    return false;
  }
};

/**
 * User Schema
 */
const UserSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name'],
      },
      last: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your last name'],
      },
    },
    email: {
      type: String,
      unique: 'email already exists',
      lowercase: true,
      trim: true,
      default: '',
      validate: [validateLocalStrategyEmail, 'Please fill a valid email address'],
    },
    username: {
      type: String,
      unique: 'username already exists',
      lowercase: true,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      lowercase: true,
      trim: true,
      validate: [validateLocalStrategyPhone, 'Please fill a valid phone number'],
    },
    password: {
      type: String,
      default: '',
    },
    salt: {
      type: String,
    },
    data: {
      type: Object,
    },
    provider: {
      type: String,
      required: 'Provider is required',
    },
    picture: {
      ref: 'Grid',
      type: 'ObjectId',
    },
    providerData: {},
    additionalProvidersData: {},
    roles: {
      type: [
        {
          type: String,
          validate: [validateRole, 'The role is invalid'],
        },
      ],
      default: config.app.roles.default,
      required: 'Please provide at least one role',
    },
    /* For reset password */
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    /* For validations */
    validations: {
      default: [],
      type: [
        {
          type: { type: String },
          validated: { type: Boolean, default: false },
          code: String,
          resends: { type: Number, default: 0 },
          created: { type: Date, default: new Date() },
          last_try: Date,
          tries: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    isMale: {
      type: Boolean,
      default: true,
    },
    birthdate: {
      type: Date,
    },
  },
  {
    timestamps: config.lib.mongoose.timestamps,
  },
);

UserSchema.virtual('profilePictureUrl').get(function get_picture_url() {
  if (this.picture) {
    return `${config.app.prefix}/files/${this.picture}/view?size=300x300`;
  }

  return `${config.app.prefix}/users/${this.id}/picture`;
});

UserSchema.virtual('name.full').get(function get_fullname() {
  let result = '';
  if (this.name.first) {
    result += this.name.first
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(' ');
  }

  if (this.name.last) {
    if (result) {
      result += ' ';
    }

    result += this.name.last.toUpperCase();
  }

  return result;
});

/**
 * Hook a pre save method to hash the password
 */

UserSchema.pre('save', function pre_save(next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.constructor.hashPassword(this.password, this.salt);
  }

  next();
});

/**
 * Hook a pre validate method to test the local password
 */

UserSchema.pre('validate', function pre_validate(next) {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    const result = owasp.test(this.password);

    if (result.errors.length) {
      const error = result.errors.join(' ');
      this.invalidate('password', error);
    }
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.statics.hashPassword = function hash_pwd(password, salt) {
  if (salt && password) {
    return crypto
      .pbkdf2Sync(password, Buffer.from(salt, 'base64'), 10000, 64, 'sha512')
      .toString('base64');
  }
  return password;
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function authenticate(password) {
  return this.password === this.constructor.hashPassword(password, this.salt);
};

/**
 * Send an sms to the user
 */
UserSchema.methods.sendSMS = function send_sms(body) {
  if (this.phone && twilioConfig) {
    return twilioConfig.messages.create({
      to: this.phone,
      from: config.twilio.from,
      body,
    });
  }

  return false;
};

/**
 * Send an email to the user
 */

UserSchema.methods.sendMail = function send_mail(subject, body) {
  return sendMail(subject, body, [this.email]);
};

/**
 * Send an email to a collection of users
 */
UserSchema.query.sendMail = async function send_mail_col(subject, body) {
  const users = await this;
  return sendMail(
    subject,
    body,
    users.map((u) => u.email),
  );
};

/**
 * Send a notification
 */
UserSchema.methods.notify = function notify() {
  throw new Error('Not implement yet!');
};

/**
 * Get json value of the user
 */
UserSchema.methods.json = function json() {
  const private_attrs = config.app.profile.private_attrs || [];
  const obj = this.toJSON({
    virtuals: true,
  });

  private_attrs.forEach((attr) => delete obj[attr]);

  return obj;
};

/**
 * Sanitize user object
 */
UserSchema.statics.sanitize = function sanitize(obj) {
  const o = { ...obj };
  const protected_attrs = config.app.profile.protected_attrs || [];

  protected_attrs.forEach((attr) => delete o[attr]);

  return o;
};

/**
 * Generates a random passphrase that passes the owasp test.
 * Returns a promise that resolves with the generated passphrase, or rejects
 * with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests,
 * and not the optional tests.
 */

UserSchema.statics.generateRandomPassphrase = function generateRandomPassphrase() {
  return new Promise((resolve, reject) => {
    let password = '';
    const repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

    // iterate until the we have a valid passphrase.
    // NOTE: Should rarely iterate more than once, but we need this to ensure no
    // repeating characters are present.
    while (password.length < 20 || repeatingCharacters.test(password)) {
      // build the random password
      password = generatePassword.generate({
        // randomize length between 20 and 40 characters
        length: Math.floor(Math.random() * 20) + 20,
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true,
      });

      // check if we need to remove any repeating characters.
      password = password.replace(repeatingCharacters, '');
    }

    // Send the rejection back if the passphrase fails to pass the strength test
    if (owasp.test(password).errors.length) {
      reject(new Error('An unexpected problem occured while generating the random passphrase'));
    } else {
      // resolve with the validated passphrase
      resolve(password);
    }
  });
};

const UserModel = mongoose.model('User', UserSchema);
UserModel.createIndexes();

module.exports = UserModel;
