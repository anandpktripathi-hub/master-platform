import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { VcardsService } from './vcards.service';
import { VCard } from '../../database/schemas/vcard.schema';

describe('VcardsService', () => {
  let service: VcardsService;

  const vcardModelMock: any = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VcardsService,
        { provide: getModelToken(VCard.name), useValue: vcardModelMock },
      ],
    }).compile();

    service = module.get(VcardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws 400 when tenantId is invalid', async () => {
    await expect(service.listForTenant('bad')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('casts tenantId to ObjectId for listForTenant', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    vcardModelMock.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });

    await service.listForTenant(tenantId);

    expect(vcardModelMock.find).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
    });
  });
});
