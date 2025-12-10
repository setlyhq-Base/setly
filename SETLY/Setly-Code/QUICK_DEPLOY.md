# 🚀 Quick Deploy - 5 Minute Setup

## Step 1: MongoDB (2 min)

1. Go to https://mongodb.com/cloud/atlas → Sign in
2. Create Cluster → M0 FREE
3. Network Access → Add IP → **0.0.0.0/0** (Allow All)
4. Database Access → Add User:
   - Username: `setly-admin`
   - Password: Generate secure password
5. Copy connection string:
   ```
   mongodb+srv://setly-admin:PASSWORD@cluster0.xxxxx.mongodb.net/setly-dev
   ```

## Step 2: AWS SSM (1 min)

```bash
# Replace with your actual connection string
aws ssm put-parameter \
  --name "/setly/dev/mongodb-uri" \
  --value "mongodb+srv://setly-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/setly-dev?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region us-east-1
```

## Step 3: Deploy (2 min)

```bash
cd backend-lambda
npm install  # (if not done)
npm run build
npx serverless deploy --stage dev
```

**Copy the API URL from output:**
```
endpoint: ANY - https://abc123.execute-api.us-east-1.amazonaws.com/{proxy+}
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              Copy this URL
```

## Step 4: Test

```bash
# Replace with your API URL
curl https://abc123.execute-api.us-east-1.amazonaws.com/api/health

# Expected: {"status":"healthy","stage":"dev","timestamp":"..."}
```

## Step 5: Update Frontend (Production Only)

**For local dev:** No changes needed (uses proxy)

**For production:** Update `setly/src/environments/environment.ts`:
```typescript
apiUrl: 'https://abc123.execute-api.us-east-1.amazonaws.com/api',
apiBaseUrl: 'https://abc123.execute-api.us-east-1.amazonaws.com/api',
```

---

## ✅ Done!

Your backend is live. Test E2E:

1. Start frontend: `cd setly && npm start`
2. Go to http://localhost:4200
3. Post a room → Search → View → Message
4. Check Profile → My Rooms → Saved items

**All features should work end-to-end! 🎉**

---

## Need Help?

**MongoDB connection error:**
```bash
# Verify parameter exists
aws ssm get-parameter --name "/setly/dev/mongodb-uri" --with-decryption

# Check MongoDB network access allows 0.0.0.0/0
```

**404 errors:**
```bash
# Check deployment
npx serverless info --stage dev

# View logs
npx serverless logs -f api --stage dev --tail
```

**CORS errors:**
- Verify frontend URL in serverless.yml CORS config
- Redeploy if changed

---

## Files Reference

- **Backend Implementation:** `BACKEND_IMPLEMENTATION_COMPLETE.md`
- **Detailed Setup:** `COMPLETE_SETUP_GUIDE.md`
- **Deployment Guide:** `backend-lambda/DEPLOYMENT.md`

---

**Database Models:** User, Room, Ride, MarketplaceItem, Conversation  
**API Endpoints:** 30+ routes across Rooms, Rides, Marketplace, Users, Conversations  
**Status:** ✅ Production Ready
