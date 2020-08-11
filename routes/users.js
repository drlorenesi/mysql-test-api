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
const db = require('../db');

// Get all Users
// -------------
router.get('/', async (req, res) => {
  try {
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
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Get logged in User (Protected)
// ------------------------------
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE email = ?', [
      req.user.email,
    ]);
    if (user.length === 0)
      return res
        .status(404)
        .send('The user with the given email was not found.');
    // Return only selected updated fields user
    // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
    res.send(user[0]);
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Get a specific User
// -------------------
router.get('/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
      req.params.id,
    ]);
    if (user.length === 0)
      return res.status(404).send('The user with the given ID was not found.');
    // Return only selected updated fields user
    // res.send(_.pick(user[0], ['user_id', 'first_name', 'last_name', 'email']));
    res.send(user[0]);
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Create new User
// ---------------
router.post('/', async (req, res) => {
  // Validate input
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);
  // Create user object, pick only required input properties, add timestamps and active
  let user = _.pick(req.body, ['first_name', 'last_name', 'email', 'password']);
  user.registration_date = user.modified = getTimeStamp();
  user.active = uuidv4();

  try {
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
    // Create activation link
    let activate = `${process.env.ACTIVATE}?x=${encodeURIComponent(
      newUser[0].email
    )}&y=${newUser[0].active}`;
    // Send info
    res.status(201).json({
      user: _.pick(newUser[0], ['user_id', 'first_name', 'last_name', 'email']),
      activate: activate,
    });
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Delete User (Protected & Admin)
// -------------------------------
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
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
  } catch (ex) {
    debugDB(ex.message);
    res
      .status(500)
      .json({ message: 'Oops! Something went wrong from our end.' });
  }
});

// Update User (Protected)
// -----------------------
router.put('/:id', auth, async (req, res) => {
  // Validate input before attempting update
  const { error } = validateUser(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  try {
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
    const updatedInfo = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [req.params.id]
    );
    // Return only selected updated fields user
    res.send(
      _.pick(updatedInfo[0], ['user_id', 'first_name', 'last_name', 'email'])
    );
  } catch (ex) {
    debugDB(ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Get Timestamp funtion
function getTimeStamp() {
  let date = new Date();
  return (
    date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0]
  );
}

module.exports = router;
