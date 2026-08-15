import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../DTO/cart/addToCart.dto';
import { UpdateCartItemDto } from '../DTO/cart/updateCartItem.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { GetUser } from '../common/decorators/getUser.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /cart
  @Get()
  async getCart(@GetUser('user_id') userId: number) {
    return this.cartService.getCart(userId);
  }

  // GET /cart/count
  @Get('count')
  async getCartCount(@GetUser('user_id') userId: number) {
    const count = await this.cartService.getCartItemCount(userId);
    return { count };
  }

  /**
   * POST /cart
   * Body: { product_id: number, quantity: number }
   */
  @Post()
  async addToCart(
    @GetUser('user_id') userId: number,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  /**
   * PUT /cart/:productId
   * Body: { quantity: number }
   */
  @Put(':productId')
  async updateCartItem(
    @GetUser('user_id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, productId, updateDto);
  }

  /**
   * DELETE /cart/:productId
   */
  @Delete(':productId')
  async removeFromCart(
    @GetUser('user_id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  /**
   * DELETE /cart
   */
  @Delete()
  async clearCart(@GetUser('user_id') userId: number) {
    return this.cartService.clearCart(userId);
  }
}
