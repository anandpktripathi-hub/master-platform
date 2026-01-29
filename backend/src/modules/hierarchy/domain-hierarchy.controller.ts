import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { DomainHierarchyService } from './domain-hierarchy.service';

@Controller('domain-hierarchy')
export class DomainHierarchyController {
  constructor(private readonly service: DomainHierarchyService) {}

  @Post(':domainId')
  async assignNodes(
    @Param('domainId') domainId: string,
    @Body('nodeIds') nodeIds: string[],
  ) {
    return this.service.assignNodesToDomain(domainId, nodeIds);
  }

  @Get(':domainId')
  async getNodes(@Param('domainId') domainId: string) {
    return this.service.getNodesForDomain(domainId);
  }

  @Delete(':domainId')
  async removeAssignment(@Param('domainId') domainId: string) {
    await this.service.removeAssignment(domainId);
    return { success: true };
  }
}
