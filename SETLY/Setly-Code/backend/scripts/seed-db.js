#!/usr/bin/env node
/** Seed script: populates a few example rooms if none exist. */
import { prisma } from '../dist/db/prisma.js';

async function main() {
  const count = await prisma.room.count();
  if (count > 0) {
    console.log(`Seed skipped: ${count} rooms already present.`);
    return;
  }
  console.log('Seeding sample rooms...');
  const basePhotos = [
    'https://placehold.co/600x400?text=Room+1',
    'https://placehold.co/600x400?text=Room+2',
    'https://placehold.co/600x400?text=Room+3'
  ];
  const amenitiesSets = [ ['Wi‑Fi','Heating','Furnished'], ['Wi‑Fi','Kitchen'], ['Air Conditioning','Parking'] ];
  for (let i=0;i<3;i++) {
    await prisma.room.create({
      data: {
        ownerId: 'dev-user',
        title: `Sample Room ${i+1}`,
        description: 'Example seeded room for development browsing.',
        city: 'Boston',
        state: 'MA',
        price: 1000 + i*150,
        deposit: 300,
        roomType: 'private',
        bath: 'shared',
        furnished: true,
        photos: { create: basePhotos.map(url => ({ url })) },
        amenities: { create: amenitiesSets[i].map(a => ({ name: a })) }
      }
    });
  }
  console.log('Seed complete.');
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
