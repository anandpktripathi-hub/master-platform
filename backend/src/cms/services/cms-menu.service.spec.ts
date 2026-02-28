import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { CmsMenuService } from './cms-menu.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

describe('CmsMenuService', () => {
  type MenuItemModel = {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findById: jest.Mock;
    deleteMany: jest.Mock;
  };

  const makeModel = () => {
    const model: MenuItemModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({ sort: jest.fn() }),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findById: jest.fn(),
      deleteMany: jest.fn(),
    };
    return model;
  };

  async function createService(overrides?: { model?: MenuItemModel }) {
    const model = overrides?.model ?? makeModel();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CmsMenuService,
        { provide: getModelToken('CmsMenuItemEntity'), useValue: model },
      ],
    }).compile();

    return { service: moduleRef.get(CmsMenuService), model };
  }

  it('updateMenuItem rejects invalid itemId', async () => {
    const { service } = await createService();

    await expect(
      service.updateMenuItem('t1', 'not-an-objectid', {
        label: 'X',
      } as Partial<CreateMenuItemDto>),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deleteMenuItem rejects invalid itemId', async () => {
    const { service } = await createService();

    await expect(service.deleteMenuItem('t1', 'nope')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('reorderMenu rejects invalid ids in payload', async () => {
    const { service } = await createService();

    await expect(
      service.reorderMenu('t1', 'main', [{ id: 'bad', order: 1 }]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
