const express = require('express');
const router = express.Router();
const validateUser = require('../validation/user');
const debugDB = require('debug')('app:db');
const chalk = require('chalk');
const db = require('../db');

// Get all Users
// -------------
router.get('/', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users ORDER BY last_name ASC');
    res.send(users);
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
  // Add timestamps to input
  let user = req.body;
  user.registration_date = getTimeStamp();
  user.modified = getTimeStamp();

  try {
    // Check for duplicate email
    const duplicate = await db.query('SELECT * FROM users WHERE email LIKE ?', [
      req.body.email,
    ]);
    if (duplicate.length == 1)
      return res.status(404).send('Please use another email.');
    // Insert valid user
    const result = await db.query('INSERT INTO users SET ?', [user]);
    debugDB(chalk.blue('Affected rows:'), result.affectedRows);
    // Return new user
    const newUser = await db.query('SELECT * FROM users WHERE user_id = ?', [
      result.insertId,
    ]);
    res.send(newUser[0]);
  } catch (ex) {
    debugDB(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Delete User
// -----------
router.delete('/:id', async (req, res) => {
  try {
    // Search for user
    const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
      req.params.id,
    ]);
    if (user.length === 0)
      return res.status(404).send('The user with the given ID was not found.');
    // If user exists, delete
    const result = await db.query('DELETE FROM users WHERE user_id = ?', [
      req.params.id,
    ]);
    debugDB(chalk.blue('Affected rows:'), result.affectedRows);
    res.send(user[0]);
  } catch (ex) {
    debugDB(ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Update User
// -----------
router.put('/:id', async (req, res) => {
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
      const result = await db.query('UPDATE users SET ? WHERE user_id = ?', [
        req.body,
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
    res.send(updatedInfo[0]);
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
