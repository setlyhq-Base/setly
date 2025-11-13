import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

// Optional AWS integration: if any required var missing, we disable uploads gracefully.
const requiredEnvVars = ['AWS_REGION', 'AWS_S3_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];

const allPresent = requiredEnvVars.every(v => !!process.env[v]);

export const AWS_ENABLED = allPresent;

export const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucketName: process.env.AWS_S3_BUCKET || 'disabled-bucket',
  // Allow larger uploads to support short room videos
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedContentTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/webm'
  ] as const
};

export const s3Client = AWS_ENABLED
  ? new S3Client({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
  : null;