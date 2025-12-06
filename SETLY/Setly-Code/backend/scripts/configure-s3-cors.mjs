#!/usr/bin/env node

/**
 * Script to configure S3 CORS policy for Setly development
 * This allows the frontend to upload files directly to S3 from localhost
 */

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET || 'setly-s3-bucket';

const corsConfiguration = {
  CORSRules: [
    {
      // Allow development origins (full CRUD for uploads)
      AllowedOrigins: [
        'http://localhost:4200',
        'http://localhost:4201',
        'http://127.0.0.1:4200',
        'https://setly.app',
        'https://*.setly.app',
        'https://*.netlify.app'
      ],
      AllowedMethods: ['GET','POST','PUT','DELETE','HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag','x-amz-request-id'],
      MaxAgeSeconds: 3600
    },
    {
      // Allow presigned POST uploads from any origin (more secure than wildcard)
      AllowedOrigins: [
        'http://localhost:4200',
        'http://localhost:4201',
        'http://127.0.0.1:4200',
        'https://setly.app',
        'https://*.setly.app',
        'https://*.netlify.app'
      ],
      AllowedMethods: ['POST'],
      AllowedHeaders: ['*'],
      MaxAgeSeconds: 3600
    },
    {
      // Public dataset JSON (read-only, any origin)
      AllowedOrigins: ['*'],
      AllowedMethods: ['GET'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 300
    }
  ]
};

async function configureCORS() {
  try {
    console.log(`🔧 Configuring CORS for S3 bucket: ${bucketName}`);
    
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    
    console.log('✅ CORS configuration updated successfully!');
    console.log('📝 Allowed origins:');
    corsConfiguration.CORSRules[0].AllowedOrigins.forEach(origin => {
      console.log(`   - ${origin}`);
    });
    console.log('🎯 Frontend should now be able to upload files to S3');
    
  } catch (error) {
    console.error('❌ Failed to configure CORS:', error);
    
    if (error.name === 'NoSuchBucket') {
      console.log('💡 Make sure your S3 bucket exists and the name is correct in .env');
    } else if (error.name === 'AccessDenied') {
      console.log('💡 Make sure your AWS credentials have S3:PutBucketCors permission');
    }
    
    process.exit(1);
  }
}

// Check required environment variables
const required = ['AWS_REGION', 'AWS_S3_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.log('💡 Make sure your .env file is configured correctly');
  process.exit(1);
}

configureCORS();