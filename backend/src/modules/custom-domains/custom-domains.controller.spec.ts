import { BadRequestException } from '@nestjs/common';
import { CustomDomainController } from './custom-domains.controller';

describe('CustomDomainController', () => {
  let controller: CustomDomainController;

  const customDomainService = {
    getCustomDomainsForTenant: jest.fn().mockResolvedValue({ data: [] }),
    requestCustomDomain: jest.fn().mockResolvedValue({ _id: 'd1' }),
  };

  beforeEach(() => {
    controller = new CustomDomainController(customDomainService as any);
    jest.clearAllMocks();
  });

  it('getTenantCustomDomains rejects when user missing', async () => {
    await expect(
      controller.getTenantCustomDomains(
        {} as any,
        undefined,
        undefined,
        undefined,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(customDomainService.getCustomDomainsForTenant).not.toHaveBeenCalled();
  });

  it('getTenantCustomDomains forwards tenantId, limit and skip', async () => {
    await controller.getTenantCustomDomains(
      { user: { tenantId: 't1' } } as any,
      undefined,
      '10',
      '5',
    );

    expect(customDomainService.getCustomDomainsForTenant).toHaveBeenCalledWith(
      't1',
      {
        status: undefined,
        limit: 10,
        skip: 5,
      },
    );
  });
});
