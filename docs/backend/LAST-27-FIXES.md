# LAST-27-FIXES.md

## 1. src/cms/services/cms-file-import.service.ts
**Signature + Mongoose API:**
```typescript
async createImport(
  tenantId: string,
  fileName: string,
  importType: string,
  userId: string
): Promise<CmsImportRecord> {
  const importRecordData = {
    tenantId,
    fileName,
    importType,
    status: 'PENDING',
    pagesCreated: 0
  };
  return this.cmsImportRepository.create(importRecordData);
}
```

## 2. src/cms/controllers/cms-file-import.controller.ts
**Call Site:**
```typescript
const importRecord = await this.importService.createImport(
  tenantId, fileName, 'ZIP', req.user.sub
);
```
**_id Access:**
```typescript
importRecord._id!.toString()
```

## 3. src/cms/entities/cms.entities.ts
**CmsSeoAuditEntity:**
```typescript
@Schema({ timestamps: true })
export class CmsSeoAuditEntity {
  @Prop({ required: true })
  tenantId!: string;
  @Prop({ required: true })
  pageId!: string;
  @Prop({ default: 0 })
  score!: number;
  @Prop({ type: [String] })
  issues!: string[];
  @Prop({ type: Object })
  recommendations?: any;
}
export const CmsSeoAuditSchema = SchemaFactory.createForClass(CmsSeoAuditEntity);
```
**CmsImportRecord:**
```typescript
@Schema({ timestamps: true })
export class CmsImportRecord {
  // ... existing
  @Prop({ default: 0 })
  pagesCreated!: number;
}
export const CmsImportRecordSchema = SchemaFactory.createForClass(CmsImportRecord);
```

## 4. src/cms/services/cms-seo-audit.service.ts
**Score Assignment:**
```typescript
audit.score = Math.max(0, score);
```
**Result Return:**
```typescript
score: audit.score,
```

## 5. src/cms/enums/cms.enums.ts
**Enums:**
```typescript
export enum ImportStatus { PENDING = 'PENDING', COMPLETED = 'COMPLETED', FAILED = 'FAILED' }
export enum SeoAuditStatus { PASS = 'PASS', WARN = 'WARN', FAIL = 'FAIL' }
```

---

**All changes are copy-paste ready and line-precise.**
