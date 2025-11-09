"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_CONFIG = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// Load required environment variables
const requiredEnvVars = [
    'AWS_REGION',
    'AWS_S3_BUCKET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});
// Create S3 client
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
exports.AWS_CONFIG = {
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_S3_BUCKET,
    maxFileSize: 8 * 1024 * 1024, // 8MB
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp']
};
