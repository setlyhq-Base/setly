#!/usr/bin/env node
// Simple end-to-end verification script for room media uploads & listing creation
// Run: node scripts/verify-media-flow.js

const fetch = global.fetch;
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function presign(type, ext){
  const res = await fetch(BASE + '/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ext })
  });
  if(!res.ok){ throw new Error('Presign failed: ' + res.status); }
  return res.json();
}

async function putLocal(url, contentType, buffer){
  const target = url.split('?')[0];
  const res = await fetch(BASE + target.replace(BASE,''), {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: buffer
  });
  if(!res.ok){ throw new Error('Local PUT failed: ' + res.status); }
  return res.json();
}

async function createRoom(photoUrls){
  const payload = {
    title: 'Verification Test Room',
    description: 'Automated test room with media',
    city: 'Testville',
    state: 'TS',
    price: 999,
    deposit: 200,
    roomType: 'private',
    bath: 'shared',
    furnished: true,
    photos: photoUrls,
    amenities: ['Wi‑Fi','Heating'],
    universityId: 'test-uni'
  };
  const res = await fetch(BASE + '/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok){ throw new Error('Create room failed: ' + res.status); }
  return res.json();
}

async function getRoom(id){
  const res = await fetch(BASE + '/api/rooms/' + id);
  if(!res.ok){ throw new Error('Get room failed: ' + res.status); }
  return res.json();
}

(async () => {
  try {
    console.log('[verify] Waiting for server start...');
    await sleep(400);

    // Presign 3 photos (PNG)
    console.log('[verify] Presigning photos');
    const presigns = [];
    for(let i=0;i<3;i++){ presigns.push(await presign('room-photo','png')); }

    // Prepare tiny fake PNG content (a minimal valid PNG header)
    const pngHeader = Buffer.from('89504e470d0a1a0a0000000d494844520000000100000001080200000090770d6b0000000a49444154789c6360000002000154a24f920000000049454e44ae426082','hex');

    const photoUrls = [];
    for(const p of presigns){
      if(p.local){
        await putLocal(p.url, p.contentType, pngHeader);
        photoUrls.push(p.publicUrl);
      } else {
        // S3 upload would require form POST; skip here (assume done by client). Use publicUrl.
        photoUrls.push(p.publicUrl);
      }
    }

    console.log('[verify] Creating room with uploaded photo URLs');
    const created = await createRoom(photoUrls);
    if(!created.id) throw new Error('Room creation did not return id');

    console.log('[verify] Fetching room by id');
    const fetched = await getRoom(created.id);
    if(!fetched.photos || fetched.photos.length < 3) throw new Error('Fetched room missing photos');

    console.log('[SUCCESS] Room created and photos persisted:', fetched.id);
    console.log('Photo URLs:', fetched.photos);
    process.exit(0);
  } catch (e){
    console.error('[FAIL]', e.message);
    process.exit(1);
  }
})();
