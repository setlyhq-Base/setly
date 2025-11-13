"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.AWS_CONFIG = exports.AWS_ENABLED = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// Optional AWS integration: if any required var missing, we disable uploads gracefully.
const requiredEnvVars = ['AWS_REGION', 'AWS_S3_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const allPresent = requiredEnvVars.every(v => !!process.env[v]);
exports.AWS_ENABLED = allPresent;
exports.AWS_CONFIG = {
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
    ]
};
exports.s3Client = exports.AWS_ENABLED
    ? new client_s3_1.S3Client({
        region: exports.AWS_CONFIG.region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })
    : null;
