import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { HierarchyNode } from './hierarchy.schema';

describe('HierarchyService', () => {
  let service: HierarchyService;

  const mockNodeModel = {
    create: jest.fn(),
    exists: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HierarchyService,
        {
          provide: getModelToken(HierarchyNode.name),
          useValue: mockNodeModel,
        },
      ],
    }).compile();

    service = module.get<HierarchyService>(HierarchyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('createNode delegates to model.create', async () => {
    mockNodeModel.create.mockResolvedValue({ _id: '1', name: 'X' });
    const res = await service.createNode({ name: 'X', type: 'module' } as any);
    expect(res).toEqual({ _id: '1', name: 'X' });
  });

  it('getNodeById throws BadRequestException for invalid ids', async () => {
    await expect(service.getNodeById('missing')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('getNodeById throws NotFoundException when missing', async () => {
    mockNodeModel.findById.mockReturnValue({
      exec: async () => null,
    });

    await expect(
      service.getNodeById('507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deleteNode throws NotFoundException when missing', async () => {
    mockNodeModel.findByIdAndDelete.mockReturnValue({
      exec: async () => null,
    });

    await expect(
      service.deleteNode('507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});