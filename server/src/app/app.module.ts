import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import all modules
import { AuthModule } from '../modules/auth.module';
import { UsersModule } from '../modules/users.module';
import { ProductsModule } from '../modules/products.module';
import { CartModule } from '../modules/cart.module';
import { OrdersModule } from 'src/modules/orders.module';

// Import all entities
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
import { ShippingAddress } from '../entities/ShippingAddress.entity';
import { ProductCategory } from '../entities/productCategory.entity';
import { TargetAudience } from '../entities/targetAudience.entity';
import { SkinType } from '../entities/skinType.entity';
import { ProductType } from '../entities/productType.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { OrderStatus } from '../entities/orderStatus.entity';
import { ShippingType } from '../entities/shippingType.entity';
import { Order } from '../entities/order.entity';
import { OrderTracking } from '../entities/orderTracking.entity';
import { OrderItem } from 'src/entities/orderItem.entity';

@Module({
  imports: [
    //Managing environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    //Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          User,
          UserRole,
          ShippingAddress,
          ProductCategory,
          TargetAudience,
          SkinType,
          ProductType,
          Product,
          ProductImage,
          ShoppingCart,
          ShoppingCartItem,
          OrderStatus,
          ShippingType,
          Order,
          OrderTracking,
          OrderItem,
        ],
        synchronize: false,
        logging: true,
      }),
    }),

    //Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule {}
