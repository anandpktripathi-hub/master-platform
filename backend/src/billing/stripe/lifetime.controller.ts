import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('billing/lifetime')
export class LifetimeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async checkout(@Body() body: { tenantId: string; price: number }) {
    // Create Stripe session for lifetime plan
    return this.stripeService.createLifetimeProduct(body.tenantId, body.price);
  }
}
