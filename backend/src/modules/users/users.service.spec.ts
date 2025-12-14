import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { Role } from './role.types';

// Minimal User schema shape used by service
interface UserShape {
  _id: unknown;
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive?: boolean;
  company?: string;
}

describe('UsersService', () => {
  let service: UsersService;
  const mockModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // reset mocks
    jest.resetAllMocks();
  });

  it('create() returns user without password', async () => {
    mockModel.findOne.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve(null) }) }),
    });
    const created: UserShape = {
      _id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'hashed',
      role: Role.ADMIN,
      isActive: true,
      company: '',
    };
    mockModel.create.mockResolvedValue({
      _id: '1',
      toObject: () => created,
    });

    const result = await service.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password',
      role: Role.ADMIN,
    });

    // password must be omitted
    expect(Object.prototype.hasOwnProperty.call(result, 'password')).toBe(
      false,
    );
    expect(result.role).toBe(Role.ADMIN);
    expect(result._id).toBe('1');
  });

  it('create() supports PLATFORM_SUPER_ADMIN role', async () => {
    mockModel.findOne.mockReturnValue({
      select: () => ({ lean: () => ({ exec: () => Promise.resolve(null) }) }),
    });
    const created: UserShape = {
      _id: '2',
      name: 'Super Admin',
      email: 'super@example.com',
      password: 'hashed',
      role: Role.PLATFORM_SUPER_ADMIN,
      isActive: true,
      company: '',
    };
    mockModel.create.mockResolvedValue({
      _id: '2',
      toObject: () => created,
    });

    const result = await service.create({
      name: 'Super Admin',
      email: 'super@example.com',
      password: 'password',
      role: Role.PLATFORM_SUPER_ADMIN,
    });

    expect(Object.prototype.hasOwnProperty.call(result, 'password')).toBe(
      false,
    );
    expect(result.role).toBe(Role.PLATFORM_SUPER_ADMIN);
  });
});
