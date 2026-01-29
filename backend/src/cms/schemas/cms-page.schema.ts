import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsPageEntity {
  @Prop()
  title: string = '';
  // ... add all required fields
}
export const CmsPageSchema = SchemaFactory.createForClass(CmsPageEntity);
