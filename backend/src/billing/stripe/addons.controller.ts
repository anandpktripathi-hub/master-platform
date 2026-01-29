import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('billing/addons')
export class AddonsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async checkout(@Body() body: { tenantId: string; addon: any }) {
    // Create Stripe session for add-on
    return this.stripeService.createAddon(body.tenantId, body.addon);
  }
}
