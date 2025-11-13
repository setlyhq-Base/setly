/**
 * One-off script (run with ts-node) to expand universities.json with full US list from Hipolabs.
 * Usage: ts-node scripts/generate-universities.ts > src/assets/mock/universities.json
 */
// Uses global fetch in Node 18+; if older Node version, install node-fetch.

interface HipolabsUniversity { name: string; country: string; domains: string[]; 'state-province': string | null; }

(async function main(){
  const resp = await fetch('https://universities.hipolabs.com/search?country=United%20States');
  const data: HipolabsUniversity[] = await resp.json();
  const normalized = data.map(u => ({
    id: (u.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$|(?<=-)$/g,'').slice(0,80),
    name: u.name,
    city: '',
    state: u['state-province'] || '',
    lat: 0,
    lng: 0
  }));
  console.log(JSON.stringify(normalized, null, 2));
})();
