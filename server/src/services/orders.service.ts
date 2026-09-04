import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, SelectQueryBuilder, In } from 'typeorm';

// entities
import { Order } from '../entities/order.entity';
import { OrderTracking } from '../entities/orderTracking.entity';
import { OrderStatus } from '../entities/orderStatus.entity';
import { ShippingType } from '../entities/shippingType.entity';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { ShippingAddress } from '../entities/ShippingAddress.entity';
import { OrderItem } from 'src/entities/orderItem.entity';

// DTO
import { CreateOrderDto } from '../DTO/orders/createOrder.dto';
import { UpdateOrderStatusDto } from '../DTO/orders/updateOrderStatus.dto';

type OrderItemType = {
  product_id: number;
  quantity: number;
  price_at_purchase: number;
};

interface AdminOrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

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
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  // --- USER CRUD ---

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { shipping_type_id, shipping_address, ...orderData } = createOrderDto;

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

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cannot create order with empty cart');
    }

    // load all needed products + their images
    const productIds = cartItems.map((cartItem) => cartItem.product_id);
    const products = await this.productsRepository.find({
      where: { product_id: In(productIds) },
      relations: ['images'],
    });

    const productMap = new Map<number, Product>();
    products.forEach((p) => productMap.set(Number(p.product_id), p));

    // Calculate total price and validate products
    let totalPrice = 0;
    const orderItemsPayload: OrderItemType[] = [];

    for (const item of cartItems) {
      const product = productMap.get(Number(item.product_id));

      if (!product) {
        throw new BadRequestException(`Product ${item.product_id} not found`);
      }

      if (!product.is_available) {
        throw new BadRequestException(
          `Product ${product.name} is not available`,
        );
      }

      const discountFactor = (product.discount_percentage || 0) / 100;
      const finalProductPrice = Number(product.price) * (1 - discountFactor);
      totalPrice += finalProductPrice * Number(item.quantity);

      orderItemsPayload.push({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        price_at_purchase: finalProductPrice,
      });
    }

    // Verify shipping type exists
    const shippingType = await this.shippingTypeRepository.findOne({
      where: { type_id: createOrderDto.shipping_type_id },
    });

    if (!shippingType) {
      throw new BadRequestException('Invalid shipping type');
    }

    let shippingAddressId: number | null = null;
    const homeDelivery = 1;

    if (Number(shippingType.type_id) === homeDelivery) {
      if (!shipping_address) {
        throw new BadRequestException(
          'Shipping address is required for home delivery',
        );
      }

      console.log('shipping_address DTO:', shipping_address);

      // Create new shipping address
      const newAddress = this.shippingAddressRepository.create({
        user_id: userId,
        address: shipping_address.address,
        apartment_number: shipping_address.apartment_number,
        floor_number: shipping_address.floor_number,
        city: shipping_address.city,
        phone_number: shipping_address.phone_number,
        comments: shipping_address.comments ?? undefined,
      });

      console.log('newAddress:', newAddress);

      const savedAddress =
        await this.shippingAddressRepository.save(newAddress);
      shippingAddressId = savedAddress.address_id;

      console.log('Shipping Address ID:', shippingAddressId);
    }

    // Create order with 'shipped' status (status_id = 1)
    const order = this.ordersRepository.create({
      user: { user_id: userId },
      status_id: 1,
      date_placed: new Date(),
      price: totalPrice,
      shopping_cart_id: cart.shopping_cart_id,
      shipping_type_id: createOrderDto.shipping_type_id,
      credit_card_brand: createOrderDto.credit_card_brand,
      credit_card_last_four_digits: createOrderDto.credit_card_last_four_digits,
      shipping_address_id: shippingAddressId ?? undefined,
    });

    const savedOrder = await this.ordersRepository.save(order);

    const saveOrderItems = orderItemsPayload.map((itemData) => {
      const orderItem = this.orderItemsRepository.create({
        order_id: savedOrder.order_id,
        product_id: itemData.product_id,
        quantity: itemData.quantity,
        price_at_purchase: itemData.price_at_purchase,
      });

      return this.orderItemsRepository.save(orderItem);
    });

    await Promise.all(saveOrderItems);

    // Create initial order tracking entry
    const tracking = this.orderTrackingRepository.create({
      order_id: savedOrder.order_id,
      status_id: 1,
      date: new Date(),
      comments: 'Order placed successfully',
    });

    await this.orderTrackingRepository.save(tracking);

    // Clear the shopping cart
    const deleteResult = await this.cartItemsRepository.delete({
      shopping_cart_id: cart.shopping_cart_id,
    });

    console.log(
      `[orderService] cart id ${cart.shopping_cart_id} cleard. affected rows: ${deleteResult.affected}`,
    );

    // Return the created order with full details
    return this.getOrderById(savedOrder.order_id, userId);
  }

  async getUserOrders(userId: number) {
    const orders = await this.ordersRepository.find({
      where: { user_id: userId },
      relations: [
        'status',
        'shipping_type',
        'shipping_address',
        'items',
        'items.product',
        'items.product.images',
      ],
      order: { date_placed: 'DESC' },
    });

    // Build response with all order details
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        return this.buildOrderResponse(order);
      }),
    );

    return ordersWithDetails;
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: {
        order_id: orderId,
        user_id: userId,
      },
      relations: [
        'status',
        'shipping_type',
        'shipping_address',
        'items',
        'items.product',
        'items.product.images',
      ],
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
        user_id: userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get tracking history
    const trackingHistory = await this.orderTrackingRepository.find({
      where: { order_id: orderId },
      relations: ['status'],
      order: { date: 'ASC' },
    });

    return trackingHistory.map((track) => ({
      order_id: track.order_id,
      status_id: track.status_id,
      status_name: track.status?.status_name || 'unknown',
      date: track.date,
      comments: track.comments,
    }));
  }

  async updateOrderStatus(
    orderId: number,
    userId: number,
    updateStatusDto: UpdateOrderStatusDto,
  ) {
    // Verify order belongs to user
    const order = await this.ordersRepository.findOne({
      where: {
        order_id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Making shure the status change for user is canelation only
    const cancelledStatus = await this.orderStatusRepository.findOne({
      where: { status_name: 'canceled' },
    });

    if (!cancelledStatus) {
      throw new BadRequestException(
        'Cancelled status definition is missing from the database',
      );
    }

    if (updateStatusDto.status_id !== cancelledStatus.status_id) {
      throw new BadRequestException(
        'Unauthorized action. Users can only cancel their orders',
      );
    }

    const shippedStatus = await this.orderStatusRepository.findOne({
      where: { status_name: 'shipped' },
    });

    if (!shippedStatus) {
      throw new BadRequestException(
        'Shipped status definition is missing from the database',
      );
    }

    if (order.status_id > shippedStatus.status_id) {
      throw new BadRequestException(
        'Order cannot be cancelled once it has been arrived',
      );
    }

    // Return updated order
    return this.updateOrderStatusCore(orderId, updateStatusDto);
  }

  // Build complete order response with all related data
  private buildOrderResponse(order: Order) {
    const items = (order.items || []).map((item) => {
      const product = (item as any).product as Product | undefined;

      // choose first image_path if exists
      const image_path =
        product?.images && product.images.length > 0
          ? product.images[0].image_path
          : null;

      return {
        product_id: item.product_id,
        product_name: product?.name || 'Unknown Product',
        quantity: Number(item.quantity),
        price: Number(item.price_at_purchase || product?.price || 0),
        image_path,
      };
    });

    return {
      order_id: order.order_id,
      user: order.user
        ? {
            user_id: order.user.user_id,
            full_name: order.user.full_name,
            email: order.user.email,
            role_id: order.user.role_id,
          }
        : null,
      status: order.status
        ? {
            status_id: order.status.status_id,
            status_name: order.status.status_name,
          }
        : null,
      date_placed: order.date_placed,
      price: Number(order.price),
      shipping_type: order.shipping_type
        ? {
            shipping_type_id: order.shipping_type.type_id,
            shipping_type_name: order.shipping_type.type_name,
          }
        : null,
      credit_card_brand: order.credit_card_brand,
      credit_card_last_four_digits: order.credit_card_last_four_digits,
      shipping_address: order.shipping_address
        ? {
            address_id: order.shipping_address.address_id,
            address: order.shipping_address.address,
            apartment_number: order.shipping_address.apartment_number,
            floor_number: order.shipping_address.floor_number,
            city: order.shipping_address.city,
            phone_number: order.shipping_address.phone_number,
            comments: order.shipping_address.comments,
          }
        : null,
      items,
    };
  }

  // ----- ADMIN FUNCTIONS -----

  private async updateOrderStatusCore(
    orderId: number,
    updateStatusDto: UpdateOrderStatusDto,
  ) {
    // Verify status exists
    const status = await this.orderStatusRepository.findOne({
      where: { status_id: updateStatusDto.status_id },
    });

    if (!status) {
      throw new BadRequestException('Invalid status');
    }

    // Update order status
    await this.ordersRepository.update(orderId, {
      status_id: updateStatusDto.status_id,
    });

    // Create tracking entry
    const tracking = this.orderTrackingRepository.create({
      order_id: orderId,
      status_id: updateStatusDto.status_id,
      date: new Date(),
      comments:
        updateStatusDto.comments || `Status updated to ${status.status_name}`,
    });

    await this.orderTrackingRepository.save(tracking);

    return this.getOrderByIdForAdmin(orderId);
  }

  async updateOrderStatusAdmin(
    orderId: number,
    updateStatusDto: UpdateOrderStatusDto,
  ) {
    const exists = await this.ordersRepository.exists({
      where: { order_id: orderId },
    });
    if (!exists) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.updateOrderStatusCore(orderId, updateStatusDto);
  }

  async getOrderByIdForAdmin(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { order_id: id },
      relations: [
        'user',
        'status',
        'shipping_address',
        'shipping_type',
        'items',
        'items.product',
        'items.product.images',
        'tracking',
        'tracking.status',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    //  Get tracking history
    const orderResponse = this.buildOrderResponse(order);
    const tracking = (order.tracking || []).map((t) => ({
      order_id: t.order_id,
      status_id: t.status_id,
      status_name: (t.status && (t.status as any).status_name) || 'unknown',
      date: t.date,
      comments: t.comments,
    }));

    return { orderResponse, tracking };
  }

  async getAllOrdersForAdmin(filters: AdminOrderFilters) {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.status', 'status')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('order.shipping_address', 'address')
      .leftJoinAndSelect('order.shipping_type', 'shippingType')
      .orderBy('order.date_placed', 'DESC');

    if (filters.status) {
      queryBuilder.andWhere('status.status_name = :status', {
        status: filters.status,
      });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere(
        'order.date_placed BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(filters.startDate),
          endDate: new Date(filters.endDate),
        },
      );
    }

    const orders = await queryBuilder.getMany();
    const result = orders.map((order) => this.buildOrderResponse(order));
    return result;
  }

  async getRecentOrders(limit: number) {
    const orders = await this.ordersRepository.find({
      relations: [
        'user',
        'status',
        'items',
        'items.product',
        'items.product.images',
      ],
      order: { date_placed: 'DESC' },
      take: limit,
    });
    return orders.map((order) => this.buildOrderResponse(order));
  }

  async getOrderStats() {
    const totalOrders = await this.ordersRepository.count();

    const ordersByStatus = await this.ordersRepository
      .createQueryBuilder('order')
      .select('status.status_name', 'status')
      .addSelect('COUNT(order.order_id)', 'count')
      .leftJoin('order.status', 'status')
      .groupBy('status.status_name')
      .getRawMany();

    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.price)', 'total')
      .getRawOne();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await this.ordersRepository.count({
      where: {
        date_placed: Between(today, new Date()),
      },
    });

    const todayRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.price)', 'total')
      .where('order.date_placed >= :today', { today })
      .getRawOne();

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue: parseFloat(totalRevenue?.total) || 0,
      todayOrders,
      todayRevenue: parseFloat(todayRevenue?.total) || 0,
    };
  }

  async getRevenueStats(period: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    let dateInterval: string;

    switch (period) {
      case 'day':
        dateInterval = 'hour';
        break;
      case 'week':
        dateInterval = 'day';
        break;
      case 'month':
        dateInterval = 'day';
        break;
      case 'year':
        dateInterval = 'month';
        break;
      default:
        dateInterval = 'day';
    }

    const startOfPeriod = new Date();
    startOfPeriod.setHours(0, 0, 0, 0);

    if (period === 'week') {
      startOfPeriod.setDate(startOfPeriod.getDate() - 7);
    } else if (period === 'month') {
      startOfPeriod.setMonth(startOfPeriod.getMonth() - 1);
    } else if (period === 'year') {
      startOfPeriod.setFullYear(startOfPeriod.getFullYear() - 1);
    }

    const revenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select(`DATE_TRUNC('${dateInterval}', order.date_placed)`, 'date')
      .addSelect('SUM(order.price)', 'revenue')
      .addSelect('COUNT(order.order_id)', 'orders')
      .where('order.date_placed >= :startDate', { startDate: startOfPeriod })
      .groupBy(`DATE_TRUNC('${dateInterval}', order.date_placed)`)
      .orderBy(`DATE_TRUNC('${dateInterval}', order.date_placed)`, 'ASC')
      .getRawMany();

    return revenue;
  }
}
