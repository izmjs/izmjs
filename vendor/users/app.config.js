module.exports = (config) => {
  const { env } = config.utils;

  // Profile configuration
  const profile = {
    picture: {
      default: {
        male: '/assets/img/male.png',
        female: '/assets/img/female.png',
      },
      thumbnail: '100x100',
      accept: [
        'image/png',
        'image/jpeg',
      ],
    },
    protected_attrs: [
      'validations',
      'salt',
      'updated_at',
      'created_at',
      'provider',
    ],
    private_attrs: [
      'validations',
      'salt',
      'password',
    ],
  };

  // Supported validations
  const validations = {
    types: ['email'],
    config: {
      phone: {
        validate: env.get('PHONE_VALIDATE'),
        code_length: env.get('PHONE_CODE_LENGTH'),
        max_tries: env.get('PHONE_MAX_TRIES'),
        authenticate: env.get('PHONE_IS_AUTHENTICATE'),
        max_resends: env.get('PHONE_MAX_RESENDS'),
      },
      email: {
        validate: env.get('EMAIL_VALIDATE'),
        code_length: env.get('EMAIL_CODE_LENGTH'),
        max_tries: env.get('EMAIL_MAX_TRIES'),
        authenticate: env.get('EMAIL_IS_AUTHENTICATE'),
        max_resends: env.get('EMAIL_MAX_RESENDS'),
      },
    },
  };

  validations.mondatory = Object
    .keys(validations.config)
    .filter((type) => validations.config[type].validate);

  // Twilio configuration
  const twilio = {
    from: env.get('TWILIO_FROM'),
    accountID: env.get('TWILIO_ACCOUNT_SID'),
    authToken: env.get('TWILIO_AUTH_TOKEN'),
  };

  // sendGrid configuration
  const sendGrid = {
    key: env.get('SENDGRID_API_KEY'),
  };

  // SMTP mailer configuration
  const mailer = {
    from: env.get('MAILER_FROM'),
    options: {
      host: env.get({
        key: 'MAILER_HOST',
        defaultValue: 'smtp.gmail.com',
      }),
      port: env.get({
        key: 'MAILER_PORT',
        defaultValue: 456,
      }, { type: 'number' }),
      secure: env.get({
        key: 'MAILER_SECURE',
        defaultValue: true,
      }, { type: 'boolean' }),
      auth: {
        user: env.get('MAILER_AUTH_USER'),
        pass: env.get('MAILER_AUTH_PASS'),
      },
    },
  };

  // Return the module configuration
  return {
    mailer,
    twilio,
    sendGrid,
    validations,
    app: {
      profile,
      roles: {
        default: env.get('DEFAULT_GROUPS'),
      },
    },
  };
};
