import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class PhoneService {
  static async sendOtp(phone: string): Promise<void> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to database
    await prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Setly verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new Error('Failed to send verification code');
    }
  }

  static async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        expiresAt: {
          gt: new Date(),
        },
        attempts: {
          lt: 3, // Allow up to 3 attempts
        },
      },
    });

    if (!otpRecord) {
      // Increment attempts if record exists but invalid
      const existingRecord = await prisma.otpCode.findFirst({
        where: { phone, code },
      });
      if (existingRecord) {
        await prisma.otpCode.update({
          where: { id: existingRecord.id },
          data: { attempts: existingRecord.attempts + 1 },
        });
      }
      return false;
    }

    // Delete the OTP record after successful verification
    await prisma.otpCode.delete({
      where: { id: otpRecord.id },
    });

    return true;
  }

  static async updateUserPhoneVerified(userId: string, phone: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        phoneVerified: true,
      },
    });
  }

  static async resetUserPhoneVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: false,
      },
    });
  }
}
