import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PlansService } from '../services/plans.service';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active plans (public)' })
  @ApiResponse({ status: 200, description: 'Plans list returned successfully' })
  async getAllActivePlans() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  async getPlanById(@Param('id') id: string) {
    return this.plansService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new plan (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(201)
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update plan (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate plan (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan deactivated successfully' })
  async deactivatePlan(@Param('id') id: string) {
    return this.plansService.deactivate(id);
  }
}
