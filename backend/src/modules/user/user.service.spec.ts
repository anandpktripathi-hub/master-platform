import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserService } from './user.service';
import { User } from '../../database/schemas/user.schema';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (v: string) => `hashed:${v}`),
}));

describe('UserService (legacy module)', () => {
  let service: UserService;

  const userModelMock: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModelMock },
      ],
    }).compile();

    service = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hashes password on create and omits it from response', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    userModelMock.create.mockResolvedValue({
      toObject: () => ({
        _id: new Types.ObjectId().toHexString(),
        email: 'a@example.com',
        password: 'hashed:pw',
      }),
    });

    const res = await service.create(
      { name: 'A', email: 'A@Example.com', password: 'pw' },
      tenantId,
    );

    expect((res as any).password).toBeUndefined();
    expect(userModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'a@example.com',
        password: 'hashed:pw',
        tenantId: new Types.ObjectId(tenantId),
      }),
    );
  });
});
