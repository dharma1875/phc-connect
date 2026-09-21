const dotenv = require('dotenv');

dotenv.config();

function getJwtConfig() {
  const secret = (process.env.JWT_SECRET || '').trim();

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it in your .env file before starting the server.');
  }

  return {
    JWT_SECRET: secret,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  };
}

module.exports = {
  getJwtConfig,
  get JWT_SECRET() {
    return getJwtConfig().JWT_SECRET;
  },
  get JWT_EXPIRES_IN() {
    return getJwtConfig().JWT_EXPIRES_IN;
  },
};
