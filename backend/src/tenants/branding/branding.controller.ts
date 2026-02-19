import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Req,
  UseGuards,
  Get,
  Put,
  Logger,
} from '@nestjs/common';
import { BrandingService } from './branding.service';
import { UploadThemeDto } from './dto/upload-theme.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { StorageService } from '../../common/storage/storage.service';

@Controller('branding')
export class BrandingController {
  private readonly logger = new Logger(BrandingController.name);

  constructor(
    private readonly brandingService: BrandingService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async getBranding(@Req() req: Request) {
    const tenantId = (req as any)['tenant']?.id;
    return this.brandingService.getBrandingByTenant(tenantId);
  }

  @Put()
  @UseInterceptors(FilesInterceptor('assets'))
  async updateBranding(
    @Req() req: Request,
    @Body() dto: UploadThemeDto,
    @UploadedFiles() files: Array<any>,
  ) {
    const tenantId = (req as any)['tenant']?.id;

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
        } catch (err) {
          this.logger.error(`Failed to upload ${file.originalname}: ${err}`);
        }
      }
    }

    // Merge uploaded URLs into DTO
    const finalDto = { ...dto, ...assetUrls };
    return this.brandingService.updateBranding(tenantId, finalDto);
  }
}
