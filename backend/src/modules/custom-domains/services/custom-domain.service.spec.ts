import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CustomDomainService } from './custom-domain.service';
import { CustomDomain } from '../../../database/schemas/custom-domain.schema';
import { TenantPackage } from '../../../database/schemas/tenant-package.schema';
import { Package } from '../../../database/schemas/package.schema';
import { AuditLogService } from '../../../services/audit-log.service';

describe('CustomDomainService', () => {
  let service: CustomDomainService;

  const customDomainModelMock: any = (function () {
    const model: any = function (this: any, doc: any) {
      Object.assign(this, doc);
      this._id = this._id || new Types.ObjectId();
      this.toObject = () => ({ ...doc, _id: this._id });
      this.save = jest.fn().mockResolvedValue(this);
    };
    model.findOne = jest.fn();
    model.findById = jest.fn();
    model.updateMany = jest.fn();
    model.findByIdAndUpdate = jest.fn();
    model.find = jest.fn();
    model.countDocuments = jest.fn();
    return model;
  })();

  const tenantPackageModelMock: any = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const packageModelMock: any = {
    findById: jest.fn(),
  };

  const auditLogServiceMock: Partial<AuditLogService> = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomDomainService,
        { provide: getModelToken(CustomDomain.name), useValue: customDomainModelMock },
        { provide: getModelToken(TenantPackage.name), useValue: tenantPackageModelMock },
        { provide: getModelToken(Package.name), useValue: packageModelMock },
        { provide: AuditLogService, useValue: auditLogServiceMock },
      ],
    }).compile();

    service = module.get(CustomDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects platform-domain subdomains', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    await expect(
      service.requestCustomDomain(
        tenantId,
        { domain: 'foo.localhost', verificationMethod: 'TXT' },
        new Types.ObjectId().toHexString(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when tenant has no active package', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    tenantPackageModelMock.findOne.mockReturnValue({
      populate: () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      service.requestCustomDomain(
        tenantId,
        { domain: 'example.com', verificationMethod: 'TXT' },
        new Types.ObjectId().toHexString(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when package does not allow custom domains', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    tenantPackageModelMock.findOne.mockReturnValue({
      populate: () => ({
        exec: jest.fn().mockResolvedValue({
          usageCounters: { customDomains: 0 },
          packageId: {
            featureSet: { allowCustomDomain: false },
            limits: { maxCustomDomains: 1 },
          },
        }),
      }),
    });

    customDomainModelMock.findOne.mockResolvedValue(null);

    await expect(
      service.requestCustomDomain(
        tenantId,
        { domain: 'example.com', verificationMethod: 'TXT' },
        new Types.ObjectId().toHexString(),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
