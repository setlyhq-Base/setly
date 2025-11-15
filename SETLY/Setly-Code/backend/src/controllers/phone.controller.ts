import { Request, Response } from 'express';
import { PhoneService } from '../services/phone.service';

export class PhoneController {
  static async sendOtp(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      const userId = req.user?.id;

      if (!phone || !userId) {
        return res.status(400).json({ error: 'Phone number and user ID required' });
      }

      // Basic phone validation (US format for now)
      const phoneRegex = /^\+1\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format. Use +1XXXXXXXXXX' });
      }

      await PhoneService.sendOtp(phone);
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, code } = req.body;
      const userId = req.user?.id;

      if (!phone || !code || !userId) {
        return res.status(400).json({ error: 'Phone number, code, and user ID required' });
      }

      const isValid = await PhoneService.verifyOtp(phone, code);

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired code' });
      }

      // Update user phone verification status
      await PhoneService.updateUserPhoneVerified(userId, phone);

      res.json({ message: 'Phone verified successfully' });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  static async resetPhoneVerification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      await PhoneService.resetUserPhoneVerified(userId);
      res.json({ message: 'Phone verification reset' });
    } catch (error) {
      console.error('Reset phone verification error:', error);
      res.status(500).json({ error: 'Failed to reset phone verification' });
    }
  }
}
