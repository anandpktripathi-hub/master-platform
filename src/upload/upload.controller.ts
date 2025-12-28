import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';

@Controller('upload')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }

  @Delete()
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  async deleteFile(@Body('url') url: string) {
    await this.uploadService.deleteFile(url);
    return { message: 'File deleted successfully' };
  }
}
