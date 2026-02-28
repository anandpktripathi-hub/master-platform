import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { StripeService } from './stripe.service';
import { StripeLifetimeCheckoutDto } from './dto/stripe-checkout.dto';

@ApiTags('Billing - Stripe')
@ApiBearerAuth()
@Controller('billing/lifetime')
export class LifetimeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Create Stripe checkout session for lifetime plan' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  @ApiResponse({ status: 400, description: 'Invalid payload / tenant context' })
  async checkout(
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() body: StripeLifetimeCheckoutDto,
  ) {
    const tenantId = tenantIdFromContext || body.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    if (tenantIdFromContext && body.tenantId && tenantIdFromContext !== body.tenantId) {
      throw new BadRequestException('Tenant mismatch');
    }

    // Create Stripe session for lifetime plan
    return this.stripeService.createLifetimeProduct(tenantId, body.price);
  }
}
