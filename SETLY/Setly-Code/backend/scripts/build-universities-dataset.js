#!/usr/bin/env node
/**
 * Build a normalized combined universities dataset from local source JSON files.
 * Expected input files (place them under backend/data before running):
 *   backend/data/us_institutions.json        // [{ "institution": "University Name" }, ...]
 *   backend/data/indian_university_list.json // [{ "name": "University Name" }, ...] OR same shape as US
 * Output:
 *   backend/data/us_in_universities.json     // normalized array of { id, name, country }
 */
const fs = require('fs');
const path = require('path');

function simpleHash(str) {
  let h = 0; for (let i=0;i<str.length;i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0; return 'r'+(h>>>0).toString(16);
}

function normalizeUS(entry) {
  if (!entry) return null;
  const name = entry.name || entry.institution;
  if (!name) return null;
  return { id: simpleHash(name), name, country: 'United States' };
}

function normalizeIN(entry) {
  if (!entry) return null;
  const name = entry.name || entry.institution;
  if (!name) return null;
  return { id: simpleHash('IN|' + name), name, country: 'India' };
}

function loadJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return []; }
}

function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const usFile = path.join(dataDir, 'us_institutions.json');
  const inFile = path.join(dataDir, 'indian_university_list.json');
  const outFile = path.join(dataDir, 'us_in_universities.json');
  const usRaw = loadJSON(usFile);
  const inRaw = loadJSON(inFile);
  const us = Array.isArray(usRaw) ? usRaw.map(normalizeUS).filter(Boolean) : [];
  let ind = [];
  if (Array.isArray(inRaw)) {
    ind = inRaw.map(normalizeIN).filter(Boolean);
  } else if (inRaw && typeof inRaw === 'object') {
    // Flatten state-code keyed arrays of names
    for (const [stateCode, arr] of Object.entries(inRaw)) {
      if (Array.isArray(arr)) {
        for (const name of arr) {
          if (typeof name === 'string' && name.trim()) {
            ind.push(normalizeIN({ name: name.trim() }));
          }
        }
      }
    }
    ind = ind.filter(Boolean);
  }
  // Dedup by name+country
  const byKey = new Map();
  for (const e of [...us, ...ind]) {
    const key = (e.name.toLowerCase() + '|' + e.country.toLowerCase());
    if (!byKey.has(key)) byKey.set(key, e);
  }
  const list = Array.from(byKey.values());
  fs.writeFileSync(outFile, JSON.stringify(list));
  console.log(`Wrote ${list.length} universities to ${outFile}`);
}

main();
