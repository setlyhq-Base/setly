#!/usr/bin/env node
// Verify that address, city/state, and coordinates persist through create/get room
// Usage: BASE_URL=http://localhost:3000 node scripts/verify-address-persistence.js

const fetch = global.fetch;

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function createRoom(token, payload){
  const res = await fetch(BASE + '/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok){ throw new Error('Create room failed: ' + res.status + ' ' + await res.text()); }
  return res.json();
}

async function getRoom(token, id){
  const res = await fetch(BASE + '/api/rooms/' + id);
  if(!res.ok){ throw new Error('Get room failed: ' + res.status + ' ' + await res.text()); }
  return res.json();
}

async function devToken(){
  // In dev, backend accepts any uid via middleware stub or Firebase emulator; use a fixed string
  return process.env.DEV_TOKEN || 'dev-user-token';
}

(async () => {
  try {
    console.log('[verify-address] Waiting for server...');
    await sleep(300);

    const token = await devToken();
    const payload = {
      title: 'Addr Verify Room',
      description: 'Testing address persistence',
      address: '1600 Amphitheatre Pkwy',
      city: 'Mountain View',
      state: 'CA',
      lat: 37.422,
      lon: -122.084,
      price: 1000,
      roomType: 'private',
      bath: 'shared',
      photos: ['https://example.com/p1.jpg','https://example.com/p2.jpg','https://example.com/p3.jpg']
    };

    const created = await createRoom(token, payload);
    if(!created.id) throw new Error('No id on created');

    const fetched = await getRoom(token, created.id);
    const expect = (cond, msg) => { if(!cond) throw new Error(msg); };

    expect(!!fetched.address, 'Address missing');
    expect(fetched.address === payload.address, 'Address mismatch');
    expect(fetched.city === payload.city, 'City mismatch');
    expect(fetched.state === payload.state, 'State mismatch');
    expect(Math.abs(fetched.lat - payload.lat) < 0.0001, 'Lat mismatch');
    expect(Math.abs(fetched.lon - payload.lon) < 0.0001, 'Lon mismatch');

    console.log('[SUCCESS] Address and coordinates persisted for room', created.id);
    process.exit(0);
  } catch (e){
    console.error('[FAIL]', e.message);
    process.exit(1);
  }
})();
