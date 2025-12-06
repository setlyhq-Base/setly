/* Jest-style test (requires jest + supertest setup in project). Placeholder illustrating fuzzy institution endpoint behavior. */
const request = require('supertest');
const app = require('../server'); // assuming server exports Express app

describe('GET /api/places/institution', () => {
  it('returns synthetic exact match', async () => {
    const res = await request(app).get('/api/places/institution').query({ name: 'Harvard University' });
    expect(res.status).toBe(200);
    expect(res.body.result).toBeTruthy();
    expect(res.body.result.source).toMatch(/institution-exact|institution-fuzzy|google-textsearch|synthetic/);
  });
});
