import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CmsSeoAuditEntity {
  @Prop({ required: true }) auditId: string = '';
  // ... add all required fields
}
export const CmsSeoAuditSchema =
  SchemaFactory.createForClass(CmsSeoAuditEntity);
