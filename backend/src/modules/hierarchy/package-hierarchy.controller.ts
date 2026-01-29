import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { PackageHierarchyService } from './package-hierarchy.service';

@Controller('package-hierarchy')
export class PackageHierarchyController {
  constructor(private readonly service: PackageHierarchyService) {}

  @Post(':packageId')
  async assignNodes(
    @Param('packageId') packageId: string,
    @Body('nodeIds') nodeIds: string[],
  ) {
    return this.service.assignNodesToPackage(packageId, nodeIds);
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
