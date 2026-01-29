import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicUserProfileDocument = PublicUserProfile & Document;

@Schema({ timestamps: true })
export class PublicUserProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  handle!: string;

  @Prop()
  headline?: string;

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop()
  currentTitle?: string;

  @Prop()
  currentCompanyName?: string;

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        location: String,
        description: String,
      },
    ],
    default: [],
  })
  experience?: Array<{
    title: string;
    company: string;
    startDate?: Date;
    endDate?: Date;
    isCurrent?: boolean;
    location?: string;
    description?: string;
  }>;

  @Prop({
    type: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    default: [],
  })
  links?: Array<{
    label: string;
    url: string;
  }>;

  @Prop({
    type: String,
    enum: ['PUBLIC', 'NETWORK', 'PRIVATE'],
    default: 'PUBLIC',
  })
  visibility!: 'PUBLIC' | 'NETWORK' | 'PRIVATE';

  @Prop({ default: false })
  isComplete!: boolean;
}

export const PublicUserProfileSchema = SchemaFactory.createForClass(PublicUserProfile);
