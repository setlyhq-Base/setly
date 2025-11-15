export interface CountryCode {
  code: string; // ISO alpha-2
  dial: string; // e.g., "+1"
  name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'CA', dial: '+1', name: 'Canada' },
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'AU', dial: '+61', name: 'Australia' },
  { code: 'DE', dial: '+49', name: 'Germany' },
  { code: 'FR', dial: '+33', name: 'France' },
  { code: 'IT', dial: '+39', name: 'Italy' },
  { code: 'ES', dial: '+34', name: 'Spain' },
  { code: 'MX', dial: '+52', name: 'Mexico' },
  { code: 'BR', dial: '+55', name: 'Brazil' },
  { code: 'CN', dial: '+86', name: 'China' },
  { code: 'JP', dial: '+81', name: 'Japan' },
  { code: 'KR', dial: '+82', name: 'South Korea' },
  { code: 'SG', dial: '+65', name: 'Singapore' },
  { code: 'AE', dial: '+971', name: 'United Arab Emirates' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
  { code: 'ZA', dial: '+27', name: 'South Africa' },
  { code: 'NG', dial: '+234', name: 'Nigeria' },
  { code: 'KE', dial: '+254', name: 'Kenya' },
  { code: 'NL', dial: '+31', name: 'Netherlands' },
  { code: 'SE', dial: '+46', name: 'Sweden' },
  { code: 'NO', dial: '+47', name: 'Norway' },
  { code: 'DK', dial: '+45', name: 'Denmark' },
  { code: 'CH', dial: '+41', name: 'Switzerland' },
  { code: 'IE', dial: '+353', name: 'Ireland' },
  { code: 'NZ', dial: '+64', name: 'New Zealand' },
  { code: 'PK', dial: '+92', name: 'Pakistan' },
  { code: 'BD', dial: '+880', name: 'Bangladesh' },
  { code: 'PH', dial: '+63', name: 'Philippines' },
  { code: 'ID', dial: '+62', name: 'Indonesia' },
  { code: 'VN', dial: '+84', name: 'Vietnam' },
  { code: 'TH', dial: '+66', name: 'Thailand' },
  { code: 'EG', dial: '+20', name: 'Egypt' },
  { code: 'IL', dial: '+972', name: 'Israel' },
  { code: 'TR', dial: '+90', name: 'Turkey' },
  { code: 'AR', dial: '+54', name: 'Argentina' },
  { code: 'CL', dial: '+56', name: 'Chile' },
  { code: 'CO', dial: '+57', name: 'Colombia' },
  { code: 'PE', dial: '+51', name: 'Peru' },
  { code: 'PT', dial: '+351', name: 'Portugal' },
  { code: 'PL', dial: '+48', name: 'Poland' },
  { code: 'GR', dial: '+30', name: 'Greece' },
  { code: 'BE', dial: '+32', name: 'Belgium' },
  { code: 'AT', dial: '+43', name: 'Austria' },
  { code: 'CZ', dial: '+420', name: 'Czechia' },
  { code: 'HU', dial: '+36', name: 'Hungary' },
  { code: 'RO', dial: '+40', name: 'Romania' },
  { code: 'UA', dial: '+380', name: 'Ukraine' },
  { code: 'RU', dial: '+7', name: 'Russia' }
];

// Utility: return the longest matching dial code for an E.164 string
export function matchDialCode(e164: string): CountryCode | null {
  if (!e164 || !e164.startsWith('+')) return null;
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (e164.startsWith(c.dial)) return c;
  }
  return null;
}

// Utility: convert ISO alpha‑2 country code to emoji flag
export function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '';
  const A = 0x1f1e6;
  const code = iso2.toUpperCase();
  const first = code.charCodeAt(0) - 65 + A;
  const second = code.charCodeAt(1) - 65 + A;
  return String.fromCodePoint(first) + String.fromCodePoint(second);
}
