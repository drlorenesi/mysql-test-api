const generateAuthToken = require('../../utils/generateAuthToken');
require('dotenv').config();
const jwt = require('jsonwebtoken');

describe('generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const payload = { user_id: 1, first_name: 'Diego' };
    const token = generateAuthToken(payload, process.env.jwtPrivateKey);
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    expect(decoded).toMatchObject({ user_id: 1, first_name: 'Diego' });
  });
});
