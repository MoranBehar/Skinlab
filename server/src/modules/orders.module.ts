import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from '../contrrollers/orders.controller';
import { OrdersService } from '../services/orders.service';
import { Order } from '../entities/order.entity';
import { OrderTracking } from '../entities/orderTracking.entity';
import { OrderStatus } from '../entities/orderStatus.entity';
import { ShippingType } from '../entities/shippingType.entity';
import { ShippingAddress } from '../entities/shippingAddress.entity';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { OrderItem } from 'src/entities/orderItem.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderTracking,
      OrderStatus,
      ShippingType,
      ShippingAddress,
      ShoppingCart,
      ShoppingCartItem,
      Product,
      ProductImage,
      OrderItem,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, RolesGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
