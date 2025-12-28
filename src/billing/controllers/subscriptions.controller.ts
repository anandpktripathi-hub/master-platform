import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscribeDto } from '../dto/subscribe.dto';
import { ChangePlanDto } from '../dto/change-plan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('subscribe')
  @HttpCode(201)
  @ApiOperation({ summary: 'Subscribe to a plan' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - tenant already has subscription',
  })
  async subscribe(@Body() subscribeDto: SubscribeDto, @Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.subscriptionsService.create(tenantId, subscribeDto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription returned' })
  @ApiResponse({ status: 404, description: 'No subscription found' })
  async getCurrentSubscription(@Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.subscriptionsService.findByTenantId(tenantId);
  }

  @Patch('change-plan')
  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan changed successfully' })
  async changePlan(@Body() changePlanDto: ChangePlanDto, @Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.subscriptionsService.changePlan(tenantId, changePlanDto);
  }

  @Patch('upgrade')
  @ApiOperation({ summary: 'Upgrade to a better plan' })
  async upgrade(@Body() changePlanDto: ChangePlanDto, @Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.subscriptionsService.changePlan(tenantId, changePlanDto);
  }

  @Patch('downgrade')
  @ApiOperation({ summary: 'Downgrade to a lower plan' })
  async downgrade(@Body() changePlanDto: ChangePlanDto, @Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.subscriptionsService.changePlan(tenantId, changePlanDto);
  }

  @Patch('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(
    @Query('atPeriodEnd') atPeriodEnd: boolean = false,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId;
    return this.subscriptionsService.cancelSubscription(tenantId, atPeriodEnd);
  }
}
