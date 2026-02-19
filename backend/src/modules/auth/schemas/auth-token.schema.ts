import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthTokenDocument = AuthToken & Document;

export enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

@Schema({ timestamps: true })
export class AuthToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: Object.values(TokenType) })
  type!: TokenType;

  @Prop({ required: true, unique: true })
  token!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: false })
  used!: boolean;

  @Prop()
  usedAt?: Date;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);

// TTL index to auto-delete expired tokens after 7 days
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 });
