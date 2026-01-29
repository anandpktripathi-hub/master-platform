import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsMenuItemEntity {
  @Prop({ required: true }) label: string = '';
  // ... add all required fields
}
export const CmsMenuItemSchema =
  SchemaFactory.createForClass(CmsMenuItemEntity);
