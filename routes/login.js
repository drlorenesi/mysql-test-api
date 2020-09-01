const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const generateAuthToken = require('../utils/generateAuthToken');
const db = require('../startup/db');

// Log in user
// -----------
router.post('/', async (req, res) => {
  // Validate input
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);
  // Search for user
  const user = await db.query('SELECT * FROM users WHERE email = ?', [
    req.body.email,
  ]);
  if (user.length === 0)
    return res.status(400).json({ message: 'Invalid email or password.' });
  // Check to see if passwords match
  const validPassword = await bcrypt.compare(
    req.body.password,
    user[0].password
  );
  if (!validPassword)
    return res.status(400).json({ message: 'Invalid email or password.' });
  // Check to see if user has clicked activation link
  if (process.env.SEND_ACTIVATION == true) {
    if (user[0].activated != null)
      return res.status(400).json({ message: 'User has not been activated.' });
  }

  // Create payload and send JWT
  const payload = {
    user_id: user[0].user_id,
    first_name: user[0].first_name,
    user_level: user[0].user_level,
    email: user[0].email,
  };
  const token = generateAuthToken(payload, process.env.jwtPrivateKey);
  res
    .header('x-auth-token', token)
    .send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
});

// Validation function
// -------------------
function validate(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().min(5).required(),
  });
  return schema.validate(req);
}

module.exports = router;
