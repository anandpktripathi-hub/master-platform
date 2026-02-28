import { BadRequestException } from '@nestjs/common';
import { ThemeController } from './theme.controller';

describe('ThemeController', () => {
  let controller: ThemeController;

  const themeService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({ _id: 'th1' }),
    update: jest.fn().mockResolvedValue({ _id: 'th1' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    controller = new ThemeController(themeService as any);
    jest.clearAllMocks();
  });

  it('findAll rejects when tenantId missing', () => {
    expect(() => controller.findAll(undefined as any)).toThrow(
      BadRequestException,
    );
    expect(themeService.findAll).not.toHaveBeenCalled();
  });

  it('create forwards tenantId to service', () => {
    controller.create({} as any, 't1');
    expect(themeService.create).toHaveBeenCalledWith({}, 't1');
  });
});
