import { Router, Request, Response } from 'express';
import { s3Service, EntityType } from '../services/s3.service';
import { uploadRateLimit } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';
import Joi from 'joi';

const router = Router();

// Apply upload rate limiting
router.use(uploadRateLimit);

// Validation schemas
const uploadUrlSchema = Joi.object({
  entityType: Joi.string().valid('rooms', 'rides', 'marketplace', 'users').required(),
  entityId: Joi.string().required(),
  filename: Joi.string().required(),
  contentType: Joi.string().pattern(/^image\/(jpeg|jpg|png|webp|gif)$/).required()
});

const batchUploadSchema = Joi.object({
  entityType: Joi.string().valid('rooms', 'rides', 'marketplace', 'users').required(),
  entityId: Joi.string().required(),
  files: Joi.array().items(
    Joi.object({
      filename: Joi.string().required(),
      contentType: Joi.string().pattern(/^image\/(jpeg|jpg|png|webp|gif)$/).required()
    })
  ).min(1).max(10).required()
});

/**
 * POST /api/upload/signed-url
 * Get a signed URL for uploading a single file
 */
router.post('/signed-url', async (req: Request, res: Response, next) => {
  try {
    const { error, value } = uploadUrlSchema.validate(req.body);
    if (error) {
      throw new AppError(400, error.details[0].message);
    }

    const { entityType, entityId, filename, contentType } = value;

    const result = await s3Service.getUploadUrl(
      entityType as EntityType,
      entityId,
      filename,
      contentType
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/upload/batch-signed-urls
 * Get multiple signed URLs for batch upload
 */
router.post('/batch-signed-urls', async (req: Request, res: Response, next) => {
  try {
    const { error, value } = batchUploadSchema.validate(req.body);
    if (error) {
      throw new AppError(400, error.details[0].message);
    }

    const { entityType, entityId, files } = value;

    const results = await s3Service.getBatchUploadUrls(
      entityType as EntityType,
      entityId,
      files
    );

    res.json({ uploadUrls: results });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/upload/:fileKey
 * Delete a file from S3
 */
router.delete('/:fileKey(*)', async (req: Request, res: Response, next) => {
  try {
    const { fileKey } = req.params;

    if (!fileKey) {
      throw new AppError(400, 'fileKey is required');
    }

    await s3Service.deleteFile(fileKey);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
