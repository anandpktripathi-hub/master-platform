import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  const usersService = {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ _id: 'u1' }),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(usersService as any);
    jest.clearAllMocks();
  });

  it('getMe rejects when userId missing', async () => {
    await expect(controller.getMe({ user: {} } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(usersService.findOne).not.toHaveBeenCalled();
  });

  it('getMe forwards userId to service', async () => {
    await controller.getMe({ user: { sub: 'u1' } } as any);
    expect(usersService.findOne).toHaveBeenCalledWith('u1');
  });
});
