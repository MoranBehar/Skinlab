import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';
import { AddToCartDto } from '../DTO/cart/addToCart.dto';
import { UpdateCartItemDto } from '../DTO/cart/updateCartItem.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(ShoppingCart)
    private cartRepository: Repository<ShoppingCart>,
    @InjectRepository(ShoppingCartItem)
    private cartItemRepository: Repository<ShoppingCartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: number): Promise<ShoppingCart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.category',
      ],
    });

    if (!cart) {
      //  Creating new if doesnt exist
      cart = this.cartRepository.create({ user_id: userId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    let totalItems = 0;
    let subtotal = 0;

    if (cart.items) {
      cart.items.forEach((item) => {
        totalItems += item.quantity;
        const price = item.product.price;
        const discount = item.product.discount_percentage || 0;
        const finalPrice = price * (1 - discount / 100);
        subtotal += finalPrice * item.quantity;
      });
    }

    const taxPrecentage = 0.18;
    const totalMuliplier = 1 + taxPrecentage;

    return {
      cart,
      summary: {
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number((subtotal * taxPrecentage).toFixed(2)),
        total: Number((subtotal * totalMuliplier).toFixed(2)),
      },
    };
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { product_id, quantity } = addToCartDto;

    //  Cheack if product exist
    const product = await this.productRepository.findOne({
      where: { product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.is_available) {
      throw new BadRequestException('Product is not available');
    }

    const cart = await this.getOrCreateCart(userId);

    //  Ceack if product is in the cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        shopping_cart_id: cart.shopping_cart_id,
        product_id,
      },
    });

    if (cartItem) {
      //  Update quantity
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Adding new item
      cartItem = this.cartItemRepository.create({
        shopping_cart_id: cart.shopping_cart_id,
        product_id,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId);
  }

  // Update quantity of item in the cart
  async updateCartItem(
    userId: number,
    productId: number,
    updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        shopping_cart_id: cart.shopping_cart_id,
        product_id: productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    cartItem.quantity = updateDto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getCart(userId);
  }

  async removeFromCart(userId: number, productId: number) {
    const cart = await this.getOrCreateCart(userId);

    const result = await this.cartItemRepository.delete({
      shopping_cart_id: cart.shopping_cart_id,
      product_id: productId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    await this.cartItemRepository.delete({
      shopping_cart_id: cart.shopping_cart_id,
    });

    return { message: 'Cart cleared successfully' };
  }

  async getCartItemCount(userId: number): Promise<number> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items'],
    });

    if (!cart || !cart.items) {
      return 0;
    }

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}
