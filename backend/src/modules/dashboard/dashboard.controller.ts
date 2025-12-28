import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Dashboard } from '../../database/schemas/dashboard.schema';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

@Controller('dashboards')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.dashboardService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.dashboardService.findOne(id, tenantId);
  }

  @Post()
  @Roles('admin')
  create(@Body() createDashboardDto: Dashboard, @Tenant() tenantId: string) {
    return this.dashboardService.create(createDashboardDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: Dashboard,
    @Tenant() tenantId: string,
  ) {
    return this.dashboardService.update(id, updateDashboardDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(id);
  }
}
