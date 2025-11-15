#!/usr/bin/env node
/**
 * Upload the built universities dataset to S3.
 * Requires environment variables: AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * Usage: node upload-universities-s3.js [--key universities/us_in_universities.json]
 */
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// Load env from repo root and backend/.env defensively
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const bucket = process.env.AWS_S3_BUCKET;
if (!bucket) {
  console.error('Missing AWS_S3_BUCKET');
  process.exit(1);
}
const keyArgIndex = process.argv.indexOf('--key');
const key = keyArgIndex > -1 ? process.argv[keyArgIndex + 1] : 'universities/us_in_universities.json';

const dataDir = path.join(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'us_in_universities.json');
if (!fs.existsSync(filePath)) {
  console.error('Dataset file not found. Run build-universities-dataset.js first.');
  process.exit(1);
}
const body = fs.readFileSync(filePath);

const missing = ['AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY'].filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing required AWS env vars:', missing.join(', '));
  process.exit(1);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

(async () => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'application/json',
      CacheControl: 'public, max-age=86400'
    };
    if (process.env.S3_PUBLIC_READ === '1') {
      // Works only if bucket ACLs are enabled; otherwise rely on bucket policy
      params.ACL = 'public-read';
    }
    await s3.send(new PutObjectCommand(params));
    console.log(`Uploaded dataset to s3://${bucket}/${key}`);
    console.log('Set environment universitiesDataUrl to:');
    console.log(`https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`);
  } catch (e) {
    console.error('Upload failed', e);
    process.exit(1);
  }
})();
