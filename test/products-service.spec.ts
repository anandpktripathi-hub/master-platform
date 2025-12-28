import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../src/products/products.service';

describe('ProductsService - Tenant Isolation', () => {
  let service: ProductsService;
  let mockProductModel: Partial<Model<any>>;

  const mockTenant1Id = 'tenant-1-id';
  const mockTenant2Id = 'tenant-2-id';

  const mockProducts = [
    { _id: 'prod-1', name: 'Product 1', tenantId: mockTenant1Id, price: 100 },
    { _id: 'prod-2', name: 'Product 2', tenantId: mockTenant1Id, price: 200 },
    { _id: 'prod-3', name: 'Product 3', tenantId: mockTenant2Id, price: 300 },
  ];

  beforeEach(async () => {
    // Mock Mongoose Model
    const mockQuery: any = {
      exec: jest.fn(),
      lean: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
    };

    mockProductModel = {
      find: jest.fn().mockReturnValue(mockQuery),
      findOne: jest.fn().mockReturnValue(mockQuery),
      findById: jest.fn().mockReturnValue(mockQuery),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnValue(mockQuery),
      findByIdAndDelete: jest.fn().mockReturnValue(mockQuery),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken('Product'),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll with tenant isolation', () => {
    it('should only return products for specified tenant', async () => {
      const tenant1Products = mockProducts.filter(
        (p) => p.tenantId === mockTenant1Id,
      );

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(tenant1Products),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (mockProductModel.find as jest.Mock).mockReturnValue(mockQuery);
      (mockProductModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const productsResult: { products: Array<{ tenantId: string }> } =
        await service.findAll(mockTenant1Id);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        tenantId: mockTenant1Id,
      });
      expect(productsResult.products).toHaveLength(2);
      expect(
        productsResult.products.every((p) => p.tenantId === mockTenant1Id),
      ).toBe(true);
    });

    it('should not return products from other tenants', async () => {
      const tenant2Products = mockProducts.filter(
        (p) => p.tenantId === mockTenant2Id,
      );

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(tenant2Products),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (mockProductModel.find as jest.Mock).mockReturnValue(mockQuery);
      (mockProductModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const productsResult: { products: Array<{ tenantId: string }> } =
        await service.findAll(mockTenant2Id);

      expect(mockProductModel.find).toHaveBeenCalledWith({
        tenantId: mockTenant2Id,
      });
      expect(productsResult.products).not.toContainEqual(
        expect.objectContaining({ tenantId: mockTenant1Id }),
      );
    });

    it('should return empty array if tenant has no products', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue([]),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (mockProductModel.find as jest.Mock).mockReturnValue(mockQuery);
      (mockProductModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const productsResult: { products: Array<any> } = await service.findAll(
        'non-existent-tenant',
      );

      expect(productsResult.products).toEqual([]);
    });
  });

  describe('findOne with tenant isolation', () => {
    it('should find product only if it belongs to specified tenant', async () => {
      const product = mockProducts[0];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(product),
        lean: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };

      (mockProductModel.findOne as jest.Mock).mockReturnValue(mockQuery);

      const foundProduct: { tenantId: string } = await service.findById(
        'prod-1',
        mockTenant1Id,
      );

      expect(mockProductModel.findOne).toHaveBeenCalledWith({
        _id: 'prod-1',
        tenantId: mockTenant1Id,
      });
      expect(foundProduct).toEqual(product);
    });

    it('should not find product if it belongs to different tenant', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockReturnThis(),
      };

      (mockProductModel.findOne as jest.Mock).mockReturnValue(mockQuery);

      await expect(service.findById('prod-1', mockTenant2Id)).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('create with tenant assignment', () => {
    it('should automatically assign tenantId when creating product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'Test',
        price: 500,
        sku: 'TEST-001',
      };
      const createdProduct = {
        ...createDto,
        _id: 'new-prod-1',
        tenantId: mockTenant1Id,
      };

      (mockProductModel.create as jest.Mock).mockResolvedValue(createdProduct);

      const result = await service.create(createDto as any, mockTenant1Id);

      expect(mockProductModel.create).toHaveBeenCalledWith({
        ...createDto,
        tenantId: mockTenant1Id,
      });
      expect(result.tenantId).toBe(mockTenant1Id);
    });

    it('should not allow creating product without tenantId', async () => {
      const createDto = { name: 'New Product', price: 500 };

      await expect(
        service.create(createDto as any, null as any),
      ).rejects.toThrow();
    });
  });

  describe('update with tenant isolation', () => {
    it('should only update product if it belongs to tenant', async () => {
      const updateDto = { name: 'Updated Product' };
      const updatedProduct = { ...mockProducts[0], ...updateDto };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedProduct),
      };

      (mockProductModel.findByIdAndUpdate as jest.Mock).mockReturnValue(
        mockQuery,
      );

      await service.update('prod-1', updateDto as any, mockTenant1Id);

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining(updateDto),
        expect.any(Object),
      );
    });
  });

  describe('delete with tenant isolation', () => {
    it('should only delete product if it belongs to tenant', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockProducts[0]),
      };

      (mockProductModel.findByIdAndDelete as jest.Mock).mockReturnValue(
        mockQuery,
      );

      await service.remove('prod-1', mockTenant1Id);

      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith('prod-1');
    });

    it('should not delete product if tenantId verification fails', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      (mockProductModel.findByIdAndDelete as jest.Mock).mockReturnValue(
        mockQuery,
      );

      await expect(service.remove('prod-1', mockTenant2Id)).rejects.toThrow();
    });
  });
});
