import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from '../contrrollers/cart.controller';
import { CartService } from '../services/cart.service';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingCart, ShoppingCartItem, Product]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
