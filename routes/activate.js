const express = require('express');
const router = express.Router();
const debugDB = require('debug')('app:db');
const chalk = require('chalk');
const db = require('../db');
const Joi = require('joi');

// Activate
// --------
router.get('/', async (req, res) => {
  const { error } = validate(req.query);
  if (error) return res.status(404).send(error.details[0].message);
  try {
    // Search for user
    const user = await db.query(
      'SELECT * FROM users WHERE email = ? AND active = ?',
      [req.query.x, req.query.y]
    );
    if (user.length === 0)
      return res
        .status(404)
        .json({ message: 'Please check your activation link.' });
    // If user exists, delete
    const result = await db.query(
      'UPDATE users SET active = NULL WHERE email = ?',
      [req.query.x]
    );
    debugDB(chalk.blue('Updated rows:'), result.changedRows);
    res.json({ message: 'Congrats! You may now log in.' });
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Validation function
function validate(link) {
  const schema = Joi.object({
    x: Joi.string().email().required(),
    y: Joi.string().guid({
      version: ['uuidv4', 'uuidv5'],
    }),
  });
  return schema.validate(link);
}

module.exports = router;
