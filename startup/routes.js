// Dependencies
const express = require('express');
const morgan = require('morgan');
// Routes
const users = require('../routes/users');
const activate = require('../routes/activate');
const login = require('../routes/login');
const debug = require('../routes/debug');
// Error middleware
const error = require('../middleware/error');

module.exports = (app) => {
  // Middleware
  app.use(express.json());
  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
  }
  // Routes
  app.use('/api/users', users);
  app.use('/api/activate', activate);
  app.use('/api/login', login);
  app.use('/api/debug', debug);
  // Error middleware
  app.use(error);
};
