import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SupportService } from './support.service';
import { Ticket } from '../../database/schemas/ticket.schema';

describe('SupportService', () => {
  let service: SupportService;

  const ticketModelMock: any = {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: getModelToken(Ticket.name), useValue: ticketModelMock },
      ],
    }).compile();

    service = module.get(SupportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists tickets scoped to tenant when tenantId provided', async () => {
    const userId = new Types.ObjectId().toHexString();
    const tenantId = new Types.ObjectId().toHexString();

    ticketModelMock.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });

    await service.listMyTickets(userId, tenantId);

    expect(ticketModelMock.find).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    });
  });
});
