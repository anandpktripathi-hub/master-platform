import { Schema as MongooseSchema, Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string = '';

  @Prop()
  domain?: string;
  @Prop({ type: [Object], default: [] })
  domains: any[] = [];
}

import { SchemaFactory } from '@nestjs/mongoose';
export const TenantSchema = SchemaFactory.createForClass(Tenant);
