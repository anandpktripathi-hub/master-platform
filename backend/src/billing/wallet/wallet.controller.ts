import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { WalletService } from './wallet.service';
import { AddWalletCreditsDto, TenantIdParamDto } from './dto/wallet.dto';

@ApiTags('Billing - Wallet')
@ApiBearerAuth()
@Controller('billing/wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @Get(':tenantId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiParam({ name: 'tenantId', type: String, description: 'Tenant ObjectId' })
  @ApiOperation({ summary: 'Get wallet balance for a tenant' })
  @ApiResponse({ status: 200, description: 'Wallet balance returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBalance(@Param() params: TenantIdParamDto) {
    try {
      return await this.walletService.getBalance(params.tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getBalance] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get wallet balance');
    }
  }

  @Get(':tenantId/transactions')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiParam({ name: 'tenantId', type: String, description: 'Tenant ObjectId' })
  @ApiOperation({ summary: 'List wallet transactions for a tenant' })
  @ApiResponse({ status: 200, description: 'Wallet transactions returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTransactions(@Param() params: TenantIdParamDto) {
    try {
      return await this.walletService.getTransactionHistory(params.tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listTransactions] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to list wallet transactions',
          );
    }
  }

  @Post('add')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Add credits to a tenant wallet' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Credits added' })
  @ApiResponse({ status: 400, description: 'Invalid payload / tenant context' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addCredits(
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() body: AddWalletCreditsDto,
  ) {
    try {
      const tenantId = tenantIdFromContext || body.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }

      if (
        tenantIdFromContext &&
        body.tenantId &&
        tenantIdFromContext !== body.tenantId
      ) {
        throw new BadRequestException('Tenant mismatch');
      }

      return await this.walletService.addCredits(
        tenantId,
        body.amount,
        body.description,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[addCredits] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to add wallet credits');
    }
  }
}
