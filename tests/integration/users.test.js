const request = require('supertest');
const db = require('../../startup/db');
// let server;

const user = {
  first_name: 'John',
  last_name: 'Smith',
  email: 'john@test.com',
  password: '12345',
};

describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await db.query('DELETE FROM users WHERE email = ?', [user.email]);
    server.close();
  });
  describe('GET /', () => {
    it('should return all users', async () => {
      const newUser = await db.query('INSERT INTO users SET ?', [user]);
      userId = newUser.insertId;
      const res = await request(server).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(
        res.body.some((u) => u.first_name === user.first_name)
      ).toBeTruthy();
    });
  });
  describe('GET /:id', () => {
    it('should return user if valid id is passed', async () => {
      const newUser = await db.query('INSERT INTO users SET ?', [user]);
      userId = newUser.insertId;
      res = await request(server).get('/api/users/' + userId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', user.email);
    });
  });
  describe('GET /:id', () => {
    it('should return 404 if invalid id is passed', async () => {
      res = await request(server).get('/api/users/1');
      expect(res.status).toBe(404);
    });
  });
});
