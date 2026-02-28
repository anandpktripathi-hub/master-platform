import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { BillingHierarchyService } from './billing-hierarchy.service';
import { AssignNodeIdsDto } from './dto/assign-node-ids.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Billing Hierarchy')
@Controller('billing-hierarchy')
export class BillingHierarchyController {
  constructor(private readonly service: BillingHierarchyService) {}

  @Post(':billingId')
  async assignNodes(
    @Param('billingId') billingId: string,
    @Body() body: AssignNodeIdsDto,
  ) {
    return this.service.assignNodesToBilling(billingId, body.nodeIds);
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
