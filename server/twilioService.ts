import twilio from 'twilio';
import crypto from 'crypto';
import { db } from './db';
import { twoFactorCodes, users } from '@shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export class TwilioService {
  private static readonly CODE_EXPIRY_MINUTES = 5;
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly RATE_LIMIT_MINUTES = 1;

  static async sendVerificationCode(userId: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check rate limiting - only allow one code per minute
      const oneMinuteAgo = new Date(Date.now() - this.RATE_LIMIT_MINUTES * 60 * 1000);
      const recentCode = await db.select()
        .from(twoFactorCodes)
        .where(
          and(
            eq(twoFactorCodes.userId, userId),
            gt(twoFactorCodes.createdAt, oneMinuteAgo)
          )
        )
        .limit(1);

      if (recentCode.length > 0) {
        return { success: false, error: 'Please wait before requesting another code' };
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash the code for storage
      const codeHash = crypto.createHash('sha256').update(code).digest('hex');
      
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);
      
      // Store in database
      await db.insert(twoFactorCodes).values({
        id: nanoid(),
        userId,
        phoneNumber,
        codeHash,
        expiresAt,
        attempts: 0,
        verified: false,
      });

      // Send SMS via Twilio
      await client.messages.create({
        body: `Your Boreal verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  }

  static async verifyCode(userId: string, phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Hash the provided code
      const codeHash = crypto.createHash('sha256').update(code).digest('hex');
      
      // Find the most recent unverified code for this user
      const [storedCode] = await db.select()
        .from(twoFactorCodes)
        .where(
          and(
            eq(twoFactorCodes.userId, userId),
            eq(twoFactorCodes.phoneNumber, phoneNumber),
            eq(twoFactorCodes.verified, false),
            gt(twoFactorCodes.expiresAt, new Date())
          )
        )
        .orderBy(twoFactorCodes.createdAt)
        .limit(1);

      if (!storedCode) {
        return { success: false, error: 'Invalid or expired code' };
      }

      // Check if too many attempts
      if ((storedCode.attempts ?? 0) >= this.MAX_ATTEMPTS) {
        return { success: false, error: 'Too many attempts. Please request a new code' };
      }

      // Increment attempts
      await db.update(twoFactorCodes)
        .set({ attempts: (storedCode.attempts ?? 0) + 1 })
        .where(eq(twoFactorCodes.id, storedCode.id));

      // Verify the code
      if (storedCode.codeHash !== codeHash) {
        return { success: false, error: 'Invalid code' };
      }

      // Mark code as verified and update user's 2FA status
      await db.update(twoFactorCodes)
        .set({ verified: true })
        .where(eq(twoFactorCodes.id, storedCode.id));

      await db.update(users)
        .set({ 
          phoneNumber,
          is2FAEnabled: true 
        })
        .where(eq(users.id, userId));

      return { success: true };
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  }

  static async cleanup2FACodes(): Promise<void> {
    try {
      // Clean up expired codes older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      await db.delete(twoFactorCodes)
        .where(
          and(
            eq(twoFactorCodes.verified, false),
            lt(twoFactorCodes.expiresAt, oneHourAgo)
          )
        );
    } catch (error) {
      console.error('Error cleaning up 2FA codes:', error);
    }
  }
}