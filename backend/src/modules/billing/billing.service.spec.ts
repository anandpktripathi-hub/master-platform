import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BillingService } from './billing.service';
import { Billing } from '../../database/schemas/billing.schema';
import { Model } from 'mongoose';

describe('BillingService', () => {
  let service: BillingService;
  let model: Model<any>;

  const mockBillingModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  const mockBilling = {
    _id: '123',
    tenantId: 'tenant-1',
    amount: 100,
    status: 'paid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getModelToken(Billing.name),
          useValue: mockBillingModel,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    model = module.get<Model<any>>(getModelToken(Billing.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of billing records', async () => {
      const tenantId = 'tenant-1';
      mockBillingModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockBilling]),
      });

      const result = await service.findAll(tenantId);

      expect(result).toEqual([mockBilling]);
      expect(mockBillingModel.find).toHaveBeenCalledWith({ tenantId });
    });

    it('should throw error when database fails', async () => {
      const tenantId = 'tenant-1';
      mockBillingModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findAll(tenantId)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a billing record by id', async () => {
      const id = '123';
      mockBillingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBilling),
      });

      const result = await service.findOne(id);

      expect(result).toEqual(mockBilling);
      expect(mockBillingModel.findById).toHaveBeenCalledWith(id);
    });

    it('should return null when billing record not found', async () => {
      const id = 'non-existent';
      mockBillingModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne(id);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new billing record', async () => {
      const createBillingDto: any = {
        amount: 100,
        status: 'paid',
      };
      const tenantId = 'tenant-1';

      const mockSave = jest.fn().mockResolvedValue({
        ...createBillingDto,
        tenantId,
      });

      mockBillingModel.save = mockSave;

      // Mock constructor
      jest.spyOn(model, 'constructor' as any).mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.create(createBillingDto, tenantId);

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a billing record', async () => {
      const id = '123';
      const updateBillingDto: any = { amount: 200 };
      const tenantId = 'tenant-1';

      mockBillingModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockBilling,
          ...updateBillingDto,
        }),
      });

      const result = await service.update(id, updateBillingDto, tenantId);

      expect(result).toBeDefined();
      expect(result?.amount).toBe(200);
      expect(mockBillingModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { ...updateBillingDto, tenantId },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should remove a billing record', async () => {
      const id = '123';

      mockBillingModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBilling),
      });

      const result = await service.remove(id);

      expect(result).toBeDefined();
      expect(mockBillingModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });
  });
});
