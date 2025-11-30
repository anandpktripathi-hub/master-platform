import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ThemeDocument = Theme & Document;

@Schema()
export class Theme {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: true })
  colors: Record<string, string>;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);
