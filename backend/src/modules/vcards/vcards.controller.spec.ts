import { VcardsController } from './vcards.controller';

describe('VcardsController', () => {
  let controller: VcardsController;

  const vcardsService = {
    listForTenant: jest.fn().mockResolvedValue([]),
    createForTenant: jest.fn().mockResolvedValue({ _id: 'v1' }),
    updateForTenant: jest.fn().mockResolvedValue({ _id: 'v1' }),
    deleteForTenant: jest.fn().mockResolvedValue(undefined),
    getPublicVcard: jest.fn().mockResolvedValue({ _id: 'v1' }),
  };

  beforeEach(() => {
    controller = new VcardsController(vcardsService as any);
    jest.clearAllMocks();
  });

  it('listTenantVcards delegates to service', () => {
    controller.listTenantVcards('t1');
    expect(vcardsService.listForTenant).toHaveBeenCalledWith('t1');
  });

  it('getPublicVcard delegates to service', () => {
    controller.getPublicVcard('v1');
    expect(vcardsService.getPublicVcard).toHaveBeenCalledWith('v1');
  });
});
