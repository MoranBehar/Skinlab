import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from '../contrrollers/products.controller';
import { ProductsService } from '../services/products.service';
import { S3Service } from '../services/s3.service';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { TargetAudience } from '../entities/targetAudience.entity';
import { SkinType } from '../entities/skinType.entity';
import { ProductType } from '../entities/productType.entity';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      ProductCategory,
      TargetAudience,
      SkinType,
      ProductType,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, S3Service, RolesGuard],
  exports: [ProductsService, S3Service],
})
export class ProductsModule {}
