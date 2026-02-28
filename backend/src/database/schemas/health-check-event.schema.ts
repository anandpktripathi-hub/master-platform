import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';

export type HealthCheckEventDocument = HealthCheckEvent & Document;

@Schema({ timestamps: true })
export class HealthCheckEvent {
  @Prop({ required: true, enum: ['healthy', 'degraded', 'unhealthy'] })
  status!: 'healthy' | 'degraded' | 'unhealthy';

  @Prop({ type: Object, required: true })
  checks!: Record<string, unknown>;
}

export const HealthCheckEventSchema = SchemaFactory.createForClass(HealthCheckEvent);
