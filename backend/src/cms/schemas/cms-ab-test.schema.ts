import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsAbTestEntity {
  @Prop({ required: true }) testName: string = '';
  // ... add all required fields
}
export const CmsAbTestSchema = SchemaFactory.createForClass(CmsAbTestEntity);
