// To simulate an SQL Injection attack copy and paste
// the following URL in the browser:
// http://localhost:3000/api/test/1%20OR%20(1=1)
// (same as "1 OR 1=1")
// This attack will return all user data
const express = require('express');
const router = express.Router();
const db = require('../startup/db');

router.get('/:id', async (req, res) => {
  console.log(req.params.id);
  try {
    const user = await db.query(
      `SELECT * FROM users WHERE user_id = ${req.params.id}`
    );
    console.log(user);
    if (user.length === 0)
      return res.status(404).send('The user with the given ID was not found.');
    res.json(user);
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send('Something went wrong.');
  }
});

module.exports = router;