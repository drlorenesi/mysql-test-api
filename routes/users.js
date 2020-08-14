const express = require('express');
const router = express.Router();
const validateUser = require('../validation/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const debugDB = require('debug')('app:db');
const chalk = require('chalk');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../startup/db');
// const activateEmail = require('../activateEmail');

// Get all Users (ok)
// -------------
router.get('/', async (req, res) => {
  const users = await db.query('SELECT * FROM users ORDER BY last_name ASC');
  // Return only selected user data
  // res.send(
  //   users.map((user) =>
  //     _.pick(user, [
  //       'user_id',
  //       'first_name',
  //       'last_name',
  //       'email',
  //       'user_level',
  //     ])
  //   )
  // );
  res.send(users);
});

// Get logged in User (Protected) (Ok)
// ------------------------------
router.get('/me', auth, async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [
    req.user.email,
  ]);
  if (user.length === 0)
    return res.status(404).send('The user with the given email was not found.');
  // Return only selected updated fields user
  // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  res.send(user[0]);
});

// Get a specific User (ok)
// -------------------
router.get('/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  if (user.length === 0)
    return res.status(404).send('The user with the given ID was not found.');
  // Return only selected updated fields user
  // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  res.send(user[0]);
});

// Create new User (ok)
// ---------------
router.post('/', async (req, res) => {
  // Validate input
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);
  // Create user object, pick only required input properties, add timestamps and active
  let user = _.pick(req.body, ['first_name', 'last_name', 'email', 'password']);
  user.registration_date = user.modified = getTimeStamp();
  user.active = uuidv4();

  // Check for duplicate email
  const duplicate = await db.query('SELECT * FROM users WHERE email LIKE ?', [
    req.body.email,
  ]);
  if (duplicate.length == 1)
    return res.status(404).json({ message: 'Please use another email.' });
  // Hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  // Insert valid user
  const result = await db.query('INSERT INTO users SET ?', [user]);
  debugDB(chalk.blue('Affected rows:'), result.affectedRows);
  // Return only selected fields of new user
  const newUser = await db.query('SELECT * FROM users WHERE user_id = ?', [
    result.insertId,
  ]);
  // Send activation email
  // activateEmail(newUser[0].email, newUser[0].active);
  // Create activation link
  let activate = `${process.env.ACTIVATE}?x=${encodeURIComponent(
    newUser[0].email
  )}&y=${newUser[0].active}`;
  // Send info
  res.status(201).json({
    user: _.pick(newUser[0], ['user_id', 'first_name', 'last_name', 'email']),
    activate: activate,
  });
});

// Delete User (Protected & Admin) (ok)
// -------------------------------
router.delete('/:id', [auth, admin], async (req, res) => {
  // Search for user
  const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  if (user.length === 0)
    return res
      .status(404)
      .json({ message: 'The user with the given ID was not found.' });
  // If user exists, delete
  const result = await db.query('DELETE FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  debugDB(chalk.blue('Affected rows:'), result.affectedRows);
  // Return only selected fields of deleted user
  // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  res.send(user[0]);
});

// Update User (Protected) (ok)
// -----------------------
router.put('/:id', [auth, admin], async (req, res) => {
  // Validate input before attempting update
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  // Search for user
  const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  if (user.length === 0)
    return res.status(404).send('The user with the given ID was not found.');
  // Test for unique email address
  const duplicate = await db.query(
    'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
    [req.body.email, req.params.id]
  );
  // If e-mail is unique update info
  if (duplicate.length == 0) {
    // Create update object, pick only required input properties and add timestamps
    let update = _.pick(req.body, [
      'first_name',
      'last_name',
      'email',
      'password',
      'user_level',
    ]);
    update.modified = getTimeStamp();
    // Hash password
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    const result = await db.query('UPDATE users SET ? WHERE user_id = ?', [
      update,
      req.params.id,
    ]);
    debugDB(chalk.blue('Updated rows:'), result.changedRows);
  } else {
    return res.status(404).send('Please use another email.');
  }
  // Get updated user info
  const updatedInfo = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  // Return only selected updated fields user
  res.send(
    _.pick(updatedInfo[0], ['user_id', 'first_name', 'last_name', 'email'])
  );
});

// Get Timestamp funtion
function getTimeStamp() {
  let date = new Date();
  return (
    date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0]
  );
}

module.exports = router;
