import { Router } from 'express';
import { PhoneController } from '../controllers/phone.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All phone routes require authentication
router.use(authMiddleware);

router.post('/send-otp', PhoneController.sendOtp);
router.post('/verify-otp', PhoneController.verifyOtp);
router.post('/reset-verification', PhoneController.resetPhoneVerification);

export default router;
