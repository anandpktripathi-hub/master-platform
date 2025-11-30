import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dashboard, DashboardSchema } from '../../database/schemas/dashboard.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dashboard.name, schema: DashboardSchema }])],
  controllers: [DashboardController],
  providers: [DashboardService, RolesGuard],
})
export class DashboardModule {}


