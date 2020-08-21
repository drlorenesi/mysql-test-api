// Before running tests make sure there is no data in the
// test DataBase
const request = require('supertest');
const db = require('../../startup/db');
const generateAuthToken = require('../../utils/generateAuthToken');
let server;

const user = {
  first_name: 'John',
  last_name: 'Smith',
  email: 'john@test.com',
  password: '12345',
  user_level: 0,
};

const admin = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'admin@test.com',
  password: '12345',
  user_level: 1,
};

describe('/api/users', () => {
  beforeAll(() => {
    server = require('../../index');
  });
  // beforeEach(() => {
  //   server = require('../../index');
  // });
  afterEach(async () => {
    await db.query('DELETE FROM users WHERE email = ?', [
      user.email,
      admin.email,
    ]);
  });
  afterAll(async () => {
    db.end();
    server.close();
  });
  describe('GET /', () => {
    it('should return all users', async () => {
      // Insert Ordinary User
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
    // Insert Admin User
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
      res = await request(server).get('/api/users/x');
      expect(res.status).toBe(404);
    });
  });
  describe('GET /me', () => {
    it('should return 401 if not logged in', async () => {
      res = await request(server).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });
  describe('PUT /:id', () => {
    it('should return 401 if user is not logged in', async () => {
      res = await request(server).put('/api/users/1');
      expect(res.status).toBe(401);
    });
    it('should return 403 if user is not authorized', async () => {
      const token = generateAuthToken(user, process.env.jwtPrivateKey);
      res = await request(server)
        .put('/api/users/1')
        .set('x-auth-token', token);
      expect(res.status).toBe(403);
    });
  });
});
