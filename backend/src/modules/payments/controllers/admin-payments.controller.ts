import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../decorators/roles.decorator';
import { RoleGuard } from '../../../guards/role.guard';
import { PaymentLogService } from '../services/payment-log.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetPaymentLogsQueryDto,
  ListPaymentFailuresQueryDto,
} from '../dto/payments.dto';
@ApiTags('Admin Payments')
@ApiBearerAuth('bearer')
@Controller('admin/payments')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class AdminPaymentsController {
  private readonly logger = new Logger(AdminPaymentsController.name);

  constructor(private readonly paymentLogService: PaymentLogService) {}

  @Get('logs')
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'List payment logs (platform admin)' })
  @ApiResponse({ status: 200, description: 'Logs returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPaymentLogs(@Query() query: GetPaymentLogsQueryDto) {
    try {
      const parseDate = (value?: string) => {
        if (!value) return undefined;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          throw new BadRequestException('Invalid date filter');
        }
        return date;
      };

      return await this.paymentLogService.list({
        tenantId: query.tenantId,
        from: parseDate(query.from),
        to: parseDate(query.to),
        limit: query.limit,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPaymentLogs] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list payment logs');
    }
  }

  @Get('failures')
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'List recent payment failures (platform admin)' })
  @ApiResponse({ status: 200, description: 'Failures returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getRecentFailures(@Query() query: ListPaymentFailuresQueryDto) {
    try {
      return await this.paymentLogService.listFailures(query.limit ?? 10);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getRecentFailures] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to list recent payment failures',
          );
    }
  }
}
