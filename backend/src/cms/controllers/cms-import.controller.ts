import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
// No import needed for MulterFile, use Express.Multer.File
import { FileInterceptor } from '@nestjs/platform-express';
import { FileImportService } from '../services/file-import.service';
import { FigmaImportService } from '../services/figma-import.service';
import { ImportZipDto } from '../dto/import.dto';
import { FigmaImportDto } from '../dto/figma-import.dto';
import { Tenant } from '../../decorators/tenant.decorator';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Cms Import')
@Controller('cms/import')
export class CmsImportController {
  constructor(
    private readonly fileImportService: FileImportService,
    private readonly figmaImportService: FigmaImportService,
  ) {}

  @Post('zip')
  @UseInterceptors(FileInterceptor('file'))
  async importZip(
    @Tenant() tenantIdFromContext: string,
    @UploadedFile() file: any,
    @Body() body: ImportZipDto,
  ) {
    let tenantId: string | undefined = tenantIdFromContext || body?.tenantId;
    if (Array.isArray(tenantId)) tenantId = tenantId[0];
    if (!tenantId) {
      throw new BadRequestException(
        'Tenant context missing. Provide x-workspace-id header or tenantId in body.',
      );
    }
    return this.fileImportService.processZip(file, tenantId);
  }

  @Post('figma')
  async importFigma(
    @Tenant() tenantIdFromContext: string,
    @Body() body: FigmaImportDto,
  ) {
    const figmaUrl = body?.figmaUrl ?? (body as any)?.url;
    const accessToken = body?.accessToken ?? (body as any)?.token;
    const tenantId = tenantIdFromContext || body?.tenantId;

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant context missing. Provide x-workspace-id header or tenantId in body.',
      );
    }
    if (!figmaUrl || !accessToken) {
      throw new BadRequestException('figmaUrl/accessToken are required');
    }

    const figmaData = await this.figmaImportService.fetchFigmaFile(
      figmaUrl,
      accessToken,
    );
    const sections = this.figmaImportService.parseLayers(figmaData);
    return {
      designJson: {
        sections,
        framework: 'figma',
        cleaned: true,
        tenantId,
      },
      layers: sections,
    };
  }
}
