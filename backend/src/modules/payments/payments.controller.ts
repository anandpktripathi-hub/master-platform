import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PaymentLogService } from './services/payment-log.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tenant } from '../../decorators/tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PackageService } from '../packages/services/package.service';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  CapturePaypalOrderQueryDto,
  GetPaymentLogsQueryDto,
} from './dto/payments.dto';
import { CaptureAndSubscribeBodyDto } from './dto/capture-and-subscribe-body.dto';
@ApiTags('Payments')
@ApiBearerAuth('bearer')
@Controller('payments')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

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
  @ApiOperation({ summary: 'List payment attempts/logs (platform admin)' })
  @ApiResponse({ status: 200, description: 'Logs returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPaymentLogs(@Query() query: GetPaymentLogsQueryDto) {
    try {
      const parseDate = (value?: string) => {
        if (!value) return undefined;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
          throw new BadRequestException('Invalid date filter');
        }
        return d;
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

  /**
   * Capture a PayPal order server-side after the user returns from PayPal.
   * The frontend return screen calls this endpoint with an `orderId` query param.
   */
  @Post('paypal/capture')
  @ApiOperation({ summary: 'Capture a PayPal order (server-side)' })
  @ApiResponse({ status: 200, description: 'Capture result returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async capturePaypalOrder(@Query() query: CapturePaypalOrderQueryDto) {
    try {
      return await this.paymentGatewayService.capturePaypalOrder(query.orderId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[capturePaypalOrder] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to capture PayPal order');
    }
  }

  /**
   * Tenant flow: capture a PayPal order (created client-side) and activate/renew
   * the tenant's subscription (TenantPackage) for the provided package.
   */
  @Post('paypal/capture-and-subscribe')
  @Roles('admin')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Capture PayPal order and activate subscription (tenant)' })
  @ApiResponse({ status: 200, description: 'Subscription activated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async capturePaypalOrderAndSubscribe(
    @Query() query: CapturePaypalOrderQueryDto,
    @Body() body: CaptureAndSubscribeBodyDto,
    @Tenant() tenantId: string,
    @Request() req: RequestWithUser,
  ) {
    try {
      const packageId = body?.packageId;
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
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[capturePaypalOrderAndSubscribe] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to capture PayPal order and subscribe',
          );
    }
  }

  /**
   * Backward-compatible alias.
   * Note: This is a capture/callback endpoint, not a PayPal webhook handler.
   */
  @Post('webhook/paypal/capture')
  @ApiOperation({ summary: 'Legacy capture alias (backward compatible)' })
  @ApiResponse({ status: 200, description: 'Capture result returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async capturePaypalOrderLegacy(@Query() query: CapturePaypalOrderQueryDto) {
    try {
      return await this.paymentGatewayService.capturePaypalOrder(query.orderId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[capturePaypalOrderLegacy] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to capture PayPal order');
    }
  }
}
