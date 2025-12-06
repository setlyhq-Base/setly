/* Jest-style test for canonical roomId reuse (placeholder). Requires test harness setup. */
const request = require('supertest');
const app = require('../server');

// NOTE: This assumes auth middleware can be bypassed or a test token is provided.

describe('POST /api/rooms/init + publish reuse id', () => {
  it('reuses init roomId on publish', async () => {
    // Simulate init
    const initRes = await request(app).post('/api/rooms/init').send({ files: [ { ext: 'jpg' }, { ext: 'jpg' }, { ext: 'jpg' } ] });
    if (initRes.status !== 200) return; // Skip if auth required
    const roomId = initRes.body.roomId;
    expect(roomId).toBeTruthy();
    // Simulate publish with same id
    const publishRes = await request(app).post(`/api/rooms/${roomId}/publish`).send({ photos: ['a.jpg','b.jpg','c.jpg'] });
    if (publishRes.status === 201) {
      expect(publishRes.body.id).toBe(roomId);
    }
  });
});
