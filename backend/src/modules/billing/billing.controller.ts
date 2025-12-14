import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { Billing } from '../../database/schemas/billing.schema';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

@Controller('billings')
@UseGuards(RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.billingService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() createBillingDto: Billing, @Tenant() tenantId: string) {
    return this.billingService.create(createBillingDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateBillingDto: Billing,
    @Tenant() tenantId: string,
  ) {
    return this.billingService.update(id, updateBillingDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }
}
