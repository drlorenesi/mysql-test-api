// Test file for running queries before adding them to a route.
// Run "node test.js" on terminal

const db = require('./db');

const CURRENT_TIMESTAMP = {
  toSqlString: function () {
    return 'CURRENT_TIMESTAMP()';
  },
};

// Test Query
async function test() {
  try {
    const result = await db.query('SELECT 1 + 1 AS solution');
    console.log(result);
  } catch (ex) {
    console.log(ex.message);
  }
}

// Select Query
async function select() {
  try {
    const result = await db.query('SELECT * FROM users');
    console.log(result);
  } catch (ex) {
    console.log(ex.message);
  }
}

// Select by id Query
async function selectById() {
  try {
    const result = await db.query('SELECT * FROM users WHERE user_id=?', [1]);
    console.log(result);
  } catch (ex) {
    console.log(ex.message);
  }
}

// Insert Query
async function insert() {
  try {
    const result = await db.query('INSERT INTO users SET ?', {
      first_name: 'John',
      last_name: 'Smith',
      modified: CURRENT_TIMESTAMP,
    });
    console.log('Inserted rows:', result.affectedRows);
  } catch (ex) {
    console.log(ex.message);
  }
}

// Update Query
async function update() {
  try {
    const result = await db.query(
      'UPDATE users SET modified = ? WHERE user_id = ?',
      [CURRENT_TIMESTAMP, 1]
    );
    console.log('Updated rows:', result.changedRows);
  } catch (ex) {
    console.log(ex.message);
  }
}

// Delete Query
async function deleteQuery() {
  try {
    const result = await db.query('DELETE FROM users WHERE user_id = ?', [7]);
    console.log('Affected rows:', result.affectedRows);
  } catch (ex) {
    console.log(ex.message);
  }
}

// test();
// select();
// selectById();
insert();
// update();
// deleteQuery();
