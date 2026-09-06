import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/userRole.entity';
import { ShippingAddress } from './entities/shippingAddress.entity';
import { ProductCategory } from './entities/productCategory.entity';
import { TargetAudience } from './entities/targetAudience.entity';
import { SkinType } from './entities/skinType.entity';
import { ProductType } from './entities/productType.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/productImage.entity';
import { ShoppingCart } from './entities/shoppingCart.entity';
import { ShoppingCartItem } from './entities/shoppingCartItem.entity';
import { OrderStatus } from './entities/orderStatus.entity';
import { ShippingType } from './entities/shippingType.entity';
import { Order } from './entities/order.entity';
import { OrderTracking } from './entities/orderTracking.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Message } from './entities/message.entity';

// DataSource for the TypeORM CLI (migration:generate/create/run/revert - see
// package.json scripts). The app itself connects via TypeOrmModule.forRootAsync
// in app.module.ts; this file exists only so the CLI has a plain DataSource to
// work with outside of Nest's DI container.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
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
    Message,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
