import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TenantService } from './tenant.service';
import { Tenant } from '../../database/schemas/tenant.schema';

describe('TenantService', () => {
  let service: TenantService;

  const tenantModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: getModelToken(Tenant.name), useValue: tenantModel },
      ],
    }).compile();

    service = moduleRef.get(TenantService);
    jest.clearAllMocks();
  });

  it('throws BadRequestException for invalid tenantId', async () => {
    await expect(service.getCurrentTenant('not-an-oid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('queries by ObjectId and returns document', async () => {
    const id = new Types.ObjectId().toHexString();
    const doc = { _id: id, name: 'Acme' };

    tenantModel.findById.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve(doc),
      }),
    });

    const res = await service.getCurrentTenant(id);

    expect(tenantModel.findById).toHaveBeenCalledWith(expect.any(Types.ObjectId));
    const calledWith = tenantModel.findById.mock.calls[0]?.[0] as Types.ObjectId;
    expect(calledWith.toHexString()).toBe(id);
    expect(res).toEqual(doc);
  });
});
