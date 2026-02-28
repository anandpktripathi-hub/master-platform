import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { PackageHierarchyService } from './package-hierarchy.service';
import { AssignNodeIdsDto } from './dto/assign-node-ids.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Package Hierarchy')
@Controller('package-hierarchy')
export class PackageHierarchyController {
  constructor(private readonly service: PackageHierarchyService) {}

  @Post(':packageId')
  async assignNodes(
    @Param('packageId') packageId: string,
    @Body() body: AssignNodeIdsDto,
  ) {
    return this.service.assignNodesToPackage(packageId, body.nodeIds);
  }

  @Get(':packageId')
  async getNodes(@Param('packageId') packageId: string) {
    return this.service.getNodesForPackage(packageId);
  }

  @Delete(':packageId')
  async removeAssignment(@Param('packageId') packageId: string) {
    await this.service.removeAssignment(packageId);
    return { success: true };
  }
}
