import { Controller, Get, Post, Body } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from '../../database/schemas/tenant.schema';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Post()
  create(@Body() createTenantDto: Tenant) {
    return this.tenantService.create(createTenantDto);
  }
}
