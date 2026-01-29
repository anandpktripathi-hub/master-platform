import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsPageTemplateEntity {
  @Prop({ required: true }) name: string = '';
  // ... add all required fields
}
export const CmsPageTemplateSchema = SchemaFactory.createForClass(
  CmsPageTemplateEntity,
);
