require('dotenv').config();

function config() {
  if (!process.env.jwtPrivateKey) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}

module.exports = config;
