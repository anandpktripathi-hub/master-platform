import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { UserHierarchyService } from './user-hierarchy.service';

@Controller('user-hierarchy')
export class UserHierarchyController {
  constructor(private readonly service: UserHierarchyService) {}

  @Post(':userId')
  async assignNodes(
    @Param('userId') userId: string,
    @Body('nodeIds') nodeIds: string[],
  ) {
    return this.service.assignNodesToUser(userId, nodeIds);
  }

  @Get(':userId')
  async getNodes(@Param('userId') userId: string) {
    return this.service.getNodesForUser(userId);
  }

  @Delete(':userId')
  async removeAssignment(@Param('userId') userId: string) {
    await this.service.removeAssignment(userId);
    return { success: true };
  }
}
