import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OfflinePaymentsService } from '../services/offline-payments.service';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { Tenant } from '../../../decorators/tenant.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateOfflinePaymentRequestDto,
  ListOfflinePaymentsQueryDto,
  UpdateOfflinePaymentStatusDto,
} from '../dto/payments.dto';
import { OfflinePaymentIdParamDto } from '../dto/offline-payment-id-param.dto';
@ApiTags('Offline Payments')
@ApiBearerAuth('bearer')
@Controller('offline-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfflinePaymentsController {
  private readonly logger = new Logger(OfflinePaymentsController.name);

  constructor(private readonly offlinePayments: OfflinePaymentsService) {}

  @Post()
  @UseGuards(RateLimitGuard, RolesGuard)
  @ApiOperation({ summary: 'Create offline payment request (tenant)' })
  @ApiResponse({ status: 201, description: 'Request created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createForTenant(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Body() body: CreateOfflinePaymentRequestDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');

      const userId =
        req?.user?.id || req?.user?._id || req?.user?.userId || tenantId;

      return await this.offlinePayments.createRequest({
        tenantId,
        userId,
        amount: body.amount,
        currency: body.currency,
        method: body.method,
        description: body.description,
        proofUrl: body.proofUrl,
        metadata: body.metadata,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createForTenant] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to create offline payment request',
          );
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'List my offline payment requests (tenant)' })
  @ApiResponse({ status: 200, description: 'Requests returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listMine(@Tenant() tenantId: string) {
    try {
      return await this.offlinePayments.listForTenant(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listMine] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to list offline payment requests',
          );
    }
  }

  @Get()
  @Roles('PLATFORM_SUPER_ADMIN')
  @ApiOperation({ summary: 'List offline payment requests (platform admin)' })
  @ApiResponse({ status: 200, description: 'Requests returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listAll(@Query() query: ListOfflinePaymentsQueryDto) {
    try {
      if (query.tenantId) {
        return await this.offlinePayments.listForTenant(query.tenantId);
      }
      return await this.offlinePayments.listAll();
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listAll] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to list offline payment requests',
          );
    }
  }

  @Patch(':id/status')
  @Roles('PLATFORM_SUPER_ADMIN')
  @ApiOperation({ summary: 'Update offline payment status (platform admin)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateStatus(
    @Param() params: OfflinePaymentIdParamDto,
    @Body() body: UpdateOfflinePaymentStatusDto,
  ) {
    try {
      return await this.offlinePayments.updateStatus(params.id, body.status);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateStatus] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update offline payment status',
          );
    }
  }
}
