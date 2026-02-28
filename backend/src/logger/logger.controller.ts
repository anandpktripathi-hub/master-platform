import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../config/roles.constants';
import { AppLoggerService } from './logger.service';
import { LoggerTestLogDto } from './dto/logger-test.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Logger')
@ApiBearerAuth('bearer')
@Controller('admin/logger')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLATFORM_SUPER_ADMIN)
export class LoggerController {
  constructor(private readonly logger: AppLoggerService) {}

  @Get('status')
  getLoggerStatus() {
    return {
      level: this.logger.getLevel(),
      transports: this.logger.getTransports(),
    };
  }

  @Post('test-log')
  async writeTestLog(@Body() body: LoggerTestLogDto) {
    if (!body?.message) {
      throw new BadRequestException('message is required');
    }
    this.logger.writeTestLog({
      level: body.level,
      message: body.message,
      context: body.context,
    });
    return { success: true };
  }
}
