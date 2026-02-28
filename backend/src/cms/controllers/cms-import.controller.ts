import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
// No import needed for MulterFile, use Express.Multer.File
import { FileInterceptor } from '@nestjs/platform-express';
import { FileImportService } from '../services/file-import.service';
import { FigmaImportService } from '../services/figma-import.service';
import { ImportZipDto } from '../dto/import.dto';
import { FigmaImportDto } from '../dto/figma-import.dto';
import { Tenant } from '../../decorators/tenant.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Cms Import')
@ApiBearerAuth('bearer')
@Controller('cms/import')
@UseGuards(JwtAuthGuard)
export class CmsImportController {
  private readonly logger = new Logger(CmsImportController.name);

  constructor(
    private readonly fileImportService: FileImportService,
    private readonly figmaImportService: FigmaImportService,
  ) {}

  @Post('zip')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import a CMS ZIP into the current tenant' })
  @ApiResponse({ status: 200, description: 'Import started' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async importZip(
    @Tenant() tenantIdFromContext: string,
    @UploadedFile() file: any,
    @Body() body: ImportZipDto,
  ) {
    try {
      let tenantId: string | undefined = tenantIdFromContext || body?.tenantId;
      if (Array.isArray(tenantId)) tenantId = tenantId[0];
      if (!tenantId) {
        throw new BadRequestException(
          'Tenant context missing. Provide x-workspace-id header or tenantId in body.',
        );
      }
      return await this.fileImportService.processZip(file, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[importZip] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('figma')
  @ApiOperation({ summary: 'Import a Figma design into the current tenant' })
  @ApiResponse({ status: 200, description: 'Import result returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async importFigma(
    @Tenant() tenantIdFromContext: string,
    @Body() body: FigmaImportDto,
  ) {
    try {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[importFigma] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
