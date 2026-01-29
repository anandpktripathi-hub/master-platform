import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
// No import needed for MulterFile, use Express.Multer.File
import { ApiTags } from '@nestjs/swagger';
import { CmsFileImportService } from '../services/cms-file-import.service';
import { ImportType } from '../enums/cms.enums';

@ApiTags('CMS - File Import')
@Controller('api/cms/import')
export class CmsFileImportController {
  constructor(private readonly importService: CmsFileImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body('importType') importType: string,
  ) {
    let tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    if (Array.isArray(tenantId)) tenantId = tenantId[0];
    // Convert importType string to ImportType enum
    let importTypeEnum: ImportType;
    if (importType === ImportType.ZIP) {
      importTypeEnum = ImportType.ZIP;
    } else if (importType === ImportType.CSV) {
      importTypeEnum = ImportType.CSV;
    } else {
      throw new Error('Invalid importType');
    }
    const importRecord = await this.importService.createImport(
      tenantId,
      req.user && typeof req.user === 'object' && 'id' in req.user
        ? req.user.id
        : 'system',
      file.originalname,
      `/uploads/${file.filename}`,
      file.size,
      importTypeEnum,
    );
    if (importTypeEnum === ImportType.ZIP) {
      this.importService.processZipImport(
        tenantId,
        importRecord._id?.toString(),
        file.buffer,
      );
    }
    return importRecord;
  }

  @Get('status/:importId')
  async getStatus(@Req() req: any, @Param('importId') importId: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.importService.getImportStatus(tenantId, importId);
  }

  @Get('history')
  async getHistory(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.importService.getImportHistory(tenantId);
  }
}
