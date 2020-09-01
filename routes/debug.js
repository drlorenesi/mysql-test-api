// Express
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  myUndefinedFunction();
  res.send('Debuging...');
});

module.exports = router;
