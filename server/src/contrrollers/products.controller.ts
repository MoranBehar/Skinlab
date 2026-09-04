import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../DTO/products/createProduct.dto';
import { UpdateProductDto } from '../DTO/products/updateProduct.dto';
import { FilterProductsDto } from '../DTO/products/filterProducts.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Getting all products with filters
  @Get()
  async findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAll(filterDto);
  }

  // Returns all categories, skin types, etc.
  @Get('filters/options')
  async getFilterOptions() {
    return this.productsService.getFilterOptions();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // -------- ADMIN ROUTES (ROLE_ID = 1) --------

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @UseInterceptors(FilesInterceptor('images', 5))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    return await this.productsService.createProduct(createProductDto, images);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return await this.productsService.updateProduct(
      id,
      updateProductDto,
      images,
    );
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.softDeleteProduct(id);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async getProductStats() {
    return await this.productsService.getProductStats();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async getAllProductsForAdmin(
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const include = includeDeleted === 'true';
    return await this.productsService.getAllProductsForAdmin(include);
  }
}
