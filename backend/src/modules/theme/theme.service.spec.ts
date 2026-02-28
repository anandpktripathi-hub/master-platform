import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ThemeService } from './theme.service';
import { Theme } from '../../database/schemas/theme.schema';

describe('ThemeService (legacy module)', () => {
  let service: ThemeService;

  const themeModelMock: any = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemeService,
        { provide: getModelToken(Theme.name), useValue: themeModelMock },
      ],
    }).compile();

    service = module.get(ThemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws 400 on invalid tenantId', async () => {
    await expect(service.findAll('not-an-oid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('casts tenantId to ObjectId when listing', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    themeModelMock.find.mockReturnValue({ lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) });

    await service.findAll(tenantId);

    expect(themeModelMock.find).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
    });
  });
});
