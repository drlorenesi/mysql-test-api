const express = require('express');
const router = express.Router();
const chalk = require('chalk');
const db = require('../db');

// Helper functions
const CURRENT_TIMESTAMP = {
  toSqlString: function () {
    return 'CURRENT_TIMESTAMP()';
  },
};

// Get all Users
router.get('/', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users ORDER BY last_name ASC');
    res.send(users);
  } catch (ex) {
    console.log(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Get a specific User
router.get('/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
      req.params.id,
    ]);
    if (user.length === 0)
      return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
  } catch (ex) {
    console.log(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Create new User
router.post('/', async (req, res) => {
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    pass: req.body.pass,
    registration_date: CURRENT_TIMESTAMP,
    modified: CURRENT_TIMESTAMP,
  };

  try {
    const result = await db.query('INSERT INTO users SET ?', [user]);
    console.log(chalk.blue('Affected rows:'), result.affectedRows);
    res.send(user);
  } catch (ex) {
    console.log(chalk.red('Database error ->'), ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  // Search for user
  try {
    const user = await db.query('SELECT * FROM users WHERE user_id = ?', [
      req.params.id,
    ]);
    if (user.length === 0)
      return res.status(404).send('The user with the given ID was not found.');

    // If user exists, delete
    try {
      const result = await db.query('DELETE FROM users WHERE user_id = ?', [
        req.params.id,
      ]);
      console.log(chalk.blue('Affected rows:'), result.affectedRows);
      res.send(user);
    } catch (ex) {
      console.log(ex.message);
      res.status(500).send('Oops! Something went wrong from our end.');
    }
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

// Update User
router.put('/:id', async (req, res) => {
  // Search for user
  try {
    const search = await db.query('SELECT * FROM users WHERE user_id = ?', [
      req.params.id,
    ]);
    if (search.length === 0)
      return res.status(404).send('The user with the given ID was not found.');
    // If user exists, update
    try {
      let update = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        pass: req.body.pass,
        modified: CURRENT_TIMESTAMP,
      };
      const result = await db.query('UPDATE users SET ? WHERE user_id = ?', [
        update,
        req.params.id,
      ]);
      console.log(chalk.blue('Updated rows:'), result.changedRows);
      res.send(update);
    } catch (ex) {
      console.log(ex.message);
      res.status(500).send('Oops! Something went wrong from our end.');
    }
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send('Oops! Something went wrong from our end.');
  }
});

module.exports = router;
