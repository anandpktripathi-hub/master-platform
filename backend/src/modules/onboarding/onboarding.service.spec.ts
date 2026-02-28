import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  it('throws BadRequestException for invalid tenantId', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: getModelToken('CrmContact'), useValue: {} },
        { provide: getModelToken('CrmCompany'), useValue: {} },
        { provide: getModelToken('CrmDeal'), useValue: {} },
        { provide: getModelToken('CrmTask'), useValue: {} },
        { provide: getModelToken('UserPost'), useValue: {} },
        { provide: getModelToken('Ticket'), useValue: {} },
        { provide: getModelToken('Tenant'), useValue: {} },
      ],
    }).compile();

    const service = moduleRef.get(OnboardingService);

    await expect(
      service.getSampleStatus({ tenantId: 'undefined' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when tenant does not exist (getSampleStatus)', async () => {
    const tenantModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: getModelToken('CrmContact'), useValue: { findOne: jest.fn() } },
        { provide: getModelToken('CrmCompany'), useValue: {} },
        { provide: getModelToken('CrmDeal'), useValue: {} },
        { provide: getModelToken('CrmTask'), useValue: {} },
        { provide: getModelToken('UserPost'), useValue: { findOne: jest.fn() } },
        { provide: getModelToken('Ticket'), useValue: { findOne: jest.fn() } },
        { provide: getModelToken('Tenant'), useValue: tenantModel },
      ],
    }).compile();

    const service = moduleRef.get(OnboardingService);

    await expect(
      service.getSampleStatus({ tenantId: '507f1f77bcf86cd799439011' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when tenant does not exist (seedSampleData)', async () => {
    const tenantModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: getModelToken('CrmContact'), useValue: { findOne: jest.fn() } },
        { provide: getModelToken('CrmCompany'), useValue: { create: jest.fn() } },
        { provide: getModelToken('CrmDeal'), useValue: { create: jest.fn() } },
        { provide: getModelToken('CrmTask'), useValue: { create: jest.fn() } },
        { provide: getModelToken('UserPost'), useValue: { create: jest.fn() } },
        { provide: getModelToken('Ticket'), useValue: { create: jest.fn() } },
        { provide: getModelToken('Tenant'), useValue: tenantModel },
      ],
    }).compile();

    const service = moduleRef.get(OnboardingService);

    await expect(
      service.seedSampleData({
        tenantId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
