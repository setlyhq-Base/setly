import express from 'express';
import { UploadsController } from '../controllers/uploads.controller';

const router = express.Router();

// POST /api/uploads/sign - Get presigned POST URL for S3 upload
router.post('/sign', UploadsController.getSignedUploadUrl);

export default router;