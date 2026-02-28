import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  UseGuards,
  Get,
  Put,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BrandingService } from './branding.service';
import { UploadThemeDto } from './dto/upload-theme.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../../common/storage/storage.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../decorators/tenant.decorator';
@ApiTags('Branding')
@Controller('branding')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('admin')
export class BrandingController {
  private readonly logger = new Logger(BrandingController.name);

  constructor(
    private readonly brandingService: BrandingService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant branding settings' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBranding(@Tenant() tenantId: string) {
    try {
      return await this.brandingService.getBrandingByTenant(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getBranding] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Put()
  @UseInterceptors(FilesInterceptor('assets'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update tenant branding (theme + optional assets)' })
  @ApiBody({ type: UploadThemeDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 413, description: 'Payload Too Large' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateBranding(
    @Tenant() tenantId: string,
    @Body() dto: UploadThemeDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      const assetUrls: Record<string, string> = {};
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const result = await this.storageService.uploadFile(
              file.buffer,
              file.originalname,
              file.mimetype,
              `branding/${tenantId}`,
            );
            // Use fieldname as key for asset URL mapping
            assetUrls[file.fieldname] = result.url;
            this.logger.log(
              `Uploaded ${file.originalname} for tenant ${tenantId}: ${result.url}`,
            );
          } catch (uploadError) {
            const err = uploadError as any;
            this.logger.error(
              `[updateBranding] Failed to upload ${file.originalname}: ${err?.message ?? String(err)}`,
              err?.stack,
            );
          }
        }
      }

      // Merge uploaded URLs into DTO
      const finalDto = { ...dto, ...assetUrls };
      return await this.brandingService.updateBranding(tenantId, finalDto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateBranding] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
