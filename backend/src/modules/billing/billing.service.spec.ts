import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BillingService } from './billing.service';
import { Billing } from '../../database/schemas/billing.schema';
import { BillingNotificationService } from './billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';

describe('BillingService', () => {
  let service: BillingService;

  const tenantId = '507f1f77bcf86cd799439011';
  const billingId = '507f1f77bcf86cd799439012';

  const mockBillingModel: any = jest.fn();
  mockBillingModel.find = jest.fn();
  mockBillingModel.findOne = jest.fn();
  mockBillingModel.findOneAndUpdate = jest.fn();
  mockBillingModel.findOneAndDelete = jest.fn();
  mockBillingModel.findById = jest.fn();
  mockBillingModel.findByIdAndDelete = jest.fn();

  const billingNotificationsMock = {
    sendInvoiceCreatedEmail: jest.fn(),
  };

  const tenantsServiceMock = {
    getTenantBillingEmail: jest.fn(),
  };

  const mockBilling = {
    _id: billingId,
    tenantId,
    amount: 100,
    status: 'paid',
  };

  beforeEach(async () => {
    mockBillingModel.mockImplementation((doc: any) => ({
      ...doc,
      save: jest.fn().mockResolvedValue({ _id: billingId, ...doc }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getModelToken(Billing.name),
          useValue: mockBillingModel,
        },
        {
          provide: BillingNotificationService,
          useValue: billingNotificationsMock,
        },
        {
          provide: TenantsService,
          useValue: tenantsServiceMock,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of billing records', async () => {
      mockBillingModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBilling]),
      });

      const result = await service.findAll(tenantId);

      expect(result).toEqual([mockBilling]);
      expect(mockBillingModel.find).toHaveBeenCalledWith({
        tenantId: expect.any(Types.ObjectId),
      });
      const arg = mockBillingModel.find.mock.calls[0][0];
      expect(arg.tenantId.toString()).toBe(tenantId);
    });

    it('should throw BadRequestException for invalid tenantId', async () => {
      await expect(service.findAll('not-an-objectid')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException when database fails', async () => {
      mockBillingModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findAll(tenantId)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a billing record by id', async () => {
      mockBillingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBilling),
      });

      const result = await service.findOne(billingId, tenantId);

      expect(result).toEqual(mockBilling);
      expect(mockBillingModel.findOne).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        tenantId: expect.any(Types.ObjectId),
      });
      const arg = mockBillingModel.findOne.mock.calls[0][0];
      expect(arg._id.toString()).toBe(billingId);
      expect(arg.tenantId.toString()).toBe(tenantId);
    });

    it('should throw BadRequestException when id is invalid', async () => {
      await expect(service.findOne('123', tenantId)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when billing record not found', async () => {
      mockBillingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(billingId, tenantId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new billing record', async () => {
      const createBillingDto: any = { amount: 100, currency: 'USD', status: 'paid' };

      tenantsServiceMock.getTenantBillingEmail.mockResolvedValue('billing@tenant.test');
      billingNotificationsMock.sendInvoiceCreatedEmail.mockResolvedValue(undefined);

      const result = await service.create(createBillingDto, tenantId);

      expect(result).toBeDefined();
      expect(mockBillingModel).toHaveBeenCalledWith({
        ...createBillingDto,
        tenantId: expect.any(Types.ObjectId),
      });
      const arg = mockBillingModel.mock.calls[0][0];
      expect(arg.tenantId.toString()).toBe(tenantId);
      expect(billingNotificationsMock.sendInvoiceCreatedEmail).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a billing record', async () => {
      const updateBillingDto: any = { amount: 200 };

      mockBillingModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockBilling,
          ...updateBillingDto,
        }),
      });

      const result = await service.update(billingId, updateBillingDto, tenantId);

      expect(result).toBeDefined();
      expect(result?.amount).toBe(200);
      expect(mockBillingModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId), tenantId: expect.any(Types.ObjectId) },
        { $set: { ...updateBillingDto } },
        { new: true },
      );
      const arg = mockBillingModel.findOneAndUpdate.mock.calls[0][0];
      expect(arg._id.toString()).toBe(billingId);
      expect(arg.tenantId.toString()).toBe(tenantId);
    });

    it('should throw BadRequestException when tenantId is invalid', async () => {
      await expect(
        service.update(billingId, { amount: 200 } as any, 'invalid'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a billing record', async () => {
      mockBillingModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBilling),
      });

      const result = await service.remove(billingId, tenantId);

      expect(result).toBeDefined();
      expect(mockBillingModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        tenantId: expect.any(Types.ObjectId),
      });
      const arg = mockBillingModel.findOneAndDelete.mock.calls[0][0];
      expect(arg._id.toString()).toBe(billingId);
      expect(arg.tenantId.toString()).toBe(tenantId);
    });
  });
});
