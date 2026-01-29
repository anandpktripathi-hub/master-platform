import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsFileImportEntity {
  @Prop({ required: true }) fileName: string = '';
  // ... add all required fields
}
export const CmsFileImportSchema =
  SchemaFactory.createForClass(CmsFileImportEntity);
