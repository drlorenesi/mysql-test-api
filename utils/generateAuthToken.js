const jwt = require('jsonwebtoken');

// Creates a JWT that takes in a payload and key
function generateAuthToken(payload, key) {
  payload.exp = Math.floor(Date.now() / 1000) + 60 * 60;
  return jwt.sign(payload, key);
}

module.exports = generateAuthToken;
