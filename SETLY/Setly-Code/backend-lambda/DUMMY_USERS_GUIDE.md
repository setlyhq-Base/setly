# 🧪 Dummy Users System - Complete Guide

## 📋 Overview

SETLY now has a complete dummy user database with 50 realistic users for end-to-end testing. This system includes:
- ✅ 50 diverse, realistic user profiles
- ✅ Email/password authentication 
- ✅ Full profile data (bio, interests, locations, etc.)
- ✅ Mix of students (40) and professionals (10)
- ✅ Diversity across gender, nationality, and location
- ✅ Ready to post rooms, rides, marketplace items
- ✅ Can send/receive messages

---

## 🚀 Quick Start

### 1. Install Dependencies (if not done)
```bash
cd SETLY/Setly-Code/backend-lambda
npm install
```

### 2. Seed Database
```bash
npm run seed:dummy-users
```

This will:
- Delete existing dummy users (userId starts with `dummy-user-`)
- Create 50 new realistic users
- Hash all passwords with bcrypt
- Display breakdown of students vs professionals
- Show universities and companies represented

### 3. Test Login
```bash
# Use any email from DUMMY_USERS_CREDENTIALS.md
# Password for ALL users: Setly2025!

POST /api/auth/login
{
  "email": "priya.sharma@northeastern.edu",
  "password": "Setly2025!"
}
```

---

## 🔐 Authentication Endpoints

### Register New User
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "photoUrl": "https://example.com/photo.jpg" # optional
}
```

**Response:**
```json
{
  "user": { ...userObject },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "user": { ...userObject },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Verify Token
```bash
POST /api/auth/verify-token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "user": { ...userObject },
  "valid": true
}
```

### Change Password
```bash
POST /api/auth/change-password
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

---

## 👥 User Data Structure

### MongoDB Schema
```typescript
{
  userId: string;              // Auto-generated: "dummy-user-1", "dummy-user-2", etc.
  email: string;               // Unique, indexed
  password: string;            // Bcrypt hashed (select: false)
  name: string;                // Full name
  photoUrl?: string;           // Profile photo URL
  coverImageUrl?: string;      // Cover/banner image
  headline?: string;           // Short tagline (80 chars)
  phone?: string;              // E.164 format
  bio?: string;                // About section (280 chars)
  city?: string;               // Current city
  state?: string;              // Current state
  university?: string;         // For students
  graduationYear?: number;     // Expected graduation
  major?: string;              // Field of study
  company?: string;            // For professionals
  title?: string;              // Job title
  role?: 'student' | 'professional';
  verified: boolean;           // General verification
  emailVerified?: boolean;     // Email confirmed
  phoneVerified?: boolean;     // Phone confirmed
  domainVerified?: boolean;    // .edu or company domain
  domainType?: 'university' | 'company' | null;
  verificationBadge?: 'student' | 'alumni' | 'verified';
  languages?: string[];        // Spoken languages
  interests?: string[];        // Hobbies/interests
  preferredCities?: string[];  // Preferred locations
  savedRooms: string[];        // Saved room IDs
  savedRides: string[];        // Saved ride IDs
  savedMarketplace: string[];  // Saved marketplace item IDs
  profileVisibility?: {
    about?: boolean;
    travelHistory?: boolean;
    reviews?: boolean;
    interests?: boolean;
    connections?: boolean;
    verification?: boolean;
  };
  lastLoginAt?: Date;
  isProfileComplete?: boolean;
  createdAt: Date;             // Auto-timestamp
  updatedAt: Date;             // Auto-timestamp
}
```

---

## 🎓 Dummy Users Breakdown

### Students (40 users)
**Universities:**
- Northeastern University
- Boston University
- New York University
- Rutgers University
- University of Michigan
- UT Dallas
- Arizona State University
- Princeton University
- Stanford University
- Columbia University
- MIT
- USC
- Cornell University
- UC Berkeley
- Yale University
- Georgia Tech
- UCLA
- Duke University
- UPenn (Wharton)
- Northwestern University
- Carnegie Mellon University
- Rice University
- Vanderbilt University
- Brown University
- UVA
- Georgetown University
- Emory University

### Professionals (10 users)
**Companies:**
- Amazon (SDE)
- Meta (Product Manager)
- Google (UX Designer)
- Tesla (Battery Engineer)
- Microsoft (Cloud Architect)
- Apple (iOS Developer)
- Salesforce (Sales Engineer)
- Netflix (Data Scientist)
- Spotify (Music Curator)
- Airbnb (Product Designer)
- Uber (Operations Manager)
- Adobe (PM)
- Intel (Chip Designer)
- Oracle (DB Engineer)
- IBM (Quantum Researcher)
- Stripe (FinTech Engineer)
- Lyft (PM)
- Slack (Engineering Manager)
- Shopify (E-commerce Strategist)
- Pinterest (CV Engineer)
- NVIDIA (GPU Architect)
- Twitter/X (Content Strategist)
- AMD (Verification Engineer)

### Demographics
**Gender:**
- Female: 25 users
- Male: 23 users
- Non-binary: 2 users

**Nationalities:**
- Indian: 8
- American: 10
- Chinese: 3
- Korean: 3
- African: 2
- Middle Eastern: 7
- Latino: 5
- European: 7
- Brazilian: 1
- Iranian: 1
- Pakistani: 1
- Russian: 1
- Canadian: 1

**Locations:**
- Boston/Cambridge, MA: 4
- San Francisco/Bay Area, CA: 11
- New York, NY: 5
- Los Angeles, CA: 3
- Seattle, WA: 2
- Austin, TX: 4
- Dallas, TX: 1
- Tempe, AZ: 1
- Ann Arbor, MI: 1
- ... and more

---

## 🔍 Example Users

### Student Example
```json
{
  "userId": "dummy-user-1",
  "name": "Priya Sharma",
  "email": "priya.sharma@northeastern.edu",
  "photoUrl": "https://i.pravatar.cc/150?img=1",
  "headline": "AI Researcher | Coffee Addict",
  "bio": "CS grad student at Northeastern | AI enthusiast | Love exploring Boston cafes",
  "city": "Boston",
  "state": "MA",
  "university": "Northeastern University",
  "graduationYear": 2026,
  "major": "Computer Science",
  "role": "student",
  "verificationBadge": "student",
  "languages": ["English", "Hindi", "Bengali"],
  "interests": ["AI", "Coffee", "Hiking", "Photography"],
  "verified": true,
  "emailVerified": true,
  "phoneVerified": true,
  "domainVerified": true,
  "domainType": "university"
}
```

### Professional Example
```json
{
  "userId": "dummy-user-4",
  "name": "Wei Chen",
  "email": "wei.chen@amazon.com",
  "photoUrl": "https://i.pravatar.cc/150?img=33",
  "headline": "SDE @ Amazon | Cloud Computing",
  "bio": "Software Engineer at Amazon AWS | Stanford alum | Tech enthusiast",
  "city": "Seattle",
  "state": "WA",
  "company": "Amazon",
  "title": "Software Development Engineer",
  "role": "professional",
  "verificationBadge": "verified",
  "languages": ["English", "Mandarin"],
  "interests": ["Coding", "Hiking", "Gaming", "Cloud Tech"],
  "verified": true,
  "emailVerified": true,
  "phoneVerified": true,
  "domainVerified": true,
  "domainType": "company"
}
```

---

## 🧪 Testing Scenarios

### 1. Login Flow
```bash
# Login as student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@northeastern.edu","password":"Setly2025!"}'

# Save token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Verify Token
```bash
curl -X POST http://localhost:3000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"'$TOKEN'"}'
```

### 3. Post a Room (as logged-in user)
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Cozy 2BR in Boston",
    "description": "Near Northeastern campus",
    "city": "Boston",
    "state": "MA",
    "price": 1200
  }'
```

### 4. Browse as Different Users
```bash
# Login as different users to test interactions
# User 1: Post room
# User 2: Save the room
# User 3: Message User 1
# User 4: Post ride to same city
# User 5: Join the ride
```

---

## 📁 Files Created

### Backend Files
```
backend-lambda/
├── src/
│   ├── db/
│   │   └── models/
│   │       └── User.ts                    # Updated with password field
│   ├── routes/
│   │   └── auth.routes.ts                 # NEW: Email/password auth endpoints
│   ├── scripts/
│   │   └── seed-dummy-users.ts            # NEW: Seeding script
│   └── data/
│       └── dummy-users.json               # NEW: 50 user profiles
├── DUMMY_USERS_CREDENTIALS.md             # NEW: Login credentials list
└── DUMMY_USERS_GUIDE.md                   # NEW: This file
```

### Updated Files
```
backend-lambda/
├── src/
│   └── index.ts                           # Added auth routes
└── package.json                           # Added bcrypt, jsonwebtoken
```

---

## 🔒 Security Features

### Password Hashing
- Uses bcrypt with salt rounds = 10
- Passwords never stored in plain text
- Pre-save hook auto-hashes on User model

### JWT Authentication
- Tokens expire in 30 days
- Signed with JWT_SECRET (set in environment)
- Contains userId and email claims

### Password Requirements
- Minimum 8 characters
- Required for registration
- Can be changed via /auth/change-password

### API Security
- Rate limiting on all auth endpoints
- CORS configured for allowed domains
- Helmet.js security headers
- Input validation with detailed errors

---

## 🌐 Environment Variables

Add to `.env`:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/setly
```

**Important:** Change `JWT_SECRET` in production!

---

## 🧹 Cleanup

### Remove All Dummy Users
```typescript
// In MongoDB shell or Compass
db.users.deleteMany({ userId: { $regex: /^dummy-user-/ } })
```

### Remove Specific User
```typescript
db.users.deleteOne({ email: "priya.sharma@northeastern.edu" })
```

### Re-seed from Scratch
```bash
npm run seed:dummy-users
# This automatically deletes old dummy users first
```

---

## 🎯 Next Steps

### 1. Frontend Integration
Update Angular auth service to support email/password:

```typescript
// auth.service.ts
loginWithEmail(email: string, password: string) {
  return this.http.post('/api/auth/login', { email, password });
}

registerWithEmail(email: string, password: string, name: string) {
  return this.http.post('/api/auth/register', { email, password, name });
}
```

### 2. Add Login UI
Create login form component:
- Email input
- Password input (with show/hide toggle)
- "Forgot password" link
- "Sign up" link
- Social login buttons (Google, Microsoft, Facebook)

### 3. Create Dummy Posts
Generate realistic test data:
- Rooms (40-50 listings across cities)
- Rides (30-40 rides with realistic times)
- Marketplace (20-30 items)
- Messages (conversations between users)

### 4. Testing Checklist
- [ ] Login with each role (student/professional)
- [ ] Post content as different users
- [ ] Save/unsave items
- [ ] Send messages between users
- [ ] Search/filter by location
- [ ] Verify profile visibility settings
- [ ] Test verification badges display

---

## 💡 Tips

**Password Remember:**
- All dummy users: `Setly2025!`
- Easy to type, meets requirements
- Use DUMMY_USERS_CREDENTIALS.md for reference

**Quick Login:**
```bash
# Student from Boston
priya.sharma@northeastern.edu / Setly2025!

# Professional from SF
wei.chen@amazon.com / Setly2025!

# Film student NYC
sofia.rodriguez@nyu.edu / Setly2025!
```

**Seeding:**
- Run as many times as needed
- Auto-deletes old dummy users
- Preserves real user data
- Takes ~10 seconds

**Testing:**
- Use different browsers for multi-user testing
- Use incognito tabs to simulate different sessions
- JWT tokens stored in localStorage
- 30-day token expiry

---

## 🐛 Troubleshooting

### "User already exists" during seeding
```bash
# Manually delete conflicting users
mongosh "mongodb+srv://cluster.mongodb.net/setly"
db.users.deleteMany({ userId: { $regex: /^dummy-user-/ } })
exit
npm run seed:dummy-users
```

### "Invalid email or password"
- Check email is exact (case-sensitive)
- Confirm password is: `Setly2025!`
- Ensure user was seeded successfully
- Check MongoDB connection

### "This account uses social login"
- User doesn't have password field set
- Only OAuth users (Google/Microsoft/Facebook)
- Dummy users all have passwords

### JWT errors
- Check JWT_SECRET is set in environment
- Verify token hasn't expired (30 days)
- Ensure token format is correct

---

## 📞 Support

**Files:**
- Main guide: `DUMMY_USERS_GUIDE.md`
- Credentials: `DUMMY_USERS_CREDENTIALS.md`
- Seeding script: `src/scripts/seed-dummy-users.ts`
- User data: `src/data/dummy-users.json`
- Auth routes: `src/routes/auth.routes.ts`
- User model: `src/db/models/User.ts`

**Commands:**
- Seed: `npm run seed:dummy-users`
- Build: `npm run build`
- Dev: `npm run dev`
- Deploy: `npm run deploy:prod`

---

**Version:** 1.0.0  
**Last Updated:** December 10, 2025  
**Total Users:** 50 (40 students, 10 professionals)  
**Password:** Setly2025! (all users)
