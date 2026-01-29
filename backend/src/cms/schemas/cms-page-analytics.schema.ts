import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsPageAnalyticsEntity {
  @Prop({ required: true }) pageId: string = '';
  // ... add all required fields
}
export const CmsPageAnalyticsSchema = SchemaFactory.createForClass(
  CmsPageAnalyticsEntity,
);
