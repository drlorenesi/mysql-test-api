const debugDB = require('debug')('app:db');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;
const chalk = require('chalk');

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'errors.log' }),
  ],
});

function error(error, req, res, next) {
  debugDB(chalk.red('Database error ->'), error.message);
  logger.log('error', error);
  res
    .status(500)
    .json({ message: 'Hold up! Something went wrong from our end.' });
}

module.exports = error;
