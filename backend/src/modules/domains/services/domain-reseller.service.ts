import { Inject, Injectable } from '@nestjs/common';
import {
  DomainResellerProvider,
  DomainSearchResult,
  DomainPurchaseRequest,
  DomainPurchaseResult,
  DnsRecord,
} from './domain-reseller.provider';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DomainResellerOrder,
  DomainResellerOrderDocument,
} from '../../../database/schemas/domain-reseller-order.schema';
import { DOMAIN_RESELLER_PROVIDER_TOKEN } from './domain-reseller.provider';

@Injectable()
export class DomainResellerService {
  // For now we inject the stub implementation; later this can be swapped
  // for a real provider via NestJS configuration.
  constructor(
    @Inject(DOMAIN_RESELLER_PROVIDER_TOKEN)
    private readonly provider: DomainResellerProvider,
    @InjectModel(DomainResellerOrder.name)
    private readonly orderModel: Model<DomainResellerOrderDocument>,
  ) {}

  async search(domain: string): Promise<DomainSearchResult> {
    return this.provider.search(domain);
  }

  async purchase(request: DomainPurchaseRequest): Promise<DomainPurchaseResult> {
    const result = await this.provider.purchase(request);

    await this.orderModel.create({
      tenantId: request.tenantId as unknown as Types.ObjectId,
      domain: request.domain,
      provider: result.success ? result.providerOrderId?.split('-')[0] ?? 'unknown' : 'unknown',
      providerOrderId: result.providerOrderId,
      status: result.success ? 'purchased' : 'failed',
      rawResponse: result,
    } as Partial<DomainResellerOrder>);

    return result;
  }

  async ensureDns(domain: string, records: DnsRecord[]): Promise<void> {
    return this.provider.ensureDns(domain, records);
  }
}
