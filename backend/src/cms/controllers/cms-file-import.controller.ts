import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
// No import needed for MulterFile, use Express.Multer.File
import { ApiTags } from '@nestjs/swagger';
import { CmsFileImportService } from '../services/cms-file-import.service';
import { ImportType } from '../enums/cms.enums';
import { Tenant } from '../../decorators/tenant.decorator';

@ApiTags('CMS - File Import')
@Controller('cms/import')
export class CmsFileImportController {
  constructor(private readonly importService: CmsFileImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: any,
    @Tenant() tenantId: string,
    @UploadedFile() file: any,
    @Body('importType') importType: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    // Convert importType string to ImportType enum
    let importTypeEnum: ImportType;
    if (importType === ImportType.ZIP) {
      importTypeEnum = ImportType.ZIP;
    } else if (importType === ImportType.CSV) {
      importTypeEnum = ImportType.CSV;
    } else {
      throw new BadRequestException('Invalid importType');
    }
    const importRecord = await this.importService.createImport(
      tenantId,
      req.user && typeof req.user === 'object' && 'userId' in req.user
        ? String((req.user as any).userId)
        : 'system',
      file.originalname,
      file.filename ? `/uploads/${file.filename}` : 'memory',
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
  async getStatus(
    @Tenant() tenantId: string,
    @Param('importId') importId: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.importService.getImportStatus(tenantId, importId);
  }

  @Get('history')
  async getHistory(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.importService.getImportHistory(tenantId);
  }
}
