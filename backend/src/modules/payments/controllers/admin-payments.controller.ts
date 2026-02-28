import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../decorators/roles.decorator';
import { RoleGuard } from '../../../guards/role.guard';
import { PaymentLogService } from '../services/payment-log.service';
import { ApiTags } from '@nestjs/swagger';
import {
  GetPaymentLogsQueryDto,
  ListPaymentFailuresQueryDto,
} from '../dto/payments.dto';
@ApiTags('Admin Payments')
@Controller('admin/payments')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class AdminPaymentsController {
  constructor(private readonly paymentLogService: PaymentLogService) {}

  @Get('logs')
  @Roles('PLATFORM_SUPERADMIN')
  getPaymentLogs(@Query() query: GetPaymentLogsQueryDto) {
    const parseDate = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date filter');
      }
      return date;
    };

    return this.paymentLogService.list({
      tenantId: query.tenantId,
      from: parseDate(query.from),
      to: parseDate(query.to),
      limit: query.limit,
    });
  }

  @Get('failures')
  @Roles('PLATFORM_SUPERADMIN')
  getRecentFailures(@Query() query: ListPaymentFailuresQueryDto) {
    return this.paymentLogService.listFailures(query.limit ?? 10);
  }
}
