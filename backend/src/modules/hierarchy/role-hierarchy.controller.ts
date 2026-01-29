import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { RoleHierarchyService } from './role-hierarchy.service';

@Controller('role-hierarchy')
export class RoleHierarchyController {
  constructor(private readonly service: RoleHierarchyService) {}

  @Post(':roleName')
  async assignNodes(
    @Param('roleName') roleName: string,
    @Body('nodeIds') nodeIds: string[],
  ) {
    return this.service.assignNodesToRole(roleName, nodeIds);
  }

  @Get(':roleName')
  async getNodes(@Param('roleName') roleName: string) {
    return this.service.getNodesForRole(roleName);
  }

  @Delete(':roleName')
  async removeAssignment(@Param('roleName') roleName: string) {
    await this.service.removeAssignment(roleName);
    return { success: true };
  }
}
