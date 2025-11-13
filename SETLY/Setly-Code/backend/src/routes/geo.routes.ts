import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// GET /api/geo/search?q=west%20haven
// Uses Open-Meteo geocoding for city suggestions (https://open-meteo.com/en/docs/geocoding-api)
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (q.length < 2) return res.json({ items: [] });
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'upstream-failed' });
    const data: any = await r.json();
    const items = (data.results || []).map((r: any) => ({
      id: String(r.id),
      name: r.name,
      city: r.name,
      state: r.admin1 || r.admin2 || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude
    }));
    res.json({ items });
  } catch (e: any) {
    console.error('[geo/search] error', e);
    res.status(500).json({ error: 'geo-failed' });
  }
});

// GET /api/geo/address?q=19%20kessler%20farm
// Uses OpenStreetMap Nominatim for address autocomplete (respect usage policy; proxy sets UA)
router.get('/address', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (q.length < 3) return res.json({ items: [] });
    const biasCity = (req.query.city as string || '').trim().toLowerCase();
    const biasState = (req.query.state as string || '').trim().toLowerCase();
    const biasLat = req.query.lat ? Number(req.query.lat) : undefined;
    const biasLon = req.query.lon ? Number(req.query.lon) : undefined;
    // Helper: build variant queries to improve fuzzy matching for abbreviations / common misspellings
    const buildVariants = (input: string): string[] => {
      const lower = input.toLowerCase();
      const replacements: Record<string,string> = {
        ' st ': ' street ',
        ' strt ': ' street ',
        ' rd ': ' road ',
        ' ave ': ' avenue ',
        ' av ': ' avenue ',
        ' blvd ': ' boulevard ',
        ' dr ': ' drive ',
        ' ln ': ' lane ',
        ' ct ': ' court ',
        ' hwy ': ' highway ',
        ' plno ': ' plano ', // custom example
        ' ft ': ' fort ',
        ' mt ': ' mount '
      };
      let variant = ' ' + lower + ' ';
      Object.entries(replacements).forEach(([k,v]) => { variant = variant.replace(k, ' '+v+' '); });
      variant = variant.trim();
      const tokens = lower.split(/\s+/);
      // If pattern number + token without street type, append 'street'
      if (/^\d+$/.test(tokens[0]) && tokens.length === 2) {
        tokens.push('street');
      }
      const appended = tokens.join(' ');
      const set = new Set<string>();
      [lower, variant, appended].forEach(v => { if (v !== lower && v.length >= 3) set.add(v); });
      return Array.from(set).slice(0,3); // cap variants to avoid abuse
    };

    const fetchNominatim = async (query: string) => {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(query)}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'setly.dev/geo-proxy (dev use)' } as any });
      if (!r.ok) return [] as any[];
      return await r.json() as any[];
    };

    const baseData = await fetchNominatim(q);
    let allData = [...baseData];
    if (baseData.length < 5) {
      // Try variant queries for fuzzy recovery
      const variants = buildVariants(q);
      for (const v of variants) {
        if (v === q) continue;
        const extra = await fetchNominatim(v);
        // Merge unique by place_id
        extra.forEach(e => { if (!allData.find(d => d.place_id === e.place_id)) allData.push(e); });
        if (allData.length >= 8) break; // enough suggestions
      }
    }

    // Basic Levenshtein to rank how close display_name is to the original query
    const levenshtein = (a: string, b: string): number => {
      const m = a.length, n = b.length;
      const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1));
      for (let i=0;i<=m;i++) dp[i][0] = i;
      for (let j=0;j<=n;j++) dp[0][j] = j;
      for (let i=1;i<=m;i++) {
        for (let j=1;j<=n;j++) {
          const cost = a[i-1] === b[j-1] ? 0 : 1;
          dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
        }
      }
      return dp[m][n];
    };

    const qLower = q.toLowerCase();
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    allData.sort((a,b) => {
      const da = levenshtein(qLower, String(a.display_name || '').toLowerCase().slice(0, qLower.length));
      const db = levenshtein(qLower, String(b.display_name || '').toLowerCase().slice(0, qLower.length));
      // City/State match bonus (lower is better)
      const aCity = (a.address?.city || a.address?.town || a.address?.village || a.address?.hamlet || '').toLowerCase();
      const aState = (a.address?.state || a.address?.region || '').toLowerCase();
      const bCity = (b.address?.city || b.address?.town || b.address?.village || b.address?.hamlet || '').toLowerCase();
      const bState = (b.address?.state || b.address?.region || '').toLowerCase();
      const aCityPenalty = biasCity && aCity ? (aCity.includes(biasCity) || biasCity.includes(aCity) ? -1 : 1) : 0;
      const bCityPenalty = biasCity && bCity ? (bCity.includes(biasCity) || biasCity.includes(bCity) ? -1 : 1) : 0;
      const aStatePenalty = biasState && aState ? (aState.includes(biasState) || biasState.includes(aState) ? -0.5 : 0.5) : 0;
      const bStatePenalty = biasState && bState ? (bState.includes(biasState) || biasState.includes(bState) ? -0.5 : 0.5) : 0;
      // Distance score if bias coords provided
      const aDist = (typeof biasLat === 'number' && typeof biasLon === 'number' && a.lat && a.lon)
        ? haversineKm(biasLat, biasLon, Number(a.lat), Number(a.lon))
        : 0;
      const bDist = (typeof biasLat === 'number' && typeof biasLon === 'number' && b.lat && b.lon)
        ? haversineKm(biasLat, biasLon, Number(b.lat), Number(b.lon))
        : 0;
      // Weighted score: edit weights to taste
      const scoreA = da + aCityPenalty + aStatePenalty + (aDist ? Math.min(aDist, 50) / 50 : 0);
      const scoreB = db + bCityPenalty + bStatePenalty + (bDist ? Math.min(bDist, 50) / 50 : 0);
      return scoreA - scoreB;
    });

    const items = allData.slice(0,8).map((d: any) => ({
      id: String(d.place_id),
      label: d.display_name,
      address: d.display_name,
      houseNumber: d.address?.house_number || undefined,
      road: d.address?.road || d.address?.residential || d.address?.pedestrian || undefined,
      city: d.address?.city || d.address?.town || d.address?.village || d.address?.hamlet || '',
      state: d.address?.state || d.address?.region || '',
      postcode: d.address?.postcode || '',
      country: d.address?.country || '',
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon)
    }));
    res.json({ items });
  } catch (e: any) {
    console.error('[geo/address] error', e);
    res.status(500).json({ error: 'geo-failed' });
  }
});

export default router;
