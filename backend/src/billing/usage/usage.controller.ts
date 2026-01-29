import { Controller, Get, Param } from '@nestjs/common';
import { UsageMeterService } from './usage-meter.service';

@Controller('billing/usage')
export class UsageController {
  constructor(private readonly usageMeterService: UsageMeterService) {}

  @Get(':tenantId')
  async getUsage(@Param('tenantId') tenantId: string) {
    return this.usageMeterService.getUsage(tenantId);
  }
}
