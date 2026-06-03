const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

let app;
let authToken;
let adminToken;
let testVehicleId;
let testServiceId;
let testTransferId;

const testUser = { id: '999888777', name: 'Test User', email: 'test@test.com', phone: '0501234567', password: 'Test1234' };
const adminUser = { id: '111222333', name: 'Admin User', email: 'admin@test.com', phone: '0509999999', password: 'Admin1234' };

beforeAll(async () => {
  app = require('../server');
  await new Promise(r => setTimeout(r, 1000));

  // ניקוי משתמשי טסט אם קיימים
  const User = require('../models/User');
  await User.deleteMany({ id: { $in: [testUser.id, adminUser.id, '000000000'] } });
  const Vehicle = require('../models/Vehicle');
  await Vehicle.deleteMany({ userId: testUser.id });
  const Transfer = require('../models/transfer');
  await Transfer.deleteMany({ licensePlate: '1234567' });
});

afterAll(async () => {
  const User = require('../models/User');
  await User.deleteMany({ id: { $in: [testUser.id, adminUser.id, '000000000'] } });
  const Vehicle = require('../models/Vehicle');
  await Vehicle.deleteMany({ userId: testUser.id });
  const Transfer = require('../models/transfer');
  await Transfer.deleteMany({ licensePlate: '1234567' });
  await mongoose.connection.close();
});

// ─── AUTH ────────────────────────────────────────────────────
describe('AUTH', () => {
  test('POST /auth/register — הרשמה תקינה', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(201);
  });

  test('POST /auth/register — משתמש כבר קיים', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  test('POST /auth/register — שדות חסרים', async () => {
    const res = await request(app).post('/auth/register').send({ id: '123' });
    expect(res.status).toBe(400);
  });

  test('POST /auth/login — התחברות תקינה', async () => {
    const res = await request(app).post('/auth/login').send({ id: testUser.id, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test('POST /auth/login — סיסמה שגויה', async () => {
    const res = await request(app).post('/auth/login').send({ id: testUser.id, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('POST /auth/login — משתמש לא קיים', async () => {
    const res = await request(app).post('/auth/login').send({ id: '000000000', password: 'test' });
    expect(res.status).toBe(404);
  });
});

// ─── VEHICLES ────────────────────────────────────────────────
describe('VEHICLES', () => {
  test('POST /vehicles — הוספת רכב ללא טוקן', async () => {
    const res = await request(app).post('/vehicles').send({ licensePlate: '1234567', model: 'Toyota', year: 2020 });
    expect(res.status).toBe(403);
  });

  test('POST /vehicles — הוספת רכב תקין', async () => {
    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ licensePlate: '1234567', model: 'Toyota Corolla', year: 2020, kilometer: 50000 });
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    testVehicleId = res.body._id;
  });

  test('POST /vehicles — רכב כבר קיים', async () => {
    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ licensePlate: '1234567', model: 'Toyota Corolla', year: 2020 });
    expect(res.status).toBe(400);
  });

  test('GET /vehicles — קבלת רכבי המשתמש', async () => {
    const res = await request(app)
      .get('/vehicles')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /vehicles — ללא טוקן', async () => {
    const res = await request(app).get('/vehicles');
    expect(res.status).toBe(403);
  });
});

// ─── SERVICES ────────────────────────────────────────────────
describe('SERVICES', () => {
  test('POST /services — הוספת טיפול', async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ vehicleId: '1234567', type: 'החלפת שמן', date: '2024-01-15', cost: 300, garageName: 'מוסך בן דוד', kilometer: '55000' });
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    testServiceId = res.body._id;
  });

  test('GET /services/:vehicleId — קבלת טיפולים', async () => {
    const res = await request(app)
      .get('/services/1234567')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /services/:id — עדכון טיפול', async () => {
    const res = await request(app)
      .put(`/services/${testServiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'החלפת שמן', date: '2024-01-15', cost: 350, garageName: 'מוסך חדש', kilometer: '55000' });
    expect(res.status).toBe(200);
  });

  test('DELETE /services/:id — מחיקת טיפול', async () => {
    const res = await request(app)
      .delete(`/services/${testServiceId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });
});

// ─── TRANSFER ────────────────────────────────────────────────
describe('TRANSFER', () => {
  test('POST /transfer — ניסיון העברה לרכב שלא שייך', async () => {
    const res = await request(app)
      .post('/transfer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ licensePlate: '9999999', toId: '111111111' });
    expect(res.status).toBe(403);
  });

  test('POST /transfer — נמען לא קיים', async () => {
    const res = await request(app)
      .post('/transfer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ licensePlate: '1234567', toId: '000000000' });
    expect(res.status).toBe(404);
  });

  test('GET /transfer — שליפת בקשות', async () => {
    const res = await request(app)
      .get('/transfer')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── VEHICLES DELETE ─────────────────────────────────────────
describe('VEHICLES DELETE', () => {
  test('DELETE /vehicles/:id — מחיקת רכב תקין', async () => {
    const res = await request(app)
      .delete(`/vehicles/${testVehicleId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  test('DELETE /vehicles/:id — רכב לא קיים', async () => {
    const res = await request(app)
      .delete(`/vehicles/${testVehicleId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});
