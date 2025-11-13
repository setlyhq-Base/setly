#!/usr/bin/env node
const fetch = global.fetch;
const BASE = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  try {
    const res = await fetch(BASE + '/api/rooms');
    if (!res.ok) throw new Error('GET /api/rooms failed with ' + res.status);
    const body = await res.json();
    if (!body || !Array.isArray(body.items)) {
      throw new Error('Response shape invalid: expected { items: [] }');
    }
    console.log('[OK] /api/rooms returns items array with length:', body.items.length);
    process.exit(0);
  } catch (e) {
    console.error('[FAIL] ' + e.message);
    process.exit(1);
  }
})();
