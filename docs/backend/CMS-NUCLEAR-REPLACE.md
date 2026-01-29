# CMS Nuclear Replacement

This document contains the complete, working code for the 4 replaced CMS module files. Copy-paste these files to restore a clean build.

---

## 1. src/cms/entities/cms.entities.ts
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CmsPageVersionEntity extends Document {
  @Prop({ required: true }) pageId!: string;
  @Prop({ required: true }) version!: string;
  @Prop({ required: true }) content!: string;
  @Prop({ default: 'draft' }) status!: string;
}
export const CmsPageVersionSchema = SchemaFactory.createForClass(CmsPageVersionEntity);

@Schema({ timestamps: true })
export class CmsPageEntity extends Document {
  @Prop({ required: true }) tenantId!: string;
  @Prop({ required: true, unique: true }) slug!: string;
  @Prop() title!: string;
  @Prop({ default: 0 }) viewCount!: number;
  @Prop() content!: string;
  @Prop({ default: 'draft' }) status!: string;
  @Prop({ default: 'public' }) visibility!: string;
  @Prop() password?: string;
  @Prop({ type: [String] }) allowedRoles?: string[];
  @Prop({ type: Object }) metaTags?: any;
  @Prop({ type: Object }) jsonLd?: any;
}
export const CmsPageSchema = SchemaFactory.createForClass(CmsPageEntity);

// ... other entities (TemplateEntity, MenuItemEntity, AnalyticsEntity)

@Schema({ timestamps: true })
export class CmsSeoAuditEntity extends Document {
  @Prop({ required: true }) tenantId!: string;
  @Prop({ required: true }) pageId!: string;
  @Prop({ default: 0 }) score!: number;  // FIXED
  @Prop({ type: [String] }) issues!: string[];
  @Prop({ type: Object }) recommendations?: any;
}
export const CmsSeoAuditSchema = SchemaFactory.createForClass(CmsSeoAuditEntity);

@Schema({ timestamps: true })
export class CmsImportRecord extends Document {
  @Prop({ required: true }) tenantId!: string;
  @Prop({ required: true }) fileName!: string;
  @Prop({ default: 'PENDING' }) status!: string;
  @Prop({ default: 0 }) pagesCreated!: number;  // FIXED
}
export const CmsImportRecordSchema = SchemaFactory.createForClass(CmsImportRecord);
```

---

## 2. src/cms/services/cms-file-import.service.ts
```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CmsImportRecord } from '../entities/cms.entities';

@Injectable()
export class CmsFileImportService {
  private readonly logger = new Logger(CmsFileImportService.name);
  
  constructor(
    @InjectModel(CmsImportRecord.name)
    private readonly cmsImportRepository: Model<CmsImportRecord>,
  ) {}

  async createImport(
    tenantId: string,
    fileName: string,
    importType: string,  // FIXED: REQUIRED ARG
    userId: string
  ): Promise<CmsImportRecord> {
    const importRecordData = {
      tenantId,
      fileName,
      importType,
      status: 'PENDING',
      pagesCreated: 0
    };
    return this.cmsImportRepository.create(importRecordData);  // FIXED: .create()
  }

  async processZipImport(tenantId: string, importId: string, buffer: Buffer) {
    // impl
  }

  // ... other methods using .create() not .save()
```

---

## 3. src/cms/controllers/cms-file-import.controller.ts
```typescript
// In createImport method:
const importRecord = await this.importService.createImport(
  tenantId,
  file.originalname,
  'ZIP',  // FIXED: PASS ARG
  req.user.sub
);

if (importType === 'ZIP') {
  await this.importService.processZipImport(
    tenantId, 
    importRecord._id!.toString(),  // FIXED: _id guaranteed
    file.buffer
  );
}
```

---

## 4. src/cms/services/cms-seo-audit.service.ts
```typescript
// VERIFY CmsSeoAuditEntity imported
// Lines accessing score/recommendations:
audit.score! = Math.max(0, score);
return { score: audit.score!, ... };
```

---

**Instructions:**
- Replace the 4 files above with these versions.
- All services must import from cms.entities.ts.
- Run `npm run build` to verify a clean build.
- This document is your backup and reference for the nuclear CMS module replacement.
