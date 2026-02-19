import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuthToken,
  AuthTokenDocument,
  TokenType,
} from '../schemas/auth-token.schema';
import * as crypto from 'crypto';

@Injectable()
export class AuthTokenService {
  constructor(
    @InjectModel(AuthToken.name)
    private readonly authTokenModel: Model<AuthTokenDocument>,
  ) {}

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new auth token for a user
   */
  async createToken(
    userId: string | Types.ObjectId,
    type: TokenType,
    expiresInHours = 24,
  ): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Invalidate any existing tokens of this type for this user
    await this.authTokenModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        type,
        used: false,
      },
      {
        used: true,
        usedAt: new Date(),
      },
    );

    // Create new token
    await this.authTokenModel.create({
      userId: new Types.ObjectId(userId),
      type,
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  /**
   * Verify and consume a token
   */
  async verifyAndConsumeToken(
    token: string,
    type: TokenType,
  ): Promise<{ valid: boolean; userId?: Types.ObjectId; reason?: string }> {
    const tokenDoc = await this.authTokenModel.findOne({ token, type });

    if (!tokenDoc) {
      return { valid: false, reason: 'Token not found' };
    }

    if (tokenDoc.used) {
      return { valid: false, reason: 'Token already used' };
    }

    if (tokenDoc.expiresAt < new Date()) {
      return { valid: false, reason: 'Token expired' };
    }

    // Mark token as used
    tokenDoc.used = true;
    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    return { valid: true, userId: tokenDoc.userId };
  }

  /**
   * Clean up old used tokens (maintenance)
   */
  async cleanupOldTokens(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.authTokenModel.deleteMany({
      used: true,
      usedAt: { $lt: sevenDaysAgo },
    });

    return result.deletedCount || 0;
  }
}
