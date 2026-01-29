import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsDesignStateEntity {
  @Prop({ required: true }) state: string = '';
  // ... add all required fields
}
export const CmsDesignStateSchema =
  SchemaFactory.createForClass(CmsDesignStateEntity);
