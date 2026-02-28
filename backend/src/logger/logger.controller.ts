import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../config/roles.constants';
import { AppLoggerService } from './logger.service';
import { LoggerTestLogDto } from './dto/logger-test.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Logger')
@ApiBearerAuth('bearer')
@Controller('admin/logger')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLATFORM_SUPER_ADMIN)
export class LoggerController {
  private readonly controllerLogger = new Logger(LoggerController.name);

  constructor(private readonly logger: AppLoggerService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get application logger status (platform admin)' })
  @ApiResponse({ status: 200, description: 'Logger status returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getLoggerStatus() {
    try {
      return {
        level: this.logger.getLevel(),
        transports: this.logger.getTransports(),
      };
    } catch (error) {
      const err = error as any;
      this.controllerLogger.error(
        `[getLoggerStatus] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get logger status');
    }
  }

  @Post('test-log')
  @ApiOperation({ summary: 'Write a test log entry (platform admin)' })
  @ApiResponse({ status: 200, description: 'Test log written' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async writeTestLog(@Body() body: LoggerTestLogDto) {
    try {
      if (!body?.message) {
        throw new BadRequestException('message is required');
      }
      await this.logger.writeTestLog({
        level: body.level,
        message: body.message,
        context: body.context,
      });
      return { success: true };
    } catch (error) {
      const err = error as any;
      this.controllerLogger.error(
        `[writeTestLog] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to write test log');
    }
  }
}
