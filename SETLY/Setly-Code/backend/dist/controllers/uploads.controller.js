"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const uuid_1 = require("uuid");
const aws_1 = require("../config/aws");
const EXPIRY_SECONDS = 60; // Link expires in 1 minute
class UploadsController {
    static async getSignedUploadUrl(req, res) {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            // Validate request body
            const { contentType, size, keyPrefix } = req.body;
            if (!contentType || !size || !keyPrefix) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            // Validate content type
            if (!aws_1.AWS_CONFIG.allowedContentTypes.includes(contentType)) {
                return res.status(400).json({
                    error: 'Invalid content type. Allowed types: jpeg, png, webp'
                });
            }
            // Validate file size
            if (size > aws_1.AWS_CONFIG.maxFileSize) {
                return res.status(400).json({
                    error: 'File too large. Maximum size is 8MB'
                });
            }
            // Generate unique key
            const extension = contentType.split('/')[1];
            const key = `${keyPrefix}/${(0, uuid_1.v4)()}.${extension}`;
            // Create presigned POST
            const presignedPost = await (0, s3_presigned_post_1.createPresignedPost)(aws_1.s3Client, {
                Bucket: aws_1.AWS_CONFIG.bucketName,
                Key: key,
                Conditions: [
                    ['content-length-range', 0, aws_1.AWS_CONFIG.maxFileSize],
                    ['eq', '$Content-Type', contentType],
                    // Block public ACL
                    ['eq', '$x-amz-acl', 'private']
                ],
                Fields: {
                    'Content-Type': contentType,
                    'x-amz-acl': 'private'
                },
                Expires: EXPIRY_SECONDS
            });
            res.json({
                url: presignedPost.url,
                fields: presignedPost.fields,
                key,
                expiresAt: Date.now() + EXPIRY_SECONDS * 1000
            });
        }
        catch (error) {
            console.error('Error generating presigned URL:', error);
            res.status(500).json({ error: 'Failed to generate upload URL' });
        }
    }
}
exports.UploadsController = UploadsController;
