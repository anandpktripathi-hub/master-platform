import { BadRequestException } from '@nestjs/common';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  const userService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({ _id: 'u1' }),
    update: jest.fn().mockResolvedValue({ _id: 'u1' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    controller = new UserController(userService as any);
    jest.clearAllMocks();
  });

  it('findAll rejects when tenantId missing', () => {
    expect(() => controller.findAll(undefined as any)).toThrow(
      BadRequestException,
    );
    expect(userService.findAll).not.toHaveBeenCalled();
  });

  it('create forwards tenantId to service', () => {
    controller.create({} as any, 't1');
    expect(userService.create).toHaveBeenCalledWith({}, 't1');
  });
});
