import { Request, Response } from 'express';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, AWS_CONFIG, AWS_ENABLED } from '../config/aws';

const EXPIRY_SECONDS = 60; // Link expires in 1 minute

type AuthedRequest = Request & { user?: { uid: string; email?: string } };

export class UploadsController {
  static async getSignedUploadUrl(req: AuthedRequest, res: Response) {
    try {
      if (!AWS_ENABLED) {
        return res.status(503).json({ error: 'Uploads disabled (AWS not configured)' });
      }
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
      if (!AWS_CONFIG.allowedContentTypes.includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid content type. Allowed types: jpeg, png, webp'
        });
      }

      // Validate file size
      if (size > AWS_CONFIG.maxFileSize) {
        return res.status(400).json({
          error: 'File too large. Maximum size is 8MB'
        });
      }

      // Generate unique key
      const extension = contentType.split('/')[1];
      const key = `${keyPrefix}/${uuidv4()}.${extension}`;

      // Create presigned POST
  const presignedPost = await createPresignedPost(s3Client!, {
        Bucket: AWS_CONFIG.bucketName,
        Key: key,
        Conditions: [
          ['content-length-range', 0, AWS_CONFIG.maxFileSize],
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
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }
}