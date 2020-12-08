process.env.NODE_ENV = 'test';
const db = require('../db/db');
const supertest = require('supertest');
const app = require('../app');
const request = supertest('http://localhost:3000');

let token;
let confirmToken;

describe('DataBseRelatedTests', function () {
  // conneting databse before testing all the routes
  beforeAll((done) => {
    db.connect().then(() => {
      done();
    });
  });

  // closing server after testing all the routes
  afterAll((done) => {
    app.close();
    done();
  });

  // testing all the end points
  it('should get a response of base Route', async (done) => {
    const res = await request.get('/');
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /register Route', async (done) => {
    const res = await request.post('/api/register?role=user').send({
      firstName: 'Himanshu',
      lastName: 'Kashyap',
      emailId: 'hkashyap488@gmail.com',
      password: 'HK@123',
      organizationName: 'AttainU',
    });
    expect(res.status).toBe(201);
    done();
  });

  test('should get a response of /login Route', async (done) => {
    const res = await request.post('/api/login?role=user').send({
      emailId: 'hkashyap488@gmail.com',
      password: 'HK@123',
    });
    token = res.body.accessToken;
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /profile Route', async (done) => {
    const res = await request
      .get('/api/profile?role=user')
      .set({ Authorization: token });
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /change-password Route', async (done) => {
    const res = await request
      .patch('/api/change-password?role=user')
      .set({ Authorization: token })
      .send({
        emailId: 'hkashyap488@gmail.com',
        oldPassword: 'HK@123',
        newPassword: '123456',
      });
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /logout Route', async (done) => {
    const res = await request
      .delete('/api/logout?role=user')
      .set({ Authorization: token });
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /forgot-password Route', async (done) => {
    const res = await request.post('/api/forgot-password?role=user').send({
      emailId: 'hkashyap488@gmail.com',
    });
    expect(res.status).toBe(200);
    done();
  });

  it('should get a response of /get-data Route', async (done) => {
    const res = await request.get('/api/get-data?role=user');
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /get-token Route', async (done) => {
    const res = await request
      .get('/api/get-token?role=user')
      .set({ Authorization: token });
    confirmToken = res.body.user.confirmToken;
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /confirm-email Route', async (done) => {
    const res = await request.get(
      `/api/confirm-email/${confirmToken}?role=user`
    );
    expect(res.status).toBe(200);
    done();
  });

  test('should get a response of /reset-password Route', async (done) => {
    const res = await request
      .post(`/api/reset-password?role=user`)
      .set({ Authorization: token })
      .send({
        newPassword: 'HK@123',
        confirmPassword: 'HK@123',
      });
    expect(res.status).toBe(200);
    done();
  });
});
