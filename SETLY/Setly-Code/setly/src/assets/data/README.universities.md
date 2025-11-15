# University Dataset Assets

This folder supports offline / fast-first-paint university lookups for the autocomplete.

## Files
- `universities.us.min.json` – Small curated US subset for quick initial load.
- `universities.in.min.json` – Curated India subset.
- `universities.us.full.json` – OPTIONAL large full US dataset (place the contents of the provided `us_institutions.json` here). If present, the directory service prefers this over the min file.

## Expected Shapes
Hipolabs API shape (raw):
```jsonc
{
  "name": "University Name",
  "country": "United States",
  "state-province": "CA", // may be null
  "domains": ["example.edu"],
  "web_pages": ["https://example.edu/"]
}
```

Bundled (normalized) shape we accept directly (camelCase for webPages, optional city not used for scoring):
```jsonc
{
  "id": "sha1-hash-or-stable-id",
  "name": "University Name",
  "city": "Berkeley",
  "state": "CA",
  "country": "United States",
  "domains": ["example.edu"],
  "webPages": ["https://example.edu/"]
}
```
If using raw Hipolabs dump, you can keep `web_pages` and `state-province`; the service normalizes those when fetched live. For bundled files, prefer the normalized camelCase variant.

## Adding Full US Dataset
1. Obtain the full JSON (`us_institutions.json`).
2. Minify (optional but recommended):
   - VS Code: Select all, run a JSON minify extension; or
   - Command line:
```bash
jq -c '.' us_institutions.json > universities.us.full.json
```
3. Place `universities.us.full.json` in this directory.
4. Reload the app; first warm should report `source: bundled` with a higher count.

## Performance Notes
- Large file will be fetched once and cached (IndexedDB + localStorage).
- Initial search indexing uses the first character of names; O(n) pass.
- Consider splitting by letter if size becomes >10k entries (not needed yet).

## Regeneration
To refresh datasets periodically, re-run the Hipolabs fetch or internal scripts and replace the file. TTL (7 days) governs background revalidation.
