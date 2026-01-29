import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { HierarchyNode } from './hierarchy.schema';

@Controller('hierarchy')
export class HierarchyController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Post()
  async create(@Body() data: Partial<HierarchyNode>) {
    return this.hierarchyService.createNode(data);
  }

  @Get(':id')
  async getNode(@Param('id') id: string) {
    return this.hierarchyService.getNodeById(id);
  }

  @Get(':id/children')
  async getChildren(@Param('id') id: string) {
    return this.hierarchyService.getChildren(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<HierarchyNode>) {
    return this.hierarchyService.updateNode(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.hierarchyService.deleteNode(id);
    return { success: true };
  }

  @Get()
  async getTree(@Query('rootType') rootType?: string) {
    return this.hierarchyService.getTree(rootType);
  }
}
