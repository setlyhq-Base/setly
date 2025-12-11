# 🎴 SETLY Dummy Users - Quick Reference Card

## 🔐 Universal Password
**ALL 50 users:** `Setly2025!`

---

## ⚡ Quick Commands

### Seed Database
```bash
cd SETLY/Setly-Code/backend-lambda
npm run seed:dummy-users
```

### Test Login (API)
```bash
POST /api/auth/login
{
  "email": "priya.sharma@northeastern.edu",
  "password": "Setly2025!"
}
```

---

## 👤 Top 10 Test Users

| Name | Email | Role | Location | Company/University |
|------|-------|------|----------|--------------------|
| Priya Sharma | priya.sharma@northeastern.edu | Student | Boston, MA | Northeastern University |
| Wei Chen | wei.chen@amazon.com | Professional | Seattle, WA | Amazon |
| Sofia Rodriguez | sofia.rodriguez@nyu.edu | Student | New York, NY | NYU |
| Ryan Mitchell | ryan.mitchell@meta.com | Professional | Menlo Park, CA | Meta |
| Yuki Tanaka | yuki.tanaka@umich.edu | Student | Ann Arbor, MI | UMich |
| Emma Larsen | emma.larsen@google.com | Professional | Mountain View, CA | Google |
| Ahmed Hassan | ahmed.hassan@utdallas.edu | Student | Dallas, TX | UT Dallas |
| Min-Ji Park | minji.park@tesla.com | Professional | Austin, TX | Tesla |
| Isabella Ferrari | isabella.ferrari@mit.edu | Student | Cambridge, MA | MIT |
| Nathan Kim | nathan.kim@netflix.com | Professional | Los Gatos, CA | Netflix |

---

## 📊 Quick Stats
- **Total:** 50 users
- **Students:** 40 (27 universities)
- **Professionals:** 10 (23 companies)
- **Password:** `Setly2025!` (all users)
- **Gender:** 25 F, 23 M, 2 NB
- **Nationalities:** 13 different

---

## 🌍 Users by City

**Boston (4):**
- priya.sharma@northeastern.edu (NEU)
- marcus.j@bu.edu (BU)

**San Francisco (11):**
- wei.chen@amazon.com (Amazon - Seattle)
- emma.larsen@google.com (Google)
- ryan.mitchell@meta.com (Meta)
- alex.rivera@airbnb.com (Airbnb)

**New York (5):**
- sofia.rodriguez@nyu.edu (NYU)
- anjali.gupta@columbia.edu (Columbia)
- ethan.cohen@spotify.com (Spotify)

**Austin (4):**
- minji.park@tesla.com (Tesla)
- samantha.lee@oracle.com (Oracle)
- elena.popov@amd.com (AMD)

---

## 🎓 Users by University

**Ivy League:**
- james.obrien@princeton.edu (Princeton)
- fatima.alrashid@stanford.edu (Stanford)
- anjali.gupta@columbia.edu (Columbia)
- hannah.schmidt@yale.edu (Yale)
- mateo.silva@upenn.edu (UPenn - Wharton)
- zara.mohammed@cornell.edu (Cornell)
- omar.zaki@brown.edu (Brown)

**Top Tech Schools:**
- isabella.ferrari@mit.edu (MIT)
- lakshmi.iyer@berkeley.edu (UC Berkeley)
- lucas.muller@cmu.edu (Carnegie Mellon)
- ravi.patel@gatech.edu (Georgia Tech)

**Others:**
- priya.sharma@northeastern.edu (NEU)
- marcus.j@bu.edu (BU)
- sofia.rodriguez@nyu.edu (NYU)
- yuki.tanaka@umich.edu (UMich)
- ahmed.hassan@utdallas.edu (UT Dallas)
- carlos.santos@asu.edu (ASU)

---

## 💼 Users by Company

**FAANG:**
- wei.chen@amazon.com (Amazon)
- ryan.mitchell@meta.com (Meta)
- emma.larsen@google.com (Google)
- tyler.washington@apple.com (Apple)
- nathan.kim@netflix.com (Netflix)

**Other Giants:**
- minji.park@tesla.com (Tesla)
- liam.thompson@microsoft.com (Microsoft)
- deshawn.williams@salesforce.com (Salesforce)
- olivia.brown@adobe.com (Adobe)
- nina.kovac@ibm.com (IBM)

**Unicorns:**
- ayesha.khan@stripe.com (Stripe)
- alex.rivera@airbnb.com (Airbnb)
- jordan.lee@uber.com (Uber)
- jasmine.wong@lyft.com (Lyft)
- ethan.cohen@spotify.com (Spotify)

---

## 🧪 Testing Scenarios

### Scenario 1: Student Housing
1. Login: `priya.sharma@northeastern.edu` / `Setly2025!`
2. Post room in Boston
3. Login: `marcus.j@bu.edu` / `Setly2025!`
4. Save the room
5. Message Priya

### Scenario 2: Tech Professional Network
1. Login: `wei.chen@amazon.com` / `Setly2025!`
2. Post ride Seattle → SF
3. Login: `emma.larsen@google.com` / `Setly2025!`
4. Join ride
5. Message Wei

### Scenario 3: Multi-City Marketplace
1. Login: `sofia.rodriguez@nyu.edu` / `Setly2025!`
2. Sell camera in NYC
3. Login: `anjali.gupta@columbia.edu` / `Setly2025!`
4. Save item
5. Message Sofia

---

## 📱 API Quick Test

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@northeastern.edu","password":"Setly2025!"}'

# Save token
TOKEN="<token_from_response>"

# Get user profile
curl http://localhost:3000/api/users/dummy-user-1 \
  -H "Authorization: Bearer $TOKEN"

# Post room
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Cozy 2BR","city":"Boston","state":"MA","price":1200}'
```

---

## 📚 Documentation

**Full Guides:**
- `DUMMY_USERS_GUIDE.md` - Complete system guide
- `DUMMY_USERS_CREDENTIALS.md` - All 50 credentials

**Data Files:**
- `src/data/dummy-users.json` - User profiles
- `src/scripts/seed-dummy-users.ts` - Seeding script
- `src/routes/auth.routes.ts` - Auth endpoints
- `src/db/models/User.ts` - User model

---

## 🚨 Common Issues

**"User not found"**
→ Run: `npm run seed:dummy-users`

**"Invalid password"**
→ Password is: `Setly2025!` (capital S, exclamation at end)

**"This account uses social login"**
→ User has no password (OAuth only). Use different account.

**"Token expired"**
→ Tokens last 30 days. Login again to get new token.

---

## 🎯 Next Steps

1. ✅ Seed database: `npm run seed:dummy-users`
2. ✅ Test login with any account
3. ✅ Build frontend email/password login UI
4. ✅ Test end-to-end user interactions
5. ✅ Deploy to production
6. ✅ Create realistic posts (rooms, rides, marketplace)

---

**Password:** `Setly2025!` (for ALL 50 users)  
**Commit:** `0975f11` - Ready to deploy! 🚀
