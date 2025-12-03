import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
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

    // Filter by category
    if (category_id) {
      queryBuilder.andWhere('product.category_id = :category_id', { category_id });
    }

    // Filter by skin type
    if (skin_type) {
      queryBuilder.andWhere('product.skin_type = :skin_type', { skin_type });
    }

    // Filter by target audience
    if (target_audience) {
      queryBuilder.andWhere('product.target_audience = :target_audience', { target_audience });
    }

    // Filter by product type
    if (product_type) {
      queryBuilder.andWhere('product.product_type = :product_type', { product_type });
    }

    // Filter by price range
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

    // Search by name and description
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
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


  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { product_id: id },
      relations: ['images', 'category', 'skin_type_rel', 'target_audience_rel', 'product_type_rel'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      creating_date: new Date(),
    });

    return await this.productsRepository.save(product);
  }

 
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    product.updating_date = new Date();

    return await this.productsRepository.save(product);
  }


  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    
    // deleting photos from s3
    await this.s3Service.deleteProductImage(id);

    // Soft delete
    product.deleting_date = new Date();
    product.is_available = false;
    await this.productsRepository.save(product);
  }


  async uploadImage(productId: number, file: Express.Multer.File): Promise<ProductImage> {
    const product = await this.findOne(productId);

    // upload to S3
    const imageUrl = await this.s3Service.uploadProductImage(productId, file);

    // save in db
    const productImage = this.productImagesRepository.create({
      product_id: productId,
      image_path: imageUrl,
    });

    return await this.productImagesRepository.save(productImage);
  }

  // Getting all categories/skin types/etc. for filters
  async getFilterOptions() {
    const [categories, skinTypes, targetAudiences, productTypes] = await Promise.all([
      this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .select('DISTINCT category.category_id', 'id')
        .addSelect('category.category_name', 'name')
        .getRawMany(),
      
      this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.skin_type_rel', 'skin_type')
        .select('DISTINCT skin_type.skin_type_id', 'id')
        .addSelect('skin_type.skin_type_name', 'name')
        .getRawMany(),
      
      this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.target_audience_rel', 'target_audience')
        .select('DISTINCT target_audience.audience_id', 'id')
        .addSelect('target_audience.audience_name', 'name')
        .getRawMany(),
      
      this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.product_type_rel', 'product_type')
        .select('DISTINCT product_type.product_type_id', 'id')
        .addSelect('product_type.product_type_name', 'name')
        .getRawMany(),
    ]);

    return {
      categories,
      skinTypes,
      targetAudiences,
      productTypes,
    };
  }
}