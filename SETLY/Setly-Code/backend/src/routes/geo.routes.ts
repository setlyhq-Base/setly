import express from 'express';
import { randomUUID } from 'crypto';
import { UniversitiesService } from '../services/universities.service';

// Use global fetch if available (Node 18+), otherwise dynamically import node-fetch (ESM)
const getFetch = async (): Promise<any> => {
  if (typeof (globalThis as any).fetch === 'function') return (globalThis as any).fetch;
  const mod: any = await import('node-fetch');
  return mod.default || mod;
};

const router = express.Router();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

type Suggestion = {
  id: string;
  label: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  description?: string;
  kind: 'city' | 'university' | 'fallback';
  source: 'google_places' | 'universities' | 'open_meteo';
  meta?: Record<string, any>;
};

const looksLikeUniversityQuery = (input: string): boolean => {
  const q = input.toLowerCase();
  return /univ|college|school|institute|academy|polytech|campus/.test(q);
};

const parseComponent = (components: any[], types: string[]): string | undefined => {
  for (const t of types) {
    const match = components.find((c: any) => Array.isArray(c.types) && c.types.includes(t));
    if (match?.long_name) return match.long_name;
  }
  return undefined;
};

const isUnitedStatesCountry = (value?: string): boolean => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return false;
  return normalized === 'us' || normalized === 'usa' || normalized.includes('united states');
};

type AddressSuggestionPayload = {
  id: string;
  label: string;
  address: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  lat?: number;
  lon?: number;
  description?: string;
  source: 'google_places' | 'nominatim';
  meta?: Record<string, any>;
};

const fetchGoogleCitySuggestions = async ($fetch: any, query: string): Promise<Suggestion[]> => {
  if (!GOOGLE_PLACES_API_KEY) return [];
  const autoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&components=country:us&key=${GOOGLE_PLACES_API_KEY}`;
  try {
    const autoRes = await $fetch(autoUrl);
    if (!autoRes.ok) return [];
    const autoData: any = await autoRes.json();
    if (!autoData || (autoData.status && autoData.status !== 'OK' && autoData.status !== 'ZERO_RESULTS')) {
      console.warn('[geo/search] Google autocomplete status', autoData?.status, autoData?.error_message || '');
      return [];
    }
    const predictions: any[] = Array.isArray(autoData?.predictions) ? autoData.predictions.slice(0, 5) : [];
    const detailResults: Suggestion[] = [];
    for (const pred of predictions) {
      try {
        const placeId = pred.place_id;
        if (!placeId) continue;
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry,address_component,name,formatted_address&key=${GOOGLE_PLACES_API_KEY}`;
        const detailRes = await $fetch(detailUrl);
        if (!detailRes.ok) continue;
        const detailData: any = await detailRes.json();
        if (!detailData || detailData.status !== 'OK' || !detailData.result) continue;
        const comps = Array.isArray(detailData.result.address_components) ? detailData.result.address_components : [];
        const city = parseComponent(comps, ['locality', 'postal_town', 'administrative_area_level_2', 'administrative_area_level_3']) || detailData.result.name;
        const state = parseComponent(comps, ['administrative_area_level_1']);
        const countryComp = comps.find((c: any) => Array.isArray(c.types) && c.types.includes('country'));
        if (countryComp && !isUnitedStatesCountry(countryComp.short_name) && !isUnitedStatesCountry(countryComp.long_name)) {
          continue;
        }
        const country = countryComp?.long_name;
        const geom = detailData.result.geometry?.location || {};
        const lat = typeof geom.lat === 'number' ? geom.lat : undefined;
        const lon = typeof geom.lng === 'number' ? geom.lng : undefined;
        const mainText = pred?.structured_formatting?.main_text;
        const secondaryText = pred?.structured_formatting?.secondary_text;
        const label = (mainText && secondaryText) ? `${mainText}, ${secondaryText}` : (pred.description || detailData.result.formatted_address || city || '');
        const description = (state && country)
          ? `${state}, ${country}`
          : (country || state || detailData.result.formatted_address || '');
        detailResults.push({
          id: `google:${placeId}`,
          label,
          city: city || '',
          state: state || '',
          country: country || '',
          lat,
          lon,
          description,
          kind: 'city',
          source: 'google_places',
          meta: { placeId }
        });
      } catch (err) {
        console.warn('[geo/search] Google place details failed', err);
      }
    }
    return detailResults;
  } catch (err) {
    console.warn('[geo/search] Google autocomplete failed', err);
    return [];
  }
};

const fetchOpenMeteoSuggestions = async ($fetch: any, query: string): Promise<Suggestion[]> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  try {
    const r = await $fetch(url);
    if (!r.ok) return [];
    const data: any = await r.json();
    return Array.isArray(data?.results)
      ? data.results
  .filter((item: any) => isUnitedStatesCountry(item?.country))
        .map((item: any) => ({
      id: `open-meteo:${item.id}`,
      label: [item.name, item.admin1, item.country].filter(Boolean).join(', '),
      city: item.name || '',
      state: item.admin1 || item.admin2 || '',
      country: item.country || '',
      lat: item.latitude,
      lon: item.longitude,
      description: item.country || '',
      kind: 'fallback',
      source: 'open_meteo'
        }))
      : [];
  } catch (err) {
    console.warn('[geo/search] Open-Meteo fallback failed', err);
    return [];
  }
};

const fetchUniversitySuggestions = async (query: string): Promise<Suggestion[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  try {
  const matches = await UniversitiesService.search(trimmed, 6);
  const usMatches = matches.filter(u => isUnitedStatesCountry(u.country));
  return usMatches.map(u => ({
      id: `university:${u.id}`,
      label: u.name,
      city: u.city || undefined,
      state: u.state || undefined,
      country: u.country || undefined,
      description: [u.city, u.state, u.country].filter(Boolean).join(', '),
      kind: 'university',
      source: 'universities',
      meta: { universityId: u.id }
    }));
  } catch (err) {
    console.warn('[geo/search] university search failed', err);
    return [];
  }
};

const dedupeSuggestions = (items: Suggestion[]): Suggestion[] => {
  const seen = new Set<string>();
  const result: Suggestion[] = [];
  for (const item of items) {
    const key = [item.label, item.city, item.state, item.country, item.kind].map(v => (v || '').toLowerCase()).join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
};

const dedupeAddressSuggestions = (items: AddressSuggestionPayload[]): AddressSuggestionPayload[] => {
  const seen = new Set<string>();
  const result: AddressSuggestionPayload[] = [];
  for (const item of items) {
    const key = [item.address, item.label, item.postcode, item.city, item.state, item.country]
      .map(v => (v || '').toLowerCase())
      .join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
};

const fetchGoogleAddressSuggestions = async (
  $fetch: any,
  query: string,
  opts: { city?: string; state?: string; lat?: number; lon?: number }
): Promise<AddressSuggestionPayload[]> => {
  if (!GOOGLE_PLACES_API_KEY) return [];
  try {
    const cityContext = [opts.city, opts.state].filter(Boolean).join(', ').trim();
    const augmentedQuery = cityContext && !query.toLowerCase().includes(cityContext.toLowerCase())
      ? `${query}, ${cityContext}`
      : query;
    const params = new URLSearchParams({
      input: augmentedQuery,
      types: 'address',
      key: GOOGLE_PLACES_API_KEY
    });
    params.set('components', 'country:us');
    if (typeof opts.lat === 'number' && typeof opts.lon === 'number') {
      const radiusMeters = 25000;
      params.set('locationbias', `circle:${radiusMeters}@${opts.lat},${opts.lon}`);
      params.set('strictbounds', 'true');
    }
    params.set('sessiontoken', randomUUID());
    const autoRes = await $fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`);
    if (!autoRes.ok) return [];
    const autoData: any = await autoRes.json();
    if (!autoData || (autoData.status && autoData.status !== 'OK' && autoData.status !== 'ZERO_RESULTS')) {
      console.warn('[geo/address] Google autocomplete status', autoData?.status, autoData?.error_message || '');
      return [];
    }
    const predictions: any[] = Array.isArray(autoData?.predictions) ? autoData.predictions.slice(0, 6) : [];
    const detailed: AddressSuggestionPayload[] = [];
    for (const pred of predictions) {
      try {
        const placeId = pred?.place_id;
        if (!placeId) continue;
        const detailParams = new URLSearchParams({
          place_id: placeId,
          fields: 'address_component,geometry,formatted_address,name',
          key: GOOGLE_PLACES_API_KEY
        });
        const detailRes = await $fetch(`https://maps.googleapis.com/maps/api/place/details/json?${detailParams.toString()}`);
        if (!detailRes.ok) continue;
        const detailData: any = await detailRes.json();
        if (!detailData || detailData.status !== 'OK' || !detailData.result) continue;
        const comps = Array.isArray(detailData.result.address_components) ? detailData.result.address_components : [];
        const city = parseComponent(comps, ['locality', 'postal_town', 'administrative_area_level_2', 'administrative_area_level_3']);
        const state = parseComponent(comps, ['administrative_area_level_1']);
        const countryComp = comps.find((c: any) => Array.isArray(c.types) && c.types.includes('country'));
        if (countryComp && !isUnitedStatesCountry(countryComp.short_name) && !isUnitedStatesCountry(countryComp.long_name)) {
          continue;
        }
        const country = countryComp?.long_name || parseComponent(comps, ['country']);
        const postcode = parseComponent(comps, ['postal_code']);
        const geom = detailData.result.geometry?.location || {};
        const label = pred?.structured_formatting?.main_text || detailData.result.name || detailData.result.formatted_address || query;
        const secondary = pred?.structured_formatting?.secondary_text || [city, state, country].filter(Boolean).join(', ');
        if (opts.city) {
          const normalizedCity = (city || '').toLowerCase();
          const normalizedDesired = opts.city.toLowerCase();
          const formatted = (detailData.result.formatted_address || '').toLowerCase();
          if (normalizedCity && !normalizedCity.includes(normalizedDesired) && !normalizedDesired.includes(normalizedCity) && !formatted.includes(normalizedDesired)) {
            continue;
          }
        }
        if (opts.state) {
          const normalizedState = (state || '').toLowerCase();
          const normalizedDesiredState = opts.state.toLowerCase();
          const formatted = (detailData.result.formatted_address || '').toLowerCase();
          if (normalizedDesiredState && normalizedState && !normalizedState.includes(normalizedDesiredState) && !formatted.includes(normalizedDesiredState)) {
            continue;
          }
        }
        detailed.push({
          id: `google:${placeId}`,
          label,
          address: detailData.result.formatted_address || label,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
          postcode: postcode || undefined,
          lat: typeof geom.lat === 'number' ? geom.lat : undefined,
          lon: typeof geom.lng === 'number' ? geom.lng : undefined,
          description: secondary || undefined,
          source: 'google_places',
          meta: { placeId }
        });
      } catch (err) {
        console.warn('[geo/address] Google place details failed', err);
      }
    }
    return detailed;
  } catch (err) {
    console.warn('[geo/address] Google autocomplete failed', err);
    return [];
  }
};

const fetchNominatimAddressSuggestions = async (
  $fetch: any,
  query: string,
  opts: { city?: string; state?: string; lat?: number; lon?: number }
): Promise<AddressSuggestionPayload[]> => {
  const q = (query || '').trim();
  if (!q) return [];
  const biasCity = (opts.city || '').trim().toLowerCase();
  const biasState = (opts.state || '').trim().toLowerCase();
  const biasLat = typeof opts.lat === 'number' ? opts.lat : undefined;
  const biasLon = typeof opts.lon === 'number' ? opts.lon : undefined;

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
      ' plno ': ' plano ',
      ' ft ': ' fort ',
      ' mt ': ' mount '
    };
    let variant = ' ' + lower + ' ';
    Object.entries(replacements).forEach(([k,v]) => { variant = variant.replace(k, ' '+v+' '); });
    variant = variant.trim();
    const tokens = lower.split(/\s+/);
    if (/^\d+$/.test(tokens[0]) && tokens.length === 2) {
      tokens.push('street');
    }
    const appended = tokens.join(' ');
    const set = new Set<string>();
    [lower, variant, appended].forEach(v => { if (v !== lower && v.length >= 3) set.add(v); });
    return Array.from(set).slice(0,3);
  };

  const buildScopedQuery = (queryString: string): string => {
    if (!opts.city && !opts.state) return queryString;
    const segments = [queryString];
    if (opts.city) segments.push(opts.city);
    if (opts.state) segments.push(opts.state);
    segments.push('United States');
    return segments.filter(Boolean).join(', ');
  };

  const fetchNominatim = async (queryString: string) => {
    const scoped = buildScopedQuery(queryString);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=us&q=${encodeURIComponent(scoped)}`;
    const r = await $fetch(url, { headers: { 'User-Agent': 'setly.dev/geo-proxy (dev use)' } as any });
    if (!r.ok) return [] as any[];
    return await r.json() as any[];
  };

  try {
  const baseData = await fetchNominatim(q);
    let allData = [...baseData];
    if (baseData.length < 5) {
      const variants = buildVariants(q);
      for (const v of variants) {
        if (v === q) continue;
  const extra = await fetchNominatim(v);
        extra.forEach(e => { if (!allData.find(d => d.place_id === e.place_id)) allData.push(e); });
        if (allData.length >= 8) break;
      }
    }

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
      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    allData.sort((a,b) => {
      const da = levenshtein(qLower, String(a.display_name || '').toLowerCase().slice(0, qLower.length));
      const db = levenshtein(qLower, String(b.display_name || '').toLowerCase().slice(0, qLower.length));
      const aCity = (a.address?.city || a.address?.town || a.address?.village || a.address?.hamlet || '').toLowerCase();
      const aState = (a.address?.state || a.address?.region || '').toLowerCase();
      const bCity = (b.address?.city || b.address?.town || b.address?.village || b.address?.hamlet || '').toLowerCase();
      const bState = (b.address?.state || b.address?.region || '').toLowerCase();
      const aCityPenalty = biasCity && aCity ? (aCity.includes(biasCity) || biasCity.includes(aCity) ? -1 : 1) : 0;
      const bCityPenalty = biasCity && bCity ? (bCity.includes(biasCity) || biasCity.includes(bCity) ? -1 : 1) : 0;
      const aStatePenalty = biasState && aState ? (aState.includes(biasState) || biasState.includes(aState) ? -0.5 : 0.5) : 0;
      const bStatePenalty = biasState && bState ? (bState.includes(biasState) || biasState.includes(bState) ? -0.5 : 0.5) : 0;
      const aDist = (typeof biasLat === 'number' && typeof biasLon === 'number' && a.lat && a.lon)
        ? haversineKm(biasLat, biasLon, Number(a.lat), Number(a.lon))
        : 0;
      const bDist = (typeof biasLat === 'number' && typeof biasLon === 'number' && b.lat && b.lon)
        ? haversineKm(biasLat, biasLon, Number(b.lat), Number(b.lon))
        : 0;
      const scoreA = da + aCityPenalty + aStatePenalty + (aDist ? Math.min(aDist, 50) / 50 : 0);
      const scoreB = db + bCityPenalty + bStatePenalty + (bDist ? Math.min(bDist, 50) / 50 : 0);
      return scoreA - scoreB;
    });

    const matchesCity = (data: any) => {
      if (!opts.city) return true;
      const targetParts = opts.city.toLowerCase().split(',').map((part: string) => part.trim()).filter(Boolean);
      const target = targetParts[0] || opts.city.toLowerCase();
      const cityCandidates = [data.address?.city, data.address?.town, data.address?.village, data.address?.hamlet]
        .filter(Boolean)
        .map((value: string) => value.toLowerCase());
      return cityCandidates.some((value: string) => value.includes(target) || target.includes(value));
    };

    const items = allData
      .filter((d: any) => isUnitedStatesCountry(d.address?.country_code) || isUnitedStatesCountry(d.address?.country))
      .filter(matchesCity)
      .slice(0,8)
      .map((d: any) => ({
      id: String(d.place_id),
      label: d.display_name,
      address: d.display_name,
      city: d.address?.city || d.address?.town || d.address?.village || d.address?.hamlet || '',
      state: d.address?.state || d.address?.region || '',
      postcode: d.address?.postcode || '',
      country: d.address?.country || '',
      lat: d.lat ? parseFloat(d.lat) : undefined,
      lon: d.lon ? parseFloat(d.lon) : undefined,
      description: [
        d.address?.road || d.address?.residential || d.address?.pedestrian || undefined,
        d.address?.city || d.address?.town || d.address?.village || undefined,
        d.address?.state || undefined,
        d.address?.country || undefined
      ].filter(Boolean).join(', '),
      source: 'nominatim'
    })) as AddressSuggestionPayload[];

    return items;
  } catch (err) {
    console.warn('[geo/address] nominatim failed', err);
    return [];
  }
};

// GET /api/geo/search?q=west%20haven
router.get('/search', async (req, res) => {
  try {
    const $fetch = await getFetch();
    const q = (req.query.q as string || '').trim();
    if (q.length < 2) return res.json({ items: [] });
    const [google, universities] = await Promise.all([
      fetchGoogleCitySuggestions($fetch, q),
      fetchUniversitySuggestions(q)
    ]);
    let placeResults = google;
    if (!placeResults.length) {
      placeResults = await fetchOpenMeteoSuggestions($fetch, q);
    }
    const topUniversity = universities[0];
    const normalizedQuery = q.toLowerCase();
    const strongUniversityMatch = !!topUniversity && topUniversity.label.toLowerCase().includes(normalizedQuery);
    const combined = (looksLikeUniversityQuery(q) || strongUniversityMatch)
      ? [...universities, ...placeResults]
      : [...placeResults, ...universities];
    const items = dedupeSuggestions(combined)
      .filter(item => isUnitedStatesCountry(item.country))
      .slice(0, 10);
    res.json({ items });
  } catch (e: any) {
    console.error('[geo/search] error', e);
    res.status(500).json({ error: 'geo-failed' });
  }
});

// GET /api/geo/address?q=19%20kessler%20farm
router.get('/address', async (req, res) => {
  try {
    const $fetch = await getFetch();
    const q = (req.query.q as string || '').trim();
    if (q.length < 3) return res.json({ items: [] });
    const opts = {
      city: req.query.city as string | undefined,
      state: req.query.state as string | undefined,
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lon: req.query.lon ? Number(req.query.lon) : undefined
    };
    const googleSuggestions = await fetchGoogleAddressSuggestions($fetch, q, opts);
    let nominatimSuggestions: AddressSuggestionPayload[] = [];
    if (!googleSuggestions.length || googleSuggestions.length < 5) {
      nominatimSuggestions = await fetchNominatimAddressSuggestions($fetch, q, opts);
    }
    const items = dedupeAddressSuggestions([...googleSuggestions, ...nominatimSuggestions])
      .filter(item => isUnitedStatesCountry(item.country))
      .slice(0, 10);
    res.json({ items });
  } catch (e: any) {
    console.error('[geo/address] error', e);
    res.status(500).json({ error: 'geo-failed' });
  }
});

export default router;
