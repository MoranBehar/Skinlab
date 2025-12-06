import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderTracking } from '../entities/orderTracking.entity';
import { OrderStatus } from '../entities/orderStatus.entity';
import { ShippingType } from '../entities/shippingType.entity';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { ShippingAddress } from '../entities/shippingAddress.entity';
import { CreateOrderDto } from '../DTO/orders/createOrder.dto';
import { UpdateOrderStatusDto } from '../DTO/orders/updateOrderStatus.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderTracking)
    private orderTrackingRepository: Repository<OrderTracking>,
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(ShippingType)
    private shippingTypeRepository: Repository<ShippingType>,
    @InjectRepository(ShoppingCart)
    private shoppingCartRepository: Repository<ShoppingCart>,
    @InjectRepository(ShoppingCartItem)
    private cartItemsRepository: Repository<ShoppingCartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ShippingAddress)
    private shippingAddressRepository: Repository<ShippingAddress>,
  ) {}

  // Create a new order from user's shopping cart
  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    // Find user's shopping cart
    const cart = await this.shoppingCartRepository.findOne({
      where: { user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException('Shopping cart not found');
    }

    // Get cart items with product details
    const cartItems = await this.cartItemsRepository.find({
      where: { shopping_cart_id: cart.shopping_cart_id },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cannot create order with empty cart');
    }

    // Calculate total price and validate products
    let totalPrice = 0;
    for (const item of cartItems) {
      const product = await this.productsRepository.findOne({
        where: { product_id: item.product_id },
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.product_id} not found`);
      }

      if (!product.is_available) {
        throw new BadRequestException(`Product ${product.name} is not available`);
      }

      totalPrice += Number(product.price) * item.quantity;
    }

    // Verify shipping type exists
    const shippingType = await this.shippingTypeRepository.findOne({
      where: { type_id: createOrderDto.shipping_type_id },
    });

    if (!shippingType) {
      throw new BadRequestException('Invalid shipping type');
    }

    // Verify shipping address if provided
    if (createOrderDto.shipping_address_id) {
      const address = await this.shippingAddressRepository.findOne({
        where: { 
          address_id: createOrderDto.shipping_address_id,
          user_id: userId 
        },
      });

      if (!address) {
        throw new BadRequestException('Invalid shipping address');
      }
    }

    // Create order with 'shipped' status (status_id = 1)
    const order = this.ordersRepository.create({
      user_id: userId,
      status_id: 1,
      date_placed: new Date(),
      price: totalPrice,
      shopping_cart_id: cart.shopping_cart_id,
      shipping_type_id: createOrderDto.shipping_type_id,
      credit_card_brand: createOrderDto.credit_card_brand,
      credit_card_last_four_digits: createOrderDto.credit_card_last_four_digits,
      shipping_address_id: createOrderDto.shipping_address_id,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create initial order tracking entry
    const tracking = this.orderTrackingRepository.create({
      order_id: savedOrder.order_id,
      status_id: 1,
      date: new Date(),
      comments: 'Order placed successfully',
    });

    await this.orderTrackingRepository.save(tracking);

    // Clear the shopping cart
    await this.cartItemsRepository.delete({
      shopping_cart_id: cart.shopping_cart_id,
    });

    // Return the created order with full details
    return this.getOrderById(savedOrder.order_id, userId);
  }

  
  async getUserOrders(userId: number) {
    const orders = await this.ordersRepository.find({
      where: { user_id: userId },
      order: { date_placed: 'DESC' },
    });

    // Build response with all order details
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        return this.buildOrderResponse(order);
      })
    );

    return ordersWithDetails;
  }


  async getOrderById(orderId: number, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: { 
        order_id: orderId,
        user_id: userId 
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.buildOrderResponse(order);
  }

  
  async getOrderTracking(orderId: number, userId: number) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOne({
      where: { 
        order_id: orderId,
        user_id: userId 
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get tracking history
    const trackingHistory = await this.orderTrackingRepository.find({
      where: { order_id: orderId },
      order: { date: 'ASC' },
    });

    // Build response with status names
    const trackingWithDetails = await Promise.all(
      trackingHistory.map(async (track) => {
        const status = await this.orderStatusRepository.findOne({
          where: { status_id: track.status_id },
        });

        return {
          order_id: track.order_id,
          status_id: track.status_id,
          status_name: status?.status_name || 'unknown',
          date: track.date,
          comments: track.comments,
        };
      })
    );

    return trackingWithDetails;
  }

  
  async updateOrderStatus(
    orderId: number,
    userId: number,
    updateStatusDto: UpdateOrderStatusDto
  ) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOne({
      where: { 
        order_id: orderId,
        user_id: userId 
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify status exists
    const status = await this.orderStatusRepository.findOne({
      where: { status_id: updateStatusDto.status_id },
    });

    if (!status) {
      throw new BadRequestException('Invalid status');
    }

    // Update order status
    order.status_id = updateStatusDto.status_id;
    await this.ordersRepository.save(order);

    // Create tracking entry
    const tracking = this.orderTrackingRepository.create({
      order_id: orderId,
      status_id: updateStatusDto.status_id,
      date: new Date(),
      comments: updateStatusDto.comments || `Status updated to ${status.status_name}`,
    });

    await this.orderTrackingRepository.save(tracking);

    // Return updated order
    return this.getOrderById(orderId, userId);
  }


  // Build complete order response with all related data
  private async buildOrderResponse(order: Order) {
    // Get order status
    const status = await this.orderStatusRepository.findOne({
      where: { status_id: order.status_id },
    });

    // Get shipping type
    const shippingType = await this.shippingTypeRepository.findOne({
      where: { type_id: order.shipping_type_id },
    });

    // Get shipping address if exists
    let shippingAddress: ShippingAddress | null = null;
    if (order.shipping_address_id) {
      shippingAddress = await this.shippingAddressRepository.findOne({
        where: { address_id: order.shipping_address_id },
      });
    }

    // Get cart items
    const cartItems = await this.cartItemsRepository.find({
      where: { shopping_cart_id: order.shopping_cart_id },
    });

    // Build items array with product details
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await this.productsRepository.findOne({
          where: { product_id: item.product_id },
        });

        const image = await this.productImagesRepository.findOne({
          where: { product_id: item.product_id },
        });

        return {
          product_id: item.product_id,
          product_name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: Number(product?.price || 0),
          image_path: image?.image_path,
        };
      })
    );

    return {
      order_id: order.order_id,
      user_id: order.user_id,
      status_id: order.status_id,
      status_name: status?.status_name || 'unknown',
      date_placed: order.date_placed,
      price: Number(order.price),
      shipping_type_id: order.shipping_type_id,
      shipping_type_name: shippingType?.type_name || 'unknown',
      credit_card_brand: order.credit_card_brand,
      credit_card_last_four_digits: order.credit_card_last_four_digits,
      shipping_address: shippingAddress ? {
        address_id: shippingAddress.address_id,
        address: shippingAddress.address,
        apartment_number: shippingAddress.apartment_number,
        floor_number: shippingAddress.floor_number,
        city: shippingAddress.city,
        phone_number: shippingAddress.phone_number,
        comments: shippingAddress.comments,
      } : null,
      items,
    };
  }
}