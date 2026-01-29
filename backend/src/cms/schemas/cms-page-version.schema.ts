import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsPageVersionEntity {
  @Prop({ required: true }) version: string = '';
  // ... add all required fields
}
export const CmsPageVersionSchema =
  SchemaFactory.createForClass(CmsPageVersionEntity);
