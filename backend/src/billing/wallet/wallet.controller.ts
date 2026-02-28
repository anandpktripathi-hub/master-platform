import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
  constructor(private readonly walletService: WalletService) {}

  @Get(':tenantId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiParam({ name: 'tenantId', type: String, description: 'Tenant ObjectId' })
  @ApiOperation({ summary: 'Get wallet balance for a tenant' })
  @ApiResponse({ status: 200, description: 'Wallet balance returned' })
  async getBalance(@Param() params: TenantIdParamDto) {
    return this.walletService.getBalance(params.tenantId);
  }

  @Get(':tenantId/transactions')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiParam({ name: 'tenantId', type: String, description: 'Tenant ObjectId' })
  @ApiOperation({ summary: 'List wallet transactions for a tenant' })
  @ApiResponse({ status: 200, description: 'Wallet transactions returned' })
  async listTransactions(@Param() params: TenantIdParamDto) {
    return this.walletService.getTransactionHistory(params.tenantId);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Add credits to a tenant wallet' })
  @ApiResponse({ status: 201, description: 'Credits added' })
  @ApiResponse({ status: 400, description: 'Invalid payload / tenant context' })
  async addCredits(
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() body: AddWalletCreditsDto,
  ) {
    const tenantId = tenantIdFromContext || body.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    if (tenantIdFromContext && body.tenantId && tenantIdFromContext !== body.tenantId) {
      throw new BadRequestException('Tenant mismatch');
    }

    return this.walletService.addCredits(tenantId, body.amount, body.description);
  }
}
