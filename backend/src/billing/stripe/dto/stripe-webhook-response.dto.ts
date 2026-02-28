import { ApiProperty } from '@nestjs/swagger';

export class StripeWebhookResponseDto {
  @ApiProperty({ description: 'Stripe webhook received' })
  received!: boolean;

  @ApiProperty({ required: false, description: 'True when event is a duplicate' })
  duplicate?: boolean;

  @ApiProperty({
    required: false,
    description: 'Idempotency slot state when duplicate/in-progress',
  })
  state?: string;
}
