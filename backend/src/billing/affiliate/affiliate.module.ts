import { Module } from '@nestjs/common';
import { CommissionService } from './commission/commission.service';
import { ReferralService } from './referral/referral.service';
import { PayoutService } from './payout/payout.service';

@Module({
  providers: [CommissionService, ReferralService, PayoutService],
  exports: [CommissionService, ReferralService, PayoutService],
})
export class AffiliateModule {}
