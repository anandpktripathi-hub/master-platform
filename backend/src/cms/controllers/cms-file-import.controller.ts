import {
  Controller,
  Post,
  Get,
  Req,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CmsFileImportService } from '../services/cms-file-import.service';
import { ImportType } from '../enums/cms.enums';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  CmsFileImportImportIdParamDto,
  CmsFileImportUploadBodyDto,
} from '../dto/cms-file-import.dto';

type UploadedImportFile = {
  originalname: string;
  filename?: string;
  size: number;
  buffer?: Buffer;
};

@ApiTags('CMS - File Import')
@ApiBearerAuth('bearer')
@Controller('cms/import')
export class CmsFileImportController {
  private readonly logger = new Logger(CmsFileImportController.name);

  constructor(private readonly importService: CmsFileImportService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file for CMS import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        importType: { type: 'string', enum: Object.values(ImportType) },
      },
      required: ['file', 'importType'],
    },
  })
  @ApiResponse({ status: 200, description: 'Import record created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadFile(
    @Req() req: Request & { user?: unknown },
    @Tenant() tenantId: string,
    @UploadedFile() file: UploadedImportFile,
    @Body() body: CmsFileImportUploadBodyDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      if (!file) throw new BadRequestException('File is required');

      const userId =
        req.user && typeof req.user === 'object' && 'userId' in (req.user as any)
          ? String((req.user as any).userId)
          : 'system';

      const importRecord = await this.importService.createImport(
        tenantId,
        userId,
        file.originalname,
        file.filename ? `/uploads/${file.filename}` : 'memory',
        file.size,
        body.importType,
      );

      if (body.importType === ImportType.ZIP) {
        if (!file.buffer) {
          throw new BadRequestException('ZIP uploads must include file buffer');
        }
        this.importService.processZipImport(
          tenantId,
          importRecord._id?.toString(),
          file.buffer,
        );
      }

      return importRecord;
    } catch (error) {
      this.logger.error(
        `[uploadFile] Failed to upload import file (tenantId=${tenantId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('status/:importId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get status of a CMS import' })
  @ApiParam({ name: 'importId', type: String })
  @ApiResponse({ status: 200, description: 'Import status returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStatus(
    @Tenant() tenantId: string,
    @Param() params: CmsFileImportImportIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.importService.getImportStatus(tenantId, params.importId);
    } catch (error) {
      this.logger.error(
        `[getStatus] Failed to get import status (tenantId=${tenantId}, importId=${params?.importId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get CMS import history for the tenant' })
  @ApiResponse({ status: 200, description: 'Import history returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getHistory(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.importService.getImportHistory(tenantId);
    } catch (error) {
      this.logger.error(
        `[getHistory] Failed to get import history (tenantId=${tenantId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
