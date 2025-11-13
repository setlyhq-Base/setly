#!/usr/bin/env node
const fetch = global.fetch;

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function assert(statusOk, message){ if(!statusOk){ throw new Error(message); } }

async function createRoom(photos){
  const payload = {
    title: 'Validation Test', city: 'X', state: 'Y', price: 1, roomType: 'private', bath: 'shared', furnished: false,
    photos
  };
  const res = await fetch(BASE + '/api/rooms', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  return res;
}

(async () => {
  // Expect failure with <3 photos
  const res1 = await createRoom(['a','b']);
  await assert(res1.status === 400, 'Expected 400 for <3 photos');

  // Expect success with >=3 photos
  const res2 = await createRoom(['a','b','c']);
  await assert(res2.status === 201, 'Expected 201 for 3 photos');
  const body = await res2.json();
  await assert(!!body.id, 'Expected id in response');
  console.log('[OK] Validation behavior correct');
})();
