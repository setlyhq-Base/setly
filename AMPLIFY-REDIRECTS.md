# Amplify Redirect Configuration

After deploying your backend Lambda, you need to configure Amplify to proxy API requests.

## Option 1: Using Amplify Console (Recommended)

1. Go to AWS Amplify Console
2. Select your app → App settings → Rewrites and redirects
3. Click "Add rule"
4. Add this rule:

```
Source: /api/<*>
Target: https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/dev/api/<*>
Type: 200 (Rewrite)
```

**Important**: Replace `YOUR-API-GATEWAY-URL` with your actual API Gateway URL from the Lambda deployment.

## Option 2: Using amplify.yml (Alternative)

If Amplify supports redirects in amplify.yml (check latest docs), you can add:

```yaml
# Add to amplify.yml under the frontend section
redirects:
  - source: /api/<*>
    target: https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/dev/api/<*>
    status: '200'
```

## Environment-Specific Redirects

For different environments:

**Dev** (`dev.setly.in`):
- Source: `/api/<*>`
- Target: `https://YOUR-DEV-API.../dev/api/<*>`

**Stage** (`stage.setly.in`):
- Source: `/api/<*>`
- Target: `https://YOUR-STAGE-API.../stage/api/<*>`

**Prod** (`setly.in`):
- Source: `/api/<*>`
- Target: `https://YOUR-PROD-API.../prod/api/<*>`

## Verify It Works

After configuring:

1. Visit your Amplify app (e.g., `https://dev.setly.in`)
2. Open DevTools → Network tab
3. Navigate to Explore page
4. Look for requests to `/api/explore/...`
5. Verify they return 200 (not 404 or CORS errors)

## Alternative: Use Direct API URL

If redirects don't work, you can update frontend to call API directly:

1. Add environment variable in Amplify:
   ```
   NG_API_URL=https://YOUR-API.execute-api.us-east-1.amazonaws.com/dev
   ```

2. Frontend will use this instead of relative `/api` paths

Both approaches work - redirects are cleaner but direct URLs are simpler.
