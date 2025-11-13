#!/usr/bin/env node
/** Verification script: creates a room via API and fetches it back to ensure DB persistence. */
const API = process.env.API_URL || 'http://localhost:3000';

async function postRoom() {
  const payload = {
    title: 'DB Verification Room',
    description: 'Temporary room to verify database persistence.',
    city: 'Cambridge',
    state: 'MA',
    price: 1234,
    deposit: 250,
    roomType: 'private',
    bath: 'shared',
    furnished: true,
    photos: [
      'https://placehold.co/600x400?text=Verify1',
      'https://placehold.co/600x400?text=Verify2',
      'https://placehold.co/600x400?text=Verify3'
    ],
    amenities: ['Wi‑Fi','Heating'],
    universityId: 'u-demo'
  };
  const res = await fetch(API + '/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Create failed: ' + res.status + ' ' + (await res.text()));
  return res.json();
}

async function getRoom(id) {
  const res = await fetch(API + '/api/rooms/' + id);
  if (!res.ok) throw new Error('Fetch failed: ' + res.status + ' ' + (await res.text()));
  return res.json();
}

(async () => {
  try {
    const created = await postRoom();
    console.log('[verify-db] Created room id:', created.id);
    const fetched = await getRoom(created.id);
    if (fetched.id !== created.id) throw new Error('Mismatch IDs');
    console.log('[verify-db] Fetched room title:', fetched.title);
    console.log('[verify-db] Photos count:', fetched.photos.length);
    console.log('[verify-db] OK');
  } catch (e) {
    console.error('[verify-db] FAILED', e);
    process.exit(1);
  }
})();
