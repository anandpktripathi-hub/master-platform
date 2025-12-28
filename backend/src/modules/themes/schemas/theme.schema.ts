import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThemeDocument = Theme & Document;

@Schema({ timestamps: true })
export class Theme {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  key!: string;

  @Prop({ type: String, default: null })
  previewImage!: string;

  @Prop({
    type: Map,
    of: String,
    default: {},
    description:
      'Default CSS variables for theme (e.g., color-primary, border-radius)',
  })
  cssVariables!: Record<string, string>;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status!: 'ACTIVE' | 'INACTIVE';

  @Prop({ type: Date, default: () => new Date() })
  createdAt!: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt!: Date;
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);

// Create indexes for better query performance
ThemeSchema.index({ status: 1 });
ThemeSchema.index({ createdAt: -1 });
