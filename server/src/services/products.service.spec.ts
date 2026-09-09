import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { S3Service } from './s3.service';
import { SortBy } from '../DTO/products/filterProducts.dto';
import { CreateProductDto } from '../DTO/products/createProduct.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    count: jest.Mock;
  };
  let productImagesRepository: { create: jest.Mock; save: jest.Mock };
  let s3Service: { uploadProductImage: jest.Mock };
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    leftJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    distinct: jest.Mock;
    select: jest.Mock;
    addSelect: jest.Mock;
    groupBy: jest.Mock;
    getManyAndCount: jest.Mock;
    getRawMany: jest.Mock;
    getMany: jest.Mock;
  };

  const availableProduct = {
    product_id: 1,
    name: 'Serum',
    is_available: true,
    discount_percentage: 0,
  } as unknown as Product;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getRawMany: jest.fn().mockResolvedValue([]),
      getMany: jest.fn().mockResolvedValue([]),
    };

    productsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };
    productImagesRepository = { create: jest.fn(), save: jest.fn() };
    s3Service = { uploadProductImage: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productsRepository },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: productImagesRepository,
        },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findAll', () => {
    it('only applies the filters that were actually provided', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[availableProduct], 1]);

      await service.findAll({ category_id: 1111, page: 1, limit: 12 });

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'product.is_available = :is_available',
        { is_available: true },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'product.category_id = :category_id',
        { category_id: 1111 },
      );
      // Filters that weren't passed shouldn't produce extra andWhere calls
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
    });

    it('sorts by price ascending when requested', async () => {
      await service.findAll({
        sort_by: SortBy.PRICE_ASC,
        page: 1,
        limit: 12,
      });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('product.price', 'ASC');
    });

    it('computes pagination from the total count and page size', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[availableProduct], 25]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });

  describe('getProductById', () => {
    it('returns the product when found', async () => {
      productsRepository.findOne.mockResolvedValue(availableProduct);

      const result = await service.getProductById(1);

      expect(result).toEqual(availableProduct);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(service.getProductById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('returns an available product', async () => {
      productsRepository.findOne.mockResolvedValue(availableProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(availableProduct);
    });

    it('throws NotFoundException for a soft-deleted (unavailable) product', async () => {
      productsRepository.findOne.mockResolvedValue({
        ...availableProduct,
        is_available: false,
      });

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('wraps an unexpected repository failure in BadRequestException', async () => {
      productsRepository.findOne.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(service.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createProduct', () => {
    it('creates the product, uploads images, and returns the saved product', async () => {
      const dto = { name: 'New Product' } as unknown as CreateProductDto;
      const created: Partial<Product> = { ...dto };
      productsRepository.create.mockReturnValue(created);
      productsRepository.save.mockResolvedValue({
        ...created,
        product_id: 5,
      });
      s3Service.uploadProductImage.mockResolvedValue('https://s3/image.jpg');
      productImagesRepository.create.mockImplementation(
        (data: unknown) => data,
      );
      productImagesRepository.save.mockResolvedValue(undefined);
      productsRepository.findOne.mockResolvedValue({
        ...created,
        product_id: 5,
      });

      const file = { originalname: 'image.jpg' } as Express.Multer.File;
      const result = await service.createProduct(dto, [file]);

      expect(productsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Product', is_available: true }),
      );
      expect(s3Service.uploadProductImage).toHaveBeenCalledWith(5, file);
      expect(productImagesRepository.save).toHaveBeenCalledWith([
        { product_id: 5, image_path: 'https://s3/image.jpg' },
      ]);
      expect(result.product_id).toBe(5);
    });
  });

  describe('softDeleteProduct', () => {
    it('marks the product unavailable instead of removing it', async () => {
      const product = { ...availableProduct };
      productsRepository.findOne.mockResolvedValue(product);
      productsRepository.save.mockImplementation((p: unknown) =>
        Promise.resolve(p),
      );

      const result = await service.softDeleteProduct(1);

      expect(product.is_available).toBe(false);
      expect(productsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_available: false }),
      );
      expect(result).toEqual({
        success: true,
        message: 'Product deleted successfully (soft delete)',
        product_id: 1,
      });
    });
  });
});
