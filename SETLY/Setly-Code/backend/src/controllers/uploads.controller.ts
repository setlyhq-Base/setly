import { Request, Response } from 'express';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, AWS_CONFIG, AWS_ENABLED } from '../config/aws';
import fs from 'fs';
import path from 'path';

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
          error: 'Invalid content type. Allowed types: jpeg, png, webp, heic/heif'
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

  // POST /api/uploads/presign { type: 'avatar'|'room-photo'|'room-video'|'room-video-thumb', ext: 'jpg|png|webp|mp4|webm' }
  static async presignAvatar(req: AuthedRequest, res: Response) {
    try {
      // Provide dev fallback when AWS not configured: store file locally
      const devMode = !AWS_ENABLED;
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

      const { type, ext } = req.body || {};
      if (!type || !ext) return res.status(400).json({ error: 'Missing type or ext' });
      const normalizedExt = String(ext || '').toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(normalizedExt);
      const isVideo = ['mp4', 'webm'].includes(normalizedExt);
      const contentType = isImage
        ? `image/${normalizedExt === 'jpg' ? 'jpeg' : normalizedExt}`
        : (isVideo ? `video/${normalizedExt}` : `application/octet-stream`);
      if (!AWS_CONFIG.allowedContentTypes.includes(contentType as any)) {
        return res.status(400).json({ error: 'Invalid extension or content type' });
      }

      // Compute object key based on type
      let key: string;
      if (type === 'avatar') {
        key = `users/${req.user.uid}/avatar.${normalizedExt}`;
      } else if (type === 'room-photo') {
        key = `rooms/${req.user.uid}/${uuidv4()}.${normalizedExt}`;
      } else if (type === 'room-video') {
        key = `rooms/${req.user.uid}/videos/${uuidv4()}.${normalizedExt}`;
      } else if (type === 'room-video-thumb') {
        key = `rooms/${req.user.uid}/thumbs/${uuidv4()}.${normalizedExt}`;
      } else {
        return res.status(400).json({ error: 'Unsupported type' });
      }
      if (devMode) {
        // Local storage stub: we don't presign, just tell client to PUT to a local endpoint
        const localDir = path.join(process.cwd(), 'local-uploads');
        if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
        const fileName = key.split('/').slice(-1)[0];
        const publicUrl = `/uploads/local/${req.user.uid}/${fileName}?t=${Date.now()}`;
        // Return a simplified fields object so caller can reuse logic (will detect absence of AWS fields)
        return res.json({
          url: publicUrl,
          fields: {},
          key,
          contentType,
          publicUrl,
          expiresAt: Date.now() + EXPIRY_SECONDS * 1000,
          local: true
        });
      }

      const presignedPost = await createPresignedPost(s3Client!, {
        Bucket: AWS_CONFIG.bucketName,
        Key: key,
        Conditions: [
          ['content-length-range', 0, AWS_CONFIG.maxFileSize],
          ['eq', '$Content-Type', contentType],
          // Public-read so images/videos are directly viewable
          ['eq', '$x-amz-acl', 'public-read']
        ],
        Fields: {
          'Content-Type': contentType,
          'x-amz-acl': 'public-read'
        },
        Expires: EXPIRY_SECONDS
      });
      const publicUrl = `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`;
      return res.json({ url: presignedPost.url, fields: presignedPost.fields, key, contentType, publicUrl, expiresAt: Date.now() + EXPIRY_SECONDS * 1000 });
    } catch (error) {
      console.error('Error presigning avatar:', error);
      res.status(500).json({ error: 'Failed to presign upload' });
    }
  }
}