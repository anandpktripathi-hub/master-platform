import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

describe('MarketplaceService', () => {
  const makeExecQuery = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) });

  const makePluginModel = () => {
    const find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    const findOne = jest.fn().mockReturnValue(makeExecQuery(null));
    return { find, findOne };
  };

  const makeInstallModel = () => {
    const modelFn: any = jest
      .fn()
      .mockImplementation(() => ({ save: jest.fn().mockResolvedValue(null) }));

    modelFn.findOne = jest.fn().mockReturnValue(makeExecQuery(null));
    modelFn.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    modelFn.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

    return modelFn;
  };

  it('throws BadRequest for invalid tenantId', async () => {
    const pluginModel = makePluginModel();
    const installModel = makeInstallModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken('MarketplacePlugin'), useValue: pluginModel },
        { provide: getModelToken('TenantPluginInstall'), useValue: installModel },
      ],
    }).compile();

    const service = moduleRef.get(MarketplaceService);

    await expect(service.listTenantInstalls('nope')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws BadRequest for invalid userId during install', async () => {
    const pluginModel = makePluginModel();
    pluginModel.findOne.mockReturnValue(
      makeExecQuery({ pluginId: 'p1', available: true, defaultConfig: {} }),
    );

    const installModel = makeInstallModel();
    installModel.findOne.mockReturnValue(makeExecQuery(null));
    installModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        _id: 'i1',
        tenantId: '507f1f77bcf86cd799439011',
        pluginId: 'p1',
        enabled: true,
        config: {},
        createdAt: new Date(),
      }),
    }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken('MarketplacePlugin'), useValue: pluginModel },
        { provide: getModelToken('TenantPluginInstall'), useValue: installModel },
      ],
    }).compile();

    const service = moduleRef.get(MarketplaceService);

    await expect(
      service.installPlugin('507f1f77bcf86cd799439011', 'bad', { pluginId: 'p1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFound when plugin missing/unavailable', async () => {
    const pluginModel = makePluginModel();
    pluginModel.findOne.mockReturnValue(makeExecQuery(null));
    const installModel = makeInstallModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken('MarketplacePlugin'), useValue: pluginModel },
        { provide: getModelToken('TenantPluginInstall'), useValue: installModel },
      ],
    }).compile();

    const service = moduleRef.get(MarketplaceService);

    await expect(
      service.installPlugin('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', { pluginId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws Conflict when already installed', async () => {
    const pluginModel = makePluginModel();
    pluginModel.findOne.mockReturnValue(
      makeExecQuery({ pluginId: 'p1', available: true, defaultConfig: {} }),
    );

    const installModel = makeInstallModel();
    installModel.findOne.mockReturnValue(makeExecQuery({ _id: 'existing' }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken('MarketplacePlugin'), useValue: pluginModel },
        { provide: getModelToken('TenantPluginInstall'), useValue: installModel },
      ],
    }).compile();

    const service = moduleRef.get(MarketplaceService);

    await expect(
      service.installPlugin('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', { pluginId: 'p1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps duplicate-key error to ConflictException', async () => {
    const pluginModel = makePluginModel();
    pluginModel.findOne.mockReturnValue(
      makeExecQuery({ pluginId: 'p1', available: true, defaultConfig: {} }),
    );

    const installModel = makeInstallModel();
    installModel.findOne.mockReturnValue(makeExecQuery(null));
    installModel.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue({ code: 11000 }),
    }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken('MarketplacePlugin'), useValue: pluginModel },
        { provide: getModelToken('TenantPluginInstall'), useValue: installModel },
      ],
    }).compile();

    const service = moduleRef.get(MarketplaceService);

    await expect(
      service.installPlugin('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', { pluginId: 'p1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('uninstall throws NotFound when nothing deleted', async () => {
    const pluginModel = makePluginModel();
    const installModel = makeInstallModel();
    installModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: getModelToken('MarketplacePlugin'), useValue: pluginModel },
        { provide: getModelToken('TenantPluginInstall'), useValue: installModel },
      ],
    }).compile();

    const service = moduleRef.get(MarketplaceService);

    await expect(
      service.uninstallPlugin('507f1f77bcf86cd799439011', 'p1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
