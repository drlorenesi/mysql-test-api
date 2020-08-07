require('dotenv').config();
const util = require('util');
const chalk = require('chalk');
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.getConnection((err, connection) => {
  if (err) console.log(chalk.red('Database error ->'), err.message);
  if (connection) {
    console.log(
      chalk.blue('- Connected to'),
      chalk.magenta(connection.config.database),
      chalk.blue('on'),
      chalk.magenta(connection.config.host)
    );
    connection.release();
  }
  // return;
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;
