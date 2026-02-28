import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { DomainHierarchyService } from './domain-hierarchy.service';
import { AssignNodeIdsDto } from './dto/assign-node-ids.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Domain Hierarchy')
@Controller('domain-hierarchy')
export class DomainHierarchyController {
  constructor(private readonly service: DomainHierarchyService) {}

  @Post(':domainId')
  async assignNodes(
    @Param('domainId') domainId: string,
    @Body() body: AssignNodeIdsDto,
  ) {
    return this.service.assignNodesToDomain(domainId, body.nodeIds);
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
