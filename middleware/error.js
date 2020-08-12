const debugDB = require('debug')('app:db');
const chalk = require('chalk');

function error(error, req, res, next) {
  debugDB(chalk.red('Database error ->'), error.message);
  res
    .status(500)
    .json({ message: 'Hold up! Something went wrong from our end.' });
}

module.exports = error;
