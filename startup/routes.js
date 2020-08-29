// Dependencies
const express = require('express');
const morgan = require('morgan');
// Routes
const test = require('../routes/sqlInjection');
const users = require('../routes/users');
const activate = require('../routes/activate');
const login = require('../routes/login');
// Error middleware
const error = require('../middleware/error');

function routes(app) {
  // Middleware
  app.use(express.json());
  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
  }
  // Routes
  app.use('/api/test', test);
  app.use('/api/users', users);
  app.use('/api/activate', activate);
  app.use('/api/login', login);
  // Error middleware
  app.use(error);
}

module.exports = routes;
