require('dotenv').config();
const express = require('express');
const chalk = require('chalk');

const app = express();

require('./startup/logger');
require('./startup/routes')(app);
require('./startup/config');

const env = app.get('env').toUpperCase();
const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(chalk.blue(`- ${env} Server started on port: ${port}`))
);
