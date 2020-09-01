require('dotenv').config();
const express = require('express');
const chalk = require('chalk');

const app = express();

if (app.get('env') === 'production') {
  require('./startup/prod')(app);
}

require('./startup/logger');
require('./startup/routes')(app);
require('./startup/config');

const env = app.get('env').toUpperCase();
const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(chalk.blue(`- ${env} Server started on port: ${port}`))
);

// Export server constant for tests
module.exports = server;
