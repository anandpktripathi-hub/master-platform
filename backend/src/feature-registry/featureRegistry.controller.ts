import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { FeatureRegistryService } from './featureRegistry.service';

@Controller('features')
export class FeatureRegistryController {
  constructor(private readonly featureRegistryService: FeatureRegistryService) {}

  @Get()
  getAll() {
    return this.featureRegistryService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.featureRegistryService.findById(id);
  }

  @Post()
  create(@Body() node: any, @Query('parentId') parentId?: string) {
    return this.featureRegistryService.create(node, parentId);
  }

  @Patch(':id/assign-role/:role')
  assignRole(@Param('id') id: string, @Param('role') role: string) {
    return this.featureRegistryService.assignRole(id, role);
  }

  @Patch(':id/unassign-role/:role')
  unassignRole(@Param('id') id: string, @Param('role') role: string) {
    return this.featureRegistryService.unassignRole(id, role);
  }

  @Patch(':id/assign-tenant/:tenant')
  assignTenant(@Param('id') id: string, @Param('tenant') tenant: string) {
    return this.featureRegistryService.assignTenant(id, tenant);
  }

  @Patch(':id/unassign-tenant/:tenant')
  unassignTenant(@Param('id') id: string, @Param('tenant') tenant: string) {
    return this.featureRegistryService.unassignTenant(id, tenant);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() node: any) {
    return this.featureRegistryService.update(id, node);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.featureRegistryService.delete(id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.featureRegistryService.toggle(id);
  }
}
