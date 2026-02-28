import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DashboardService } from './dashboard.service';
import { Dashboard } from '../../database/schemas/dashboard.schema';

describe('DashboardService', () => {
  const createService = async () => {
    const query = {
      exec: jest.fn(),
    };

    const dashboardModel = {
      findOne: jest.fn().mockReturnValue(query),
      findOneAndUpdate: jest.fn().mockReturnValue(query),
      findOneAndDelete: jest.fn().mockReturnValue(query),
      find: jest.fn().mockReturnValue(query),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Dashboard.name), useValue: dashboardModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(DashboardService),
      mocks: { dashboardModel, query },
    };
  };

  it('throws BadRequestException for invalid dashboard id', async () => {
    const { service } = await createService();

    const tenantId = new Types.ObjectId().toString();

    await expect(
      service.findOne('not-an-objectid', tenantId),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('scopes update to tenant', async () => {
    const { service, mocks } = await createService();
    mocks.query.exec.mockResolvedValue({ _id: 'x' });

    const id = new Types.ObjectId().toString();
    const tenantId = new Types.ObjectId().toString();
    await service.update(id, { name: 'n' }, tenantId);

    expect(mocks.dashboardModel.findOneAndUpdate).toHaveBeenCalled();

    type UpdateFilter = { _id: Types.ObjectId; tenantId: Types.ObjectId };
    const [filter] = mocks.dashboardModel.findOneAndUpdate.mock
      .calls[0] as unknown as [UpdateFilter, unknown, unknown];
    expect(filter.tenantId).toBeInstanceOf(Types.ObjectId);
    expect(filter._id).toBeInstanceOf(Types.ObjectId);
  });

  it('throws NotFound on tenant-scoped remove miss', async () => {
    const { service, mocks } = await createService();
    mocks.query.exec.mockResolvedValue(null);

    const id = new Types.ObjectId().toString();
    const tenantId = new Types.ObjectId().toString();
    await expect(service.remove(id, tenantId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
