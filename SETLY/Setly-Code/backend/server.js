require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { CreateBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Firebase Admin (for verifying ID tokens in /api/auth/sync)
let admin;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('[backend] Firebase Admin initialized');
  }
} catch (e) {
  console.warn('[backend] Firebase Admin not initialized – set GOOGLE_APPLICATION_CREDENTIALS or service account env');
}

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// In-memory storage for demo purposes (use database in production)
const verificationCodes = new Map();
const users = new Map(); // legacy signup flow users keyed by email
const profiles = new Map(); // keyed by firebase uid
// Cache for external university dataset
let usUniversitiesCache = { data: null, lastFetched: 0 };

app.use(cors());
app.use(express.json());
// Serve static uploads (front-end expects direct URLs when local presign returns /uploads/local/...)
const path = require('path');
app.use('/uploads/local', express.static(path.join(process.cwd(), 'local-uploads')));

// Organizations allowlist
const organizations = [
  // Universities
  { id: '1', name: 'Harvard University', domain: 'harvard.edu', type: 'university' },
  { id: '2', name: 'Stanford University', domain: 'stanford.edu', type: 'university' },
  { id: '3', name: 'Massachusetts Institute of Technology', domain: 'mit.edu', type: 'university' },
  { id: '4', name: 'University of California, Berkeley', domain: 'berkeley.edu', type: 'university' },
  { id: '5', name: 'Yale University', domain: 'yale.edu', type: 'university' },
  { id: '6', name: 'University of New Haven', domain: 'newhaven.edu', type: 'university' },
  { id: '7', name: 'Princeton University', domain: 'princeton.edu', type: 'university' },
  { id: '8', name: 'Columbia University', domain: 'columbia.edu', type: 'university' },
  { id: '9', name: 'University of Chicago', domain: 'uchicago.edu', type: 'university' },
  { id: '10', name: 'University of Pennsylvania', domain: 'upenn.edu', type: 'university' },
  // Companies
  { id: '101', name: 'Google', domain: 'google.com', type: 'company' },
  { id: '102', name: 'Microsoft', domain: 'microsoft.com', type: 'company' },
  { id: '103', name: 'Apple', domain: 'apple.com', type: 'company' },
  { id: '104', name: 'Amazon', domain: 'amazon.com', type: 'company' },
  { id: '105', name: 'Meta', domain: 'meta.com', type: 'company' },
  { id: '106', name: 'Netflix', domain: 'netflix.com', type: 'company' },
  { id: '107', name: 'Tesla', domain: 'tesla.com', type: 'company' },
  { id: '108', name: 'Uber', domain: 'uber.com', type: 'company' },
];

app.post('/api/signup/initiate', (req, res) => {
  try {
    const { name, role, organizationId, email, password, termsAccepted } = req.body;

    // Validate organization
    const org = organizations.find(o => o.id === organizationId);
    if (!org) {
      return res.status(400).json({ error: 'Invalid organization' });
    }

    // Validate email domain
    const emailDomain = email.split('@')[1];
    if (emailDomain !== org.domain) {
      return res.status(400).json({ error: 'Email domain does not match selected organization' });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationData = {
      email,
      code,
      attempts: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      draft: { name, role, organizationId, email, password, termsAccepted }
    };

    verificationCodes.set(email, verificationData);

    console.log(`Verification code for ${email}: ${code}`); // In production, send via email

    res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Signup initiation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signup/verify', (req, res) => {
  try {
    const { code } = req.body;
    const email = req.body.email; // In production, get from session/token

    const verification = verificationCodes.get(email);
    if (!verification) {
      return res.status(400).json({ error: 'No verification in progress' });
    }

    if (new Date() > verification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (verification.attempts >= verification.maxAttempts) {
      return res.status(400).json({ error: 'Too many attempts' });
    }

    verification.attempts++;

    if (code !== verification.code) {
      if (verification.attempts >= verification.maxAttempts) {
        verificationCodes.delete(email);
        return res.status(400).json({ error: 'Too many failed attempts' });
      }
      return res.status(400).json({ error: `Invalid code. ${verification.maxAttempts - verification.attempts} attempts remaining.` });
    }

    // Mark as verified
    verification.verified = true;
    verificationCodes.set(email, verification);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signup/complete', (req, res) => {
  try {
    const { graduationYear, jobTitle, company, phone, budgetMin, budgetMax, roomType } = req.body;
    const email = req.body.email; // In production, get from session/token

    const verification = verificationCodes.get(email);
    if (!verification || !verification.verified) {
      return res.status(400).json({ error: 'Email not verified' });
    }

    // Create user
    const user = {
      id: Date.now().toString(),
      name: verification.draft.name,
      email: verification.draft.email,
      password: verification.draft.password, // Store password for login
      role: verification.draft.role,
      organization: organizations.find(o => o.id === verification.draft.organizationId),
      emailVerified: true,
      graduationYear: verification.draft.role === 'student' ? graduationYear : undefined,
      jobTitle: verification.draft.role === 'professional' ? jobTitle : undefined,
      company: verification.draft.role === 'professional' ? company : undefined,
      phone,
      preferences: {
        budgetMin: budgetMin || 500,
        budgetMax: budgetMax || 1500,
        roomType: roomType || 'private'
      }
    };

    // Check if graduated student should be alumni
    if (user.role === 'student' && user.graduationYear && user.graduationYear < new Date().getFullYear()) {
      user.role = 'alumni';
    }

    users.set(email, user);
    verificationCodes.delete(email);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/organizations', (req, res) => {
  const { q, type } = req.query;
  let filtered = organizations;

  if (type) {
    filtered = filtered.filter(org => org.type === type);
  }

  if (q && q.length >= 2) {
    const query = q.toLowerCase();
    filtered = filtered.filter(org =>
      org.name.toLowerCase().includes(query) ||
      org.domain.toLowerCase().includes(query)
    );
  }

  res.json(filtered.slice(0, 8));
});

// Helper to derive a friendly display name from auth or request context
async function getDisplayNameFromRequest(req) {
  // 1) If Firebase Admin is configured and we have an auth token, prefer that
  try {
    const authz = req.headers.authorization || '';
    const token = authz.startsWith('Bearer ') ? authz.slice('Bearer '.length) : null;
    if (admin && token) {
      const decoded = await admin.auth().verifyIdToken(token);
      const uid = decoded.uid;
      // Prefer profile name if we have one from prior auth/sync; fallback to token name/email prefix
      const p = profiles.get(uid);
      if (p?.displayName && p.displayName.trim()) return p.displayName.trim();
      if (decoded.name && decoded.name.trim()) return decoded.name.trim();
      if (decoded.email) return decoded.email.split('@')[0];
    }
  } catch (e) {
    // No-op; fall through to other strategies
  }
  // 2) Accept explicit name provided by client (use with care; for non-auth demos)
  const explicit = req.body?.userName || req.body?.name;
  if (explicit && typeof explicit === 'string') return explicit.trim();
  return null;
}

app.post('/api/assistant', async (req, res) => {
  try {
    const { messages = [], max_tokens = 120, temperature = 0.7 } = req.body || {};
    const name = await getDisplayNameFromRequest(req);
    const first = name ? name.split(' ')[0] : null;

    // Extract last user message (simple heuristic: last item or last role === 'user')
    let lastUserText = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!m) continue;
      if (!m.role || m.role === 'user') { lastUserText = (m.content || '').trim(); break; }
    }
    if (!lastUserText && typeof req.body?.prompt === 'string') lastUserText = req.body.prompt.trim();

    // Ultra‑short response heuristic: answer directly, keep <= 180 chars.
    function craftReply(input) {
      if (!input) return first ? `Hi ${first}, how can I help?` : 'Hi, how can I help?';
      const q = input.replace(/\s+/g, ' ').slice(0, 300);
      // Basic classifiers
      const lower = q.toLowerCase();
      let answer = '';
      if (/budget|price/.test(lower)) answer = 'Typical student room ranges $800–$1500 depending on city.';
      else if (/room|housing|apartment|rent/.test(lower)) answer = 'Filter by distance, budget, and verified hosts for best matches.';
      else if (/ride|car|transport|airport/.test(lower)) answer = 'Shared rides fill fast—reserve at least 48h ahead.';
      else if (/sim|phone|plan/.test(lower)) answer = 'eSIM activation is usually instant; pick unlimited data if you travel a lot.';
      else if (/bank|account|ssn/.test(lower)) answer = 'Open a student-friendly bank first; SSN only needed for credit lines/jobs.';
      else if (/visa|passport|immigration/.test(lower)) answer = 'Keep originals + scans; check I-20/SEVIS status before travel.';
      else if (/hello|hi|hey|help/.test(lower)) answer = 'Ask me about housing, rides, verification, or settling in.';
      else if (/thank/.test(lower)) answer = 'You’re welcome! Need anything else?';
      else if (/university|college|campus/.test(lower)) answer = 'Campus listings with verified profiles tend to secure faster.';
      else if (/profile|verification|verify/.test(lower)) answer = 'Add photo + university to boost trust & match rates.';
      else if (/phone/.test(lower)) answer = 'Verified phone lets hosts confirm logistics quickly.';
      else if (/location|boston|nyc|new york|san francisco|sf|chicago|la|los angeles/.test(lower)) answer = 'Urban cores cost more—expand radius 3–5 miles to save.';
      else answer = 'Got it—want a deeper answer or should I keep it brief?';
      // Personalize
      if (first) {
        // Avoid repeating greeting each turn; just weave name naturally
        if (!/\b(?:hi|hello|hey)\b/i.test(lower)) answer = `${first}, ${answer.charAt(0).toLowerCase() === 'y' ? answer : answer}`;
      }
      // Trim to target brevity
      if (answer.length > 180) answer = answer.slice(0,177).replace(/[,.;!]?$/,'') + '…';
      return answer;
    }

    const isFirstTurn = messages.length <= 1;
    const reply = isFirstTurn
      ? (first ? `Hi ${first}, I’m here—ask me about housing, rides, or settling in.` : 'Hi, I’m here—ask me about housing, rides, or settling in.')
      : craftReply(lastUserText);

    // Mock response payload (simulating OpenAI format)
    res.json({
      choices: [
        { message: { content: reply } }
      ],
      usage: { prompt_tokens: (lastUserText || '').length, completion_tokens: reply.length }
    });
  } catch (error) {
    console.error('Error calling Assistant mock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------- Auth Sync (Firebase → Backend) ------------------------------------
// Verifies the Firebase ID token, upserts a minimal profile, and returns data
// required by the frontend stores. Uses in-memory Maps for demo purposes.
function completionFromProfile(p, v) {
  let score = 0;
  if (p.avatarUrl && (p.displayName || p.firstName)) score += 20;
  if (p.about && Array.isArray(p.interests) && p.interests.length >= 3) score += 15;
  if (p.location && (p.university || p.company)) score += 15;
  if (v.phoneVerified || v.emailVerified) score += 20;
  if (v.eduVerified || v.idVerified) score += 20;
  if (p.visibility && Object.prototype.hasOwnProperty.call(p.visibility, 'showCity')) score += 10;
  return Math.min(100, score);
}

app.post('/api/auth/sync', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    if (!admin) return res.status(500).json({ error: 'admin-not-configured' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const canonicalUser = {
      userId: uid,
      email: decoded.email ?? null,
      phone: decoded.phone_number ?? null,
      displayName: decoded.name ?? null,
      photoUrl: decoded.picture ?? null,
      provider: decoded.firebase?.sign_in_provider ?? 'unknown',
    };

    const existing = profiles.get(uid);
    const isNew = !existing;
    const profile = existing || {
      userId: uid,
      displayName: canonicalUser.displayName,
      avatarUrl: canonicalUser.photoUrl,
      about: '',
      interests: [],
      languages: [],
      socials: {},
      visibility: { publicProfile: true, showCity: true, showSchool: false },
      location: '',
    };
    profiles.set(uid, profile);

    const verifications = {
      emailVerified: !!decoded.email && decoded.email_verified === true,
      phoneVerified: !!decoded.phone_number,
      eduVerified: !!profile.eduVerified,
      idVerified: !!profile.idVerified,
    };
    const completion = completionFromProfile(profile, verifications);

    res.json({ user: canonicalUser, profile, completion, isNew });
  } catch (err) {
    console.error('auth/sync error', err);
    res.status(401).json({ error: 'auth/sync-failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// -------- Universities directory (US ~6k) -----------------------------------
// Uses the Hipolabs public dataset; caches results in-memory to avoid repeated network calls
async function loadAllUSUniversities() {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (usUniversitiesCache.data && (Date.now() - usUniversitiesCache.lastFetched) < ONE_DAY) {
    return usUniversitiesCache.data;
  }
  try {
    const resp = await fetch('https://universities.hipolabs.com/search?country=United%20States');
    const raw = await resp.json();
    // Normalize to a compact structure used by the frontend
    const normalized = raw.map(u => ({
      id: (u.alpha_two_code || 'US') + ':' + (u.name || '').toLowerCase().replace(/\s+/g,'-').slice(0,80),
      name: u.name,
      state: (u['state-province'] || ''),
      city: '',
      domain: Array.isArray(u.domains) && u.domains.length ? u.domains[0] : '',
      country: u.country || 'United States'
    }));
    usUniversitiesCache = { data: normalized, lastFetched: Date.now() };
    return normalized;
  } catch (e) {
    console.error('[universities] fetch failed', e);
    return [];
  }
}

app.get('/api/universities', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    const limitParam = parseInt((req.query.limit || '').toString(), 10);
    const all = await loadAllUSUniversities();
    let list = all;
    if (q.length >= 2) {
      list = all.filter(u => (u.name || '').toLowerCase().includes(q) || (u.state || '').toLowerCase().includes(q) || (u.domain || '').toLowerCase().includes(q));
    }
    // If no query provided, return the full directory (as requested) so client can filter locally.
    // If a limit is specified, honor it (useful for previews).
    if (!q && Number.isFinite(limitParam) && limitParam > 0) return res.json(list.slice(0, limitParam));
    res.json(list);
  } catch (e) {
    console.error('[universities] error', e);
    res.status(500).json({ error: 'universities_unavailable' });
  }
});

// Phone verification routes
app.use('/api/phone', require('./src/routes/phone.routes'));
