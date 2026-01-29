import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('billing/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':tenantId')
  async getBalance(@Param('tenantId') tenantId: string) {
    return this.walletService.getBalance(tenantId);
  }

  @Post('add')
  async addCredits(@Body() body: { tenantId: string; amount: number }) {
    return this.walletService.addCredits(body.tenantId, body.amount);
  }
}
