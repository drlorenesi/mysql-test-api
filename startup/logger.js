require('express-async-errors');
const { createLogger, format, transports } = require('winston');
const Sentry = require('winston-transport-sentry-node').default;

const options = {
  sentry: {
    dsn: process.env.SENTRY,
  },
};

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint()
  ),
  transports: [
    new transports.File({ filename: 'errors.log' }),
    new Sentry(options),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

process.on('uncaughtException', (ex) => {
  logger.error('Uncaught Exception - %s at %s', ex, new Date());
});

process.on('unhandledRejection', (ex) => {
  logger.error('Unhandled Rejection - %s at %s', ex, new Date());
});

module.exports = logger;
