"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploads_controller_1 = require("../controllers/uploads.controller");
const router = express_1.default.Router();
// POST /api/uploads/sign - Get presigned POST URL for S3 upload
router.post('/sign', uploads_controller_1.UploadsController.getSignedUploadUrl);
// Generic presign (avatars, room media)
router.post('/presign', uploads_controller_1.UploadsController.presignAvatar);
exports.default = router;
