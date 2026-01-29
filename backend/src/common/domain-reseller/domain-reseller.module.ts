import { Module } from '@nestjs/common';
import { DomainResellerService } from './domain-reseller.service';

@Module({
  providers: [DomainResellerService],
  exports: [DomainResellerService],
})
export class DomainResellerModule {}
