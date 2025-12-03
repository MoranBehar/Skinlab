import { 
    Controller, Get, Post, Put, Delete, Body, Param, Query,
    ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../DTO/products/createProduct.dto';
import { UpdateProductDto } from '../DTO/products/updateProduct.dto';
import { FilterProductsDto } from '../DTO/products/filterProducts.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { GetUser } from '../common/decorators/getUser.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /*
   * Getting all products with filters
   * GET /products?category_id=1&sort_by=price_asc&page=1&limit=12
   * 
   * Public - everyone can see
   */
  @Get()
  async findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAll(filterDto);
  }

  /**
   * Getting filter options
   * GET /products/filters/options
   * 
   * Returns all categories, skin types, etc.
   */
  @Get('filters/options')
  async getFilterOptions() {
    return this.productsService.getFilterOptions();
  }

  /**
   * Reciving a single product
   * GET /products/:id
   * 
   * Public
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * Creating a new product
   * POST /products
   * Headers: Authorization: Bearer <token>
   * 
   * Only for managers (role_id = 1)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser('role_id') roleId: number,
  ) {
    // Checking that the user is an admin
    if (roleId !== 1) {
      throw new BadRequestException('Only managers can create products');
    }

    return this.productsService.create(createProductDto);
  }

  /**
   * Update a product
   * PUT /products/:id
   * Headers: Authorization: Bearer <token>
   * 
   * Only for managers (role_id = 1)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser('role_id') roleId: number,
  ) {
    if (roleId !== 1) {
      throw new BadRequestException('Only managers can update products');
    }

    return this.productsService.update(id, updateProductDto);
  }

  /**
   *  Deleting a product
   * DELETE /products/:id
   * Headers: Authorization: Bearer <token>
   * 
   * Only for managers (role_id = 1)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('role_id') roleId: number,
  ) {
    if (roleId !== 1) {
      throw new BadRequestException('Only managers can delete products');
    }

    await this.productsService.remove(id);
    return { message: 'Product deleted successfully' };
  }

  /**
   * Upload an image for product
   * POST /products/:id/upload-image
   * Headers: Authorization: Bearer <token>
   * Body: multipart/form-data with 'file' field
   * 
   * Only for managers (role_id = 1)
   */
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('role_id') roleId: number,
  ) {
    if (roleId !== 1) {
      throw new BadRequestException('Only managers can upload images');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Checking file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Checking file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    return this.productsService.uploadImage(id, file);
  }
}