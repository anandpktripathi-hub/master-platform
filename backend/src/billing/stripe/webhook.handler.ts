import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('billing/stripe/webhook')
export class StripeWebhookHandler {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handle(@Req() req: Request, @Res() res: Response) {
    // Verify and handle Stripe webhook events
    res.status(200).send('ok');
  }
}
