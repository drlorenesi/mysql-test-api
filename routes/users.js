const express = require('express');
const router = express.Router();
// Middleware and Validation
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const validateUser = require('../validation/user');
// Dependencies
const db = require('../startup/db');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const debugDB = require('debug')('app:db');
const chalk = require('chalk');
// const activateEmail = require('../activateEmail');

// Get logged in User (Protected) (Tested)
// ------------------------------
router.get('/me', [auth], async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [
    req.user.email,
  ]);
  if (user.length === 0)
    return res.status(404).send('The user with the given email was not found.');
  // Return only selected updated fields user
  // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  res.status(200).send(user[0]);
});

// Get all Users (Tested)
// -------------
router.get('/', [], async (req, res) => {
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
  res.status(200).send(users);
});

// Get a specific User (Tested)
// -------------------
router.get('/:id', [], async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  if (user.length === 0)
    return res.status(404).send('The user with the given ID was not found.');
  // Return only selected updated fields user
  // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  res.status(200).send(user[0]);
});

// Create new User ()
// ---------------
router.post('/', [validate(validateUser)], async (req, res) => {
  // Create user object, pick only required input properties and add active
  let user = _.pick(req.body, ['first_name', 'last_name', 'email', 'password']);
  user.active = uuidv4();

  // Check for duplicate email
  const duplicate = await db.query('SELECT * FROM users WHERE email LIKE ?', [
    req.body.email,
  ]);
  if (duplicate.length == 1)
    return res.status(400).json({ error: 'Please use another email.' });
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

// Delete User (Protected & Admin) ()
// -------------------------------
router.delete('/:id', [auth, admin], async (req, res) => {
  // Search for user
  const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  if (user.length === 0)
    return res
      .status(404)
      .json({ error: 'The user with the given ID was not found.' });
  // If user exists, delete
  const result = await db.query('DELETE FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  debugDB(chalk.blue('Affected rows:'), result.affectedRows);
  // Return only selected fields of deleted user
  // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
  res.status(200).send(user[0]);
});

// Update User (Protected) (Tested)
// -----------------------
router.put('/:id', [auth, admin, validate(validateUser)], async (req, res) => {
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
    // Hash password
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    const result = await db.query('UPDATE users SET ? WHERE user_id = ?', [
      update,
      req.params.id,
    ]);
    debugDB(chalk.blue('Updated rows:'), result.changedRows);
  } else {
    return res.status(400).send('Please use another email.');
  }
  // Get updated user info
  const updatedInfo = await db.query('SELECT * FROM users WHERE user_id = ?', [
    req.params.id,
  ]);
  // Return only selected updated fields user
  res
    .status(200)
    .send(
      _.pick(updatedInfo[0], ['user_id', 'first_name', 'last_name', 'email'])
    );
});

module.exports = router;
