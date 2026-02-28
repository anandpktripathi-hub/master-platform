import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentLogService } from './services/payment-log.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Tenant } from '../../decorators/tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PackageService } from '../packages/services/package.service';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  CapturePaypalOrderQueryDto,
  GetPaymentLogsQueryDto,
} from './dto/payments.dto';
@ApiTags('Payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class PaymentsController {
  constructor(
    private readonly paymentLogService: PaymentLogService,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly packageService: PackageService,
  ) {}

  /**
   * List payment attempts for observability and admin troubleshooting.
   * Restricted to platform super admins.
   */
  @Get('logs')
  @Roles('PLATFORM_SUPERADMIN')
  getPaymentLogs(@Query() query: GetPaymentLogsQueryDto) {
    const parseDate = (value?: string) => {
      if (!value) return undefined;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException('Invalid date filter');
      }
      return d;
    };

    return this.paymentLogService.list({
      tenantId: query.tenantId,
      from: parseDate(query.from),
      to: parseDate(query.to),
      limit: query.limit,
    });
  }

  /**
   * Capture a PayPal order server-side after the user returns from PayPal.
   * The frontend return screen calls this endpoint with an `orderId` query param.
   */
  @Post('paypal/capture')
  async capturePaypalOrder(@Query() query: CapturePaypalOrderQueryDto) {
    return this.paymentGatewayService.capturePaypalOrder(query.orderId);
  }

  /**
   * Tenant flow: capture a PayPal order (created client-side) and activate/renew
   * the tenant's subscription (TenantPackage) for the provided package.
   */
  @Post('paypal/capture-and-subscribe')
  @Roles('admin')
  @UseGuards(TenantGuard)
  async capturePaypalOrderAndSubscribe(
    @Query() query: CapturePaypalOrderQueryDto,
    @Body() body: { packageId: string },
    @Tenant() tenantId: string,
    @Request() req: RequestWithUser,
  ) {
    const packageId = body?.packageId?.trim();
    if (!packageId) {
      throw new BadRequestException('packageId is required');
    }

    const pkg = await this.packageService.getPackage(packageId);
    const result = await this.paymentGatewayService.capturePaypalOrder(
      query.orderId,
    );

    // Always log the capture attempt for observability.
    await this.paymentLogService.record({
      transactionId: result.transactionId || query.orderId,
      tenantId,
      packageId,
      amount: pkg.price,
      currency: 'USD',
      status: result.success ? 'success' : 'failed',
      gatewayName: 'paypal',
      error: result.success ? undefined : result.error,
      createdAt: new Date(),
    });

    if (!result.success) {
      throw new BadRequestException(result.error || 'PayPal capture failed');
    }

    const userId = req.user?.sub;

    // Payment is already captured, so skip online gateway processing.
    const subscription = await this.packageService.assignPackageToTenant(
      tenantId,
      packageId,
      {
        skipPayment: true,
        startTrial: false,
        userId,
        gatewayName: 'paypal',
      },
    );

    return {
      success: true,
      transactionId: result.transactionId,
      subscription,
    };
  }

  /**
   * Backward-compatible alias.
   * Note: This is a capture/callback endpoint, not a PayPal webhook handler.
   */
  @Post('webhook/paypal/capture')
  async capturePaypalOrderLegacy(@Query() query: CapturePaypalOrderQueryDto) {
    return this.paymentGatewayService.capturePaypalOrder(query.orderId);
  }
}
