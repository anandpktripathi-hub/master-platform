import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateHierarchyNodeDto,
  GetHierarchyTreeQueryDto,
  UpdateHierarchyNodeDto,
} from './dto/hierarchy.dto';
@ApiTags('Hierarchy')
@Controller('hierarchy')
export class HierarchyController {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Post()
  async create(@Body() data: CreateHierarchyNodeDto) {
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
  async update(@Param('id') id: string, @Body() data: UpdateHierarchyNodeDto) {
    return this.hierarchyService.updateNode(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.hierarchyService.deleteNode(id);
    return { success: true };
  }

  @Get()
  async getTree(@Query() query: GetHierarchyTreeQueryDto) {
    return this.hierarchyService.getTree(query.rootType);
  }
}
