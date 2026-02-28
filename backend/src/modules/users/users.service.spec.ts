import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/schemas/user.schema';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (v: string) => `hashed:${v}`),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    countDocuments: jest.fn(),
    deleteOne: jest.fn(() => ({ exec: jest.fn() })),
    findOne: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('create hashes password and omits it from response', async () => {
    mockUserModel.findOne.mockReturnValue({
      select: () => ({ lean: () => ({ exec: async () => null }) }),
    });

    mockUserModel.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      toObject: () => ({
        _id: '507f1f77bcf86cd799439011',
        name: 'A',
        email: 'a@example.com',
        password: 'hashed:pw',
        role: 'user',
        isActive: true,
        company: '',
      }),
    });

    const res = await service.create({
      name: 'A',
      email: 'A@Example.com',
      password: 'pw',
    });

    expect(res.email).toBe('a@example.com');
    expect((res as any).password).toBeUndefined();
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: 'a@example.com',
      tenantId: null,
    });
    expect(mockUserModel.create).toHaveBeenCalled();
  });

  it('create throws ConflictException when email exists within tenant scope', async () => {
    mockUserModel.findOne.mockReturnValue({
      select: () => ({ lean: () => ({ exec: async () => ({ _id: '1' }) }) }),
    });

    await expect(
      service.create({
        name: 'A',
        email: 'a@example.com',
        password: 'pw',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll returns safe users and total', async () => {
    mockUserModel.find.mockReturnValue({
      select: () => ({
        skip: () => ({
          limit: () => ({
            lean: () => ({ exec: async () => [{ _id: 1, email: 'a@x.com' }] }),
          }),
        }),
      }),
    });
    mockUserModel.countDocuments.mockResolvedValue(1);

    const res = await service.findAll(1, 10);
    expect(res.total).toBe(1);
    expect(res.data[0]._id).toBe('1');
  });
});