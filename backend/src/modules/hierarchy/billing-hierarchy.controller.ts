import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { BillingHierarchyService } from './billing-hierarchy.service';

@Controller('billing-hierarchy')
export class BillingHierarchyController {
  constructor(private readonly service: BillingHierarchyService) {}

  @Post(':billingId')
  async assignNodes(
    @Param('billingId') billingId: string,
    @Body('nodeIds') nodeIds: string[],
  ) {
    return this.service.assignNodesToBilling(billingId, nodeIds);
  }

  @Get(':billingId')
  async getNodes(@Param('billingId') billingId: string) {
    return this.service.getNodesForBilling(billingId);
  }

  @Delete(':billingId')
  async removeAssignment(@Param('billingId') billingId: string) {
    await this.service.removeAssignment(billingId);
    return { success: true };
  }
}
