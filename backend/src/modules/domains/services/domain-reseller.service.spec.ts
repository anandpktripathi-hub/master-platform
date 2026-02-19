import { Model } from 'mongoose';
import { DomainResellerService } from './domain-reseller.service';
import {
  DomainResellerProvider,
  DomainPurchaseRequest,
  DomainPurchaseResult,
} from './domain-reseller.provider';
import {
  DomainResellerOrder,
  DomainResellerOrderDocument,
} from '../../../database/schemas/domain-reseller-order.schema';

describe('DomainResellerService', () => {
  it('persists an order record when purchase is attempted', async () => {
    const purchaseResult: DomainPurchaseResult = {
      success: true,
      domain: 'example.test',
      providerOrderId: 'stub-123',
      nameservers: ['ns1.example.test', 'ns2.example.test'],
      message: 'ok',
    };

    const mockProvider: DomainResellerProvider = {
      search: jest.fn(),
      purchase: jest.fn().mockResolvedValue(purchaseResult),
      ensureDns: jest.fn(),
    };

    const createMock = jest.fn();
    const mockModel = {
      create: createMock,
    } as unknown as Model<DomainResellerOrderDocument>;

    const service = new DomainResellerService(mockProvider, mockModel);

    const request: DomainPurchaseRequest = {
      domain: 'example.test',
      tenantId: 'tenant-1',
      years: 1,
      contactEmail: 'owner@example.test',
    };

    const result = await service.purchase(request);

    expect(result).toBe(purchaseResult);
    expect(mockProvider.purchase).toHaveBeenCalledWith(request);
    expect(createMock).toHaveBeenCalledTimes(1);

    const savedDoc = createMock.mock
      .calls[0][0] as Partial<DomainResellerOrder>;
    expect(savedDoc.tenantId).toBe('tenant-1');
    expect(savedDoc.domain).toBe('example.test');
    expect(savedDoc.providerOrderId).toBe('stub-123');
    expect(savedDoc.status).toBe('purchased');
    expect(savedDoc.rawResponse).toEqual(purchaseResult);
  });
});
