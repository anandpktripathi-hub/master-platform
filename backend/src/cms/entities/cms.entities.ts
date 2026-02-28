import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CmsPageVersionDocument = CmsPageVersionEntity & Document;

@Schema({ timestamps: true })
export class CmsPageVersionEntity {
  @Prop({ required: true })
  pageId!: string;

  @Prop({ required: true })
  version!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: 'draft' })
  status!: string;
}
export const CmsPageVersionSchema =
  SchemaFactory.createForClass(CmsPageVersionEntity);

@Schema({ timestamps: true })
export class CmsPageEntity {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop()
  title!: string;

  @Prop({ default: 0 })
  viewCount!: number;

  @Prop()
  content!: string;

  @Prop({ default: 'draft' })
  status!: string;

  @Prop({ default: 'public' })
  visibility!: string;

  @Prop()
  password?: string;

  @Prop({ type: [String] })
  allowedRoles?: string[];

  @Prop({ type: Object })
  metaTags?: any;

  @Prop({ type: Object })
  jsonLd?: any;
}
export const CmsPageSchema = SchemaFactory.createForClass(CmsPageEntity);

@Schema({ timestamps: true })
export class CmsPageTemplateEntity {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  template!: string;
}
export const CmsPageTemplateSchema = SchemaFactory.createForClass(
  CmsPageTemplateEntity,
);

@Schema({ timestamps: true })
export class CmsMenuItemEntity {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  menuName!: string;

  @Prop({ required: true })
  label!: string;

  @Prop()
  url?: string;

  @Prop()
  pageId?: string;

  @Prop()
  parentItemId?: string;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ default: true })
  isVisible!: boolean;

  @Prop({ type: [Object] })
  children: CmsMenuItemEntity[] = [];

  @Prop({ type: Types.ObjectId })
  _id!: Types.ObjectId;
}
export const CmsMenuItemSchema =
  SchemaFactory.createForClass(CmsMenuItemEntity);

@Schema()
export class CmsPageAnalyticsEntity {
  @Prop()
  tenantId!: string;
  @Prop()
  pageId!: string;
  @Prop({ default: 0 })
  views!: number;
  @Prop({ default: 0 })
  uniqueVisitors!: number;
  @Prop({ default: 0 })
  avgTimeOnPage!: number;
  @Prop({ default: 0 })
  bounceRate!: number;
  @Prop({ default: 0 })
  conversionRate!: number;
}
export const CmsPageAnalyticsSchema = SchemaFactory.createForClass(
  CmsPageAnalyticsEntity,
);

export enum SeoAuditStatus {
  PASS = 'PASS',
  WARN = 'WARN',
  FAIL = 'FAIL',
}

@Schema()
export class CmsSeoAuditEntity {
  @Prop({ type: Object })
  recommendations?: any;

  @Prop()
  tenantId!: string;

  @Prop()
  pageId!: string;

  @Prop()
  score!: number;

  @Prop()
  issues!: string[];
}

export const CmsSeoAuditSchema =
  SchemaFactory.createForClass(CmsSeoAuditEntity);

@Schema()
export class CmsImportRecord {
  @Prop({ type: Types.ObjectId })
  _id!: Types.ObjectId;

  @Prop()
  tenantId!: string;

  @Prop()
  fileName!: string;

  @Prop({ enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status!: string; // ImportStatus → string enum

  @Prop({ default: 0 })
  pagesCreated?: number;
}
export const CmsImportRecordSchema =
  SchemaFactory.createForClass(CmsImportRecord);
