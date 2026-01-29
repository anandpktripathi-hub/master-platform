import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
// No import needed for MulterFile, use Express.Multer.File
import { FileInterceptor } from '@nestjs/platform-express';
import { FileImportService } from '../services/file-import.service';
import { FigmaImportService } from '../services/figma-import.service';
import { ImportZipDto } from '../dto/import.dto';
import { FigmaImportDto } from '../dto/figma-import.dto';

@Controller('cms/import')
export class CmsImportController {
  constructor(
    private readonly fileImportService: FileImportService,
    private readonly figmaImportService: FigmaImportService,
  ) {}

  @Post('zip')
  @UseInterceptors(FileInterceptor('file'))
  async importZip(@UploadedFile() file: any, @Body() body: ImportZipDto) {
    // body.tenantId required for multi-tenant
    let tenantId = body.tenantId;
    if (Array.isArray(tenantId)) tenantId = tenantId[0];
    return this.fileImportService.processZip(file, tenantId);
  }

  @Post('figma')
  async importFigma(@Body() body: FigmaImportDto) {
    const figmaData = await this.figmaImportService.fetchFigmaFile(
      body.figmaUrl,
      body.accessToken,
    );
    const sections = this.figmaImportService.parseLayers(figmaData);
    return {
      designJson: {
        sections,
        framework: 'figma',
        cleaned: true,
        tenantId: body.tenantId,
      },
      layers: sections,
    };
  }
}
