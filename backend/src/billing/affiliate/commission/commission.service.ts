import { Injectable } from '@nestjs/common';

@Injectable()
export class CommissionService {
  async calculateCommission(affiliateId: string): Promise<number> {
    // Calculate 30% recurring commission for the affiliate
    // ...implementation...
    return 0; // Replace with actual logic
  }
}
