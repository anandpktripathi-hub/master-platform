import { BadRequestException } from '@nestjs/common';
import { DomainsController } from './domains.controller';

describe('DomainsController', () => {
  let controller: DomainsController;

  const domainService = {
    getDomainsForTenant: jest.fn().mockResolvedValue({ items: [] }),
    checkAvailability: jest.fn().mockResolvedValue(true),
  };

  const domainResellerService = {
    search: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(() => {
    controller = new DomainsController(
      domainService as any,
      domainResellerService as any,
    );
    jest.clearAllMocks();
  });

  it('getTenantDomains rejects when tenantId missing from request', async () => {
    await expect(
      controller.getTenantDomains({ user: {} } as any, {} as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(domainService.getDomainsForTenant).not.toHaveBeenCalled();
  });

  it('checkAvailability rejects when type/value missing', async () => {
    await expect(
      controller.checkAvailability(undefined as any, undefined as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('checkAvailability includes reseller data for dotted domains', async () => {
    const res = await controller.checkAvailability('subdomain' as any, 'example.com');

    expect(domainService.checkAvailability).toHaveBeenCalledWith(
      'subdomain',
      'example.com',
    );
    expect(domainResellerService.search).toHaveBeenCalledWith('example.com');
    expect(res).toEqual({
      available: true,
      reseller: { ok: true },
      value: 'example.com',
      type: 'subdomain',
    });
  });
});
