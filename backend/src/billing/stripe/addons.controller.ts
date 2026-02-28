import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { StripeService } from './stripe.service';
import { StripeAddonCheckoutDto } from './dto/stripe-checkout.dto';

@ApiTags('Billing - Stripe')
@ApiBearerAuth()
@Controller('billing/addons')
export class AddonsController {
  private readonly logger = new Logger(AddonsController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Create Stripe checkout session for an add-on' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  @ApiResponse({ status: 400, description: 'Invalid payload / tenant context' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async checkout(
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() body: StripeAddonCheckoutDto,
  ) {
    try {
      const tenantId = tenantIdFromContext || body.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }

      if (
        tenantIdFromContext &&
        body.tenantId &&
        tenantIdFromContext !== body.tenantId
      ) {
        throw new BadRequestException('Tenant mismatch');
      }

      // Create Stripe session for add-on
      return await this.stripeService.createAddon(tenantId, body.addon);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[checkout] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create add-on checkout');
    }
  }
}
