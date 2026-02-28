import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ThemesService } from './themes.service';
import { Theme } from '../schemas/theme.schema';
import { TenantTheme } from '../schemas/tenant-theme.schema';

describe('ThemesService', () => {
  let service: ThemesService;

  const themeModelMock: any = jest.fn();
  themeModelMock.findOne = jest.fn();
  themeModelMock.find = jest.fn();
  themeModelMock.findById = jest.fn();
  themeModelMock.findByIdAndUpdate = jest.fn();
  themeModelMock.findByIdAndDelete = jest.fn();

  const tenantThemeModelMock: any = jest.fn();
  tenantThemeModelMock.findOne = jest.fn();
  tenantThemeModelMock.countDocuments = jest.fn();

  beforeEach(async () => {
    themeModelMock.mockImplementation((doc: any) => ({
      ...doc,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue({
        ...doc,
        _id: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }));

    tenantThemeModelMock.mockImplementation((doc: any) => ({
      ...doc,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue({
        ...doc,
        _id: new Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        { provide: getModelToken(Theme.name), useValue: themeModelMock },
        { provide: getModelToken(TenantTheme.name), useValue: tenantThemeModelMock },
      ],
    }).compile();

    service = module.get(ThemesService);

    jest.clearAllMocks();
  });

  it('throws if theme key already exists', async () => {
    themeModelMock.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

    await expect(
      service.createTheme({
        name: 'My Theme',
        key: 'my-theme',
        previewImage: '',
        cssVariables: { 'color-primary': '#000' },
        status: 'ACTIVE',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects selecting an inactive theme', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    themeModelMock.findById.mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Inactive',
      key: 'inactive',
      previewImage: null,
      cssVariables: {},
      status: 'INACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.selectThemeForTenant(tenantId, {
        themeId: new Types.ObjectId().toHexString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns default theme when tenant has none', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    tenantThemeModelMock.findOne.mockResolvedValue(null);

    const defaultTheme = {
      _id: new Types.ObjectId(),
      name: 'Default',
      key: 'default',
      previewImage: null,
      cssVariables: { 'color-primary': '#111' },
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    themeModelMock.findOne.mockResolvedValue(defaultTheme);

    const result = await service.getTenantTheme(tenantId);

    expect(result.themeId).toBe(defaultTheme._id.toString());
    expect(result.mergedCssVariables['color-primary']).toBe('#111');
  });

  it('throws NotFound when no active default theme exists', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    tenantThemeModelMock.findOne.mockResolvedValue(null);
    themeModelMock.findOne.mockResolvedValue(null);

    await expect(service.getTenantTheme(tenantId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
