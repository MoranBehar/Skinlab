import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { CreateProductDto } from '../DTO/products/createProduct.dto';
import { UpdateProductDto } from '../DTO/products/updateProduct.dto';
import { FilterProductsDto, SortBy } from '../DTO/products/filterProducts.dto';
import { S3Service } from './s3.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,

    private s3Service: S3Service,
  ) {}

  // -------- PUBLIC QUERIES (FILTERD BY IS_AVAILABLE = TRUE) --------

  // Getting all products with filters and sorting
  async findAll(filterDto: FilterProductsDto) {
    const {
      category_id,
      skin_type,
      target_audience,
      product_type,
      min_price,
      max_price,
      search,
      sort_by,
      page = 1,
      limit = 12,
    } = filterDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.skin_type_rel', 'skin_type_rel')
      .leftJoinAndSelect('product.target_audience_rel', 'target_audience_rel')
      .leftJoinAndSelect('product.product_type_rel', 'product_type_rel')
      .where('product.is_available = :is_available', { is_available: true });

    // Filter logic (category, skin type, target audience, product type, price range, search)
    if (category_id) {
      queryBuilder.andWhere('product.category_id = :category_id', {
        category_id,
      });
    }

    if (skin_type) {
      queryBuilder.andWhere('product.skin_type = :skin_type', { skin_type });
    }

    if (target_audience) {
      queryBuilder.andWhere('product.target_audience = :target_audience', {
        target_audience,
      });
    }

    if (product_type) {
      queryBuilder.andWhere('product.product_type = :product_type', {
        product_type,
      });
    }

    if (min_price !== undefined && max_price !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :min_price AND :max_price', {
        min_price,
        max_price,
      });
    } else if (min_price !== undefined) {
      queryBuilder.andWhere('product.price >= :min_price', { min_price });
    } else if (max_price !== undefined) {
      queryBuilder.andWhere('product.price <= :max_price', { max_price });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting logic
    switch (sort_by) {
      case SortBy.PRICE_ASC:
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case SortBy.PRICE_DESC:
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case SortBy.RATING_DESC:
        queryBuilder.orderBy('product.rating', 'DESC', 'NULLS LAST');
        break;
      case SortBy.NEWEST:
        queryBuilder.orderBy('product.creating_date', 'DESC');
        break;
      case SortBy.NAME_ASC:
        queryBuilder.orderBy('product.name', 'ASC');
        break;
      default:
        queryBuilder.orderBy('product.creating_date', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // execution query
    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { product_id: id },
      relations: [
        'images',
        'category',
        'skin_type_rel',
        'target_audience_rel',
        'product_type_rel',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  // GET /products/:id
  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.getProductById(id);

      if (!product.is_available) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      console.error('Failed to retrieve product: ', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        'Database error occurred while fetching product details',
      );
    }
  }

  // Getting all categories/skin types/etc. for filters
  private getDistinctFilter(relationName: string, id: string, name: string) {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoin(`product.${relationName}`, relationName)
      .distinct(true)
      .select(`${relationName}.${id}`, 'id')
      .addSelect(`${relationName}.${name}`, 'name')
      .getRawMany();
  }

  async getFilterOptions() {
    const [categories, skinTypes, targetAudiences, productTypes] =
      await Promise.all([
        this.getDistinctFilter('category', 'category_id', 'category_name'),
        this.getDistinctFilter(
          'skin_type_rel',
          'skin_type_id',
          'skin_type_name',
        ),
        this.getDistinctFilter(
          'target_audience_rel',
          'audience_id',
          'audience_name',
        ),
        this.getDistinctFilter(
          'product_type_rel',
          'product_type_id',
          'product_type_name',
        ),
      ]);

    return {
      categories,
      skinTypes,
      targetAudiences,
      productTypes,
    };
  }

  // -------- ADMIN CRUD --------

  private async uploadAndSaveImages(productId, images) {
    const uploadedImages = await Promise.all(
      images.map((file) => this.s3Service.uploadProductImage(productId, file)),
    );

    const productImageEntities = uploadedImages.map((url) =>
      this.productImagesRepository.create({
        product_id: productId,
        image_path: url,
      }),
    );

    await this.productImagesRepository.save(productImageEntities);
  }

  async createProduct(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<Product> {
    // Creating new product
    const product = this.productsRepository.create({
      ...createProductDto,
      is_available: true,
      creating_date: new Date(),
    });

    const savedProduct = await this.productsRepository.save(product);

    // upload to s3 and save in DB
    await this.uploadAndSaveImages(savedProduct.product_id, images);

    return await this.getProductById(savedProduct.product_id);
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    const product = await this.getProductById(id);

    // Update product data
    Object.assign(product, updateProductDto);
    product.updating_date = new Date();
    await this.productsRepository.save(product);

    // if there are new images - upload to s3 and save in DB
    if (images && images.length > 0) {
      await this.uploadAndSaveImages(id, images);
    }

    return await this.getProductById(id);
  }

  async softDeleteProduct(
    id: number,
  ): Promise<{ success: boolean; message: string; product_id: number }> {
    const product = await this.getProductById(id);

    // Soft delete - mark as unavailable
    product.is_available = false;
    product.deleting_date = new Date();
    await this.productsRepository.save(product);

    return {
      success: true,
      message: 'Product deleted successfully (soft delete)',
      product_id: id,
    };
  }

  async getProductStats() {
    const totalProducts = await this.productsRepository.count({
      where: { is_available: true },
    });

    const unavailableProducts = await this.productsRepository.count({
      where: { is_available: false },
    });

    const productsByCategory = await this.productsRepository
      .createQueryBuilder('product')
      .select('category.category_name', 'category')
      .addSelect('COUNT(product.product_id)', 'count')
      .leftJoin('product.category', 'category')
      .where('product.is_available = :available', { available: true })
      .groupBy('category.category_name')
      .getRawMany();

    return {
      totalProducts,
      unavailableProducts,
      productsByCategory,
    };
  }

  async getAllProductsForAdmin(includeDeleted: boolean = false) {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.target_audience_rel', 'targetAudience')
      .leftJoinAndSelect('product.skin_type_rel', 'skinType')
      .leftJoinAndSelect('product.product_type_rel', 'productType')
      .orderBy('product.creating_date', 'DESC');

    if (!includeDeleted) {
      queryBuilder.where('product.is_available = :available', {
        available: true,
      });
    }

    return await queryBuilder.getMany();
  }
}
