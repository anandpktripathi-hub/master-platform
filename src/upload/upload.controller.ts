import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Delete, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }

  @Delete()
  async deleteFile(@Body('url') url: string) {
    await this.uploadService.deleteFile(url);
    return { message: 'File deleted successfully' };
  }
}
