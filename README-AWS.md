# 🚀 Setly - Complete AWS Production Infrastructure

**Production-ready backend + frontend infrastructure for Setly on AWS**

This repository contains the complete Setly application with AWS Lambda backend, S3 image storage, CloudFront CDN, and Amplify frontend hosting.

## 📚 Quick Links

- **[🚀 Quick Start Guide](QUICK-START.md)** - Deploy in 10 minutes
- **[✅ Deployment Checklist](DEPLOYMENT-CHECKLIST.md)** - Step-by-step deployment
- **[📖 Full Deployment Guide](DEPLOYMENT.md)** - Comprehensive documentation
- **[📋 Implementation Summary](IMPLEMENTATION-SUMMARY.md)** - What's been built
- **[🔄 Amplify Redirects](AMPLIFY-REDIRECTS.md)** - Configure API proxying

## 🎯 What's Inside

### Backend (AWS Lambda)
**Location**: `SETLY/Setly-Code/backend-lambda/`

- ✅ Express.js API on AWS Lambda + API Gateway
- ✅ Explore APIs with caching (events, restaurants, places, etc.)
- ✅ Presigned S3 URLs for secure image uploads
- ✅ Rooms, Rides, Marketplace CRUD APIs
- ✅ Rate limiting and security hardening
- ✅ AWS Secrets Manager integration
- ✅ Multi-environment (dev/stage/prod)

### Frontend (Angular)
**Location**: `SETLY/Setly-Code/setly/`

- ✅ Angular 20 application
- ✅ AWS Amplify hosting
- ✅ Multi-environment configuration
- ✅ Optimized city switching (no blinks!)
- ✅ CloudFront image delivery

### Infrastructure
- ✅ S3 bucket for user uploads (rooms, rides, marketplace, users)
- ✅ CloudFront CDN for global image delivery
- ✅ Serverless Framework for infrastructure-as-code
- ✅ Automated deployment scripts

## 🏗️ Architecture

```
Users → Amplify (Frontend) → API Gateway → Lambda (Backend)
                                                 ↓
                                    ┌────────────┴────────────┐
                                    │                         │
                              Secrets Manager            S3 + CloudFront
                              (API Keys)                 (Images)
```

## 🚀 Deploy Now (3 Steps)

### 1. Deploy Backend

```bash
cd SETLY/Setly-Code/backend-lambda
npm install
./setup-secrets.sh dev      # Enter your API keys
./deploy.sh dev             # Deploy to AWS
```

**Copy the API Gateway URL** from output.

### 2. Configure Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Connect repository: `setlyhq-Base/setly`
3. Add environment variables:
   - `NODE_VERSION=20`
   - `NPM_FLAGS=--legacy-peer-deps`
   - `AMPLIFY_ENV=development`
   - `NG_API_URL=<YOUR-API-GATEWAY-URL>/dev`
4. Configure redirects (see [AMPLIFY-REDIRECTS.md](AMPLIFY-REDIRECTS.md))

### 3. Test

```bash
# Test backend
curl https://YOUR-API.../dev/api/health

# Visit frontend
open https://dev.setly.in
```

**Done!** 🎉

## 📁 Project Structure

```
setly-ver1/
├── 📚 Documentation
│   ├── QUICK-START.md
│   ├── DEPLOYMENT-CHECKLIST.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION-SUMMARY.md
│   └── AMPLIFY-REDIRECTS.md
│
├── 🔧 Configuration
│   ├── amplify.yml                  # Amplify build config
│   └── netlify.toml                 # Legacy (not used)
│
└── SETLY/Setly-Code/
    │
    ├── 🖥️ backend-lambda/           # Backend API
    │   ├── src/
    │   │   ├── index.ts             # Main Express app
    │   │   ├── routes/              # API endpoints
    │   │   ├── services/            # Business logic
    │   │   └── middleware/          # Auth, rate limit, etc.
    │   ├── serverless.yml           # AWS infrastructure
    │   ├── deploy.sh                # 🚀 Deploy script
    │   ├── setup-secrets.sh         # 🔐 Secrets setup
    │   ├── infra.sh                 # Management tool
    │   └── README.md
    │
    ├── 🌐 setly/                    # Frontend (Angular)
    │   ├── src/
    │   │   ├── app/                 # Application code
    │   │   └── environments/        # Config files
    │   └── ...
    │
    └── 🔧 backend/                  # Old backend (can be deprecated)
```

## 🔑 Required API Keys

Before deploying, obtain these API keys:

1. **Google Maps API Key**
   - Enable: Places API, Geocoding API, Maps JavaScript API
   - Get it: [Google Cloud Console](https://console.cloud.google.com/)

2. **Ticketmaster API Key**
   - Get it: [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)

3. **Eventbrite API Key** (Optional)
   - Get it: [Eventbrite API](https://www.eventbrite.com/platform/)

Run `./setup-secrets.sh dev` to store them securely in AWS.

## 🛡️ Security Features

✅ **No Secrets in Code**: All API keys in AWS Secrets Manager  
✅ **Private S3**: Bucket accessible only via CloudFront OAI  
✅ **Rate Limiting**: Prevents abuse (100 req/15min for explore)  
✅ **CORS**: Restricted to authorized domains only  
✅ **Presigned URLs**: Direct browser → S3 uploads  
✅ **HTTPS**: All traffic encrypted  

## ⚡ Performance Features

✅ **10-min Caching**: Explore data cached per city/category  
✅ **CDN**: Images served globally from CloudFront  
✅ **Direct Upload**: Browser → S3 (bypasses Lambda)  
✅ **Quality Filters**: Only 3.5+ rated, 10+ reviews  
✅ **Graceful Fallback**: UI never breaks if API fails  

## 📊 Cost Estimate

For moderate traffic (~10K users/month):

- Lambda: ~$5-10/month
- API Gateway: ~$3-5/month
- S3 + CloudFront: ~$5-10/month
- Secrets Manager: ~$1/month

**Total: ~$15-25/month** (pay-per-use, auto-scales)

## 🌍 Environments

| Environment | URL              | Branch              | Stage |
|-------------|------------------|---------------------|-------|
| Development | dev.setly.in     | feat/monorepo-setup | dev   |
| Staging     | stage.setly.in   | staging             | stage |
| Production  | setly.in         | main                | prod  |

## 📝 Backend API Endpoints

### Explore
- `GET /api/explore/:category` - Cached explore data
- `GET /api/explore/places/autocomplete` - City search
- `GET /api/explore/places/details` - Place details

### Upload
- `POST /api/upload/signed-url` - Get S3 upload URL
- `POST /api/upload/batch-signed-urls` - Batch uploads

### Rooms
- `GET /api/rooms` - Search rooms
- `POST /api/rooms` - Create listing
- `GET /api/rooms/:id` - Get details

### Rides
- `GET /api/rides` - Search rides
- `POST /api/rides` - Create listing

### Marketplace
- `GET /api/marketplace` - Search items
- `POST /api/marketplace` - Create listing

### Users
- `GET /api/users/:id` - Get profile
- `PUT /api/users/:id` - Update profile

## 🧪 Testing

```bash
# Test backend health
./infra.sh test dev

# View logs
./infra.sh logs dev

# Stack info
./infra.sh info dev
```

## 🔄 Making Updates

### Update Backend
```bash
cd SETLY/Setly-Code/backend-lambda
npm run build
./deploy.sh dev
```

### Update Frontend
```bash
git push origin feat/monorepo-setup
# Amplify auto-deploys
```

## 🐛 Troubleshooting

**Backend won't deploy?**
```bash
aws sts get-caller-identity  # Check credentials
./infra.sh logs dev          # Check CloudWatch logs
```

**Frontend returns 404?**
- Verify Amplify redirects configured
- Check `NG_API_URL` environment variable

**CORS errors?**
- Update CORS origins in `backend-lambda/src/index.ts`
- Redeploy: `./deploy.sh dev`

**Images not loading?**
- Verify CloudFront domain in SSM
- Check S3 bucket policy

## 📚 Documentation

- **Quick Start**: [QUICK-START.md](QUICK-START.md) - Fast deployment
- **Checklist**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Step-by-step
- **Full Guide**: [DEPLOYMENT.md](DEPLOYMENT.md) - Complete details
- **Summary**: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - What's built
- **Redirects**: [AMPLIFY-REDIRECTS.md](AMPLIFY-REDIRECTS.md) - Amplify config

## ✨ What's New vs Old Setup

| Feature | Old | New |
|---------|-----|-----|
| API Keys | Hardcoded | AWS Secrets Manager |
| API Calls | Direct to external | Proxied through Lambda |
| Caching | None | 10-minute cache |
| Rate Limiting | None | Comprehensive |
| Images | Local storage | S3 + CloudFront CDN |
| Uploads | Through backend | Direct to S3 |
| Scalability | Fixed server | Auto-scales |
| Cost | Fixed | Pay-per-use |

## 🎯 Next Steps

After deploying:

1. ✅ **Test Explore page** - Verify city switching works
2. ⬜ **Implement database** - MongoDB/DynamoDB in `database.service.ts`
3. ⬜ **Add authentication** - Firebase Auth middleware
4. ⬜ **Set up monitoring** - CloudWatch dashboards
5. ⬜ **Deploy to staging** - Test before production
6. ⬜ **Deploy to production** - Go live!

## 📞 Support

- CloudWatch Logs: `./infra.sh logs dev`
- Amplify Build Logs: Check Amplify Console
- Documentation: See links above

## 🙏 Credits

Built with:
- AWS Lambda + API Gateway
- Serverless Framework
- Express.js
- Angular 20
- AWS Amplify
- S3 + CloudFront

## 📄 License

Proprietary - Setly Inc.

---

**Ready to deploy?** Follow [QUICK-START.md](QUICK-START.md) now! 🚀
