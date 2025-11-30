import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DashboardDocument = Dashboard & Document;

@Schema()
export class Dashboard {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  widgets: Record<string, any>[];

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);
















