require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for demo purposes (use database in production)
const verificationCodes = new Map();
const users = new Map();

app.use(cors());
app.use(express.json());

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

app.post('/api/assistant', async (req, res) => {
  try {
    const { messages, max_tokens = 500, temperature = 0.7 } = req.body;

    // Mock response for now since OpenAI API is failing
    res.json({
      choices: [
        {
          message: {
            content: 'Hello! I\'m the Setly Assistant. I can help you find housing near universities, answer questions about relocation to the US, and provide guidance on various topics. How can I assist you today?',
          },
        },
      ],
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
