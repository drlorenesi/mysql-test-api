require('dotenv').config();
const express = require('express');
const router = express.Router();
const debugDB = require('debug')('app:db');
const chalk = require('chalk');
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

if (!process.env.jwtPrivateKey) {
  console.error(chalk.red('FATAL ERROR: jwtPrivateKey is not defined.'));
  process.exit(1);
}

// Log in user
// ---------------
router.post('/', async (req, res) => {
  // Validate input
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);
  // Create input object, pick only required input properties
  let input = _.pick(req.body, ['email', 'password']);
  try {
    // Search for user
    const user = await db.query('SELECT * FROM users WHERE email = ?', [
      input.email,
    ]);
    if (user.length === 0)
      return res.status(400).send('Invalid email or password.');
    // Check to see if passwords match
    const validPassword = await bcrypt.compare(
      input.password,
      user[0].password
    );
    if (!validPassword)
      return res.status(400).send('Invalid email or password.');
    // Create payload and send JWT
    const token = jwt.sign(
      {
        user_id: user[0].user_id,
        first_name: user[0].first_name,
        user_level: user[0].user_level,
        email: user[0].email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration time
      },
      process.env.jwtPrivateKey
    );
    res
      .header('x-auth-token', token)
      .send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Validation function
function validate(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().min(5).required(),
  });
  return schema.validate(req);
}

module.exports = router;
