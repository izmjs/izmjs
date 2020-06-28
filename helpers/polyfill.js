/**
 * Module dependencies.
 */
const dotenv = require('dotenv');

dotenv.config({
  path: './.env/.common.env',
});

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: `./.env/.${env}.env`,
});

require('module-alias/register');
