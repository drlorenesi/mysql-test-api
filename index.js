require('dotenv').config();
const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const morgan = require('morgan');
const chalk = require('chalk');
const app = express();

// Route Imports
const test = require('./sqlInjection');
const users = require('./routes/users');
const activate = require('./routes/activate');
const auth = require('./routes/login');
const error = require('./middleware/error');

// Middleware
app.use(express.json());
app.use(helmet());
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/test', test);
app.use('/api/users', users);
app.use('/api/activate', activate);
app.use('/api/login', auth);

// Error Middleware
app.use(error);

const env = app.get('env').toUpperCase();
const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(chalk.blue(`- ${env} Server started on port: ${port}`))
);
