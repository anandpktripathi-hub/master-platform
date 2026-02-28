import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CmsMenuShortController } from './cms-menu-short.controller';
import { CmsMenuService } from '../services/cms-menu.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('CmsMenuShortController', () => {
  let controller: CmsMenuShortController;

  const menuService = {
    getMenu: jest.fn().mockResolvedValue([{ label: 'Home' }]),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CmsMenuShortController],
      providers: [{ provide: CmsMenuService, useValue: menuService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(CmsMenuShortController);
    jest.clearAllMocks();
  });

  it('rejects when tenant context missing', async () => {
    await expect(controller.getMenu('', {} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('defaults to main menuId and returns menuItems', async () => {
    const result = await controller.getMenu(
      '507f1f77bcf86cd799439011',
      {},
    );

    expect(menuService.getMenu).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'main',
    );
    expect(result).toEqual({ menuItems: [{ label: 'Home' }] });
  });

  it('uses menuId query when provided', async () => {
    await controller.getMenu('507f1f77bcf86cd799439011', { menuId: 'footer' });

    expect(menuService.getMenu).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'footer',
    );
  });
});
