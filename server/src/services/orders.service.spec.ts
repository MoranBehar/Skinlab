import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderTracking } from '../entities/orderTracking.entity';
import { OrderStatus } from '../entities/orderStatus.entity';
import { ShippingType } from '../entities/shippingType.entity';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/productImage.entity';
import { ShippingAddress } from '../entities/shippingAddress.entity';
import { OrderItem } from '../entities/orderItem.entity';
import { CreateOrderDto } from '../DTO/orders/createOrder.dto';
import { UpdateOrderStatusDto } from '../DTO/orders/updateOrderStatus.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  let ordersRepository: { findOne: jest.Mock };
  let orderStatusRepository: { findOne: jest.Mock };
  let shippingTypeRepository: { findOne: jest.Mock };
  let shoppingCartRepository: { findOne: jest.Mock };
  let cartItemsRepository: { find: jest.Mock };
  let productsRepository: { find: jest.Mock };

  // Fake EntityManager used inside dataSource.transaction(cb) - `save` and
  // `create` are entity-class-aware so createOrder's sequence of
  // manager.save(Order, ...) / manager.save(OrderItem, ...) / etc. each get
  // something usable back, the same way real TypeORM would.
  let manager: {
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let stockUpdateQueryBuilder: {
    update: jest.Mock;
    set: jest.Mock;
    where: jest.Mock;
    execute: jest.Mock;
  };
  let dataSource: { transaction: jest.Mock };
  let getOrderByIdSpy: jest.SpiedFunction<OrdersService['getOrderById']>;

  const cart = { shopping_cart_id: 10, user_id: 1 };
  const cartItem = { shopping_cart_id: 10, product_id: 5, quantity: 2 };
  const availableProduct = {
    product_id: 5,
    name: 'Serum',
    price: 100,
    discount_percentage: 0,
    is_available: true,
    images: [],
  } as unknown as Product;
  const homeDeliveryType = { type_id: 1 };

  const validOrderDto: CreateOrderDto = {
    shipping_type_id: 1,
    credit_card_brand: 'visa',
    credit_card_last_four_digits: '1234',
    shipping_address: {
      address: 'Main St 1',
      apartment_number: 2,
      floor_number: 3,
      city: 'Tel Aviv',
      phone_number: '0500000000',
    },
  };

  beforeEach(async () => {
    ordersRepository = { findOne: jest.fn() };
    orderStatusRepository = { findOne: jest.fn() };
    shippingTypeRepository = { findOne: jest.fn() };
    shoppingCartRepository = { findOne: jest.fn() };
    cartItemsRepository = { find: jest.fn() };
    productsRepository = { find: jest.fn() };

    stockUpdateQueryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    manager = {
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn((entity: unknown, data: unknown) => {
        if (entity === Order) {
          return Promise.resolve({ ...(data as object), order_id: 100 });
        }
        return Promise.resolve(data);
      }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn().mockReturnValue(stockUpdateQueryBuilder),
    };

    dataSource = {
      transaction: jest.fn((cb: (manager: unknown) => unknown) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        {
          provide: getRepositoryToken(OrderTracking),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(OrderStatus),
          useValue: orderStatusRepository,
        },
        {
          provide: getRepositoryToken(ShippingType),
          useValue: shippingTypeRepository,
        },
        {
          provide: getRepositoryToken(ShoppingCart),
          useValue: shoppingCartRepository,
        },
        {
          provide: getRepositoryToken(ShoppingCartItem),
          useValue: cartItemsRepository,
        },
        { provide: getRepositoryToken(Product), useValue: productsRepository },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(ShippingAddress),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    shoppingCartRepository.findOne.mockResolvedValue(cart);
    cartItemsRepository.find.mockResolvedValue([cartItem]);
    productsRepository.find.mockResolvedValue([availableProduct]);
    shippingTypeRepository.findOne.mockResolvedValue(homeDeliveryType);
    getOrderByIdSpy = jest
      .spyOn(service, 'getOrderById')
      .mockResolvedValue({ order_id: 100 } as unknown as Awaited<
        ReturnType<typeof service.getOrderById>
      >);
  });

  describe('createOrder', () => {
    it('creates the order inside a transaction and clears the cart', async () => {
      const result = await service.createOrder(1, validOrderDto);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(
        Order,
        expect.objectContaining({ status_id: 1, shopping_cart_id: 10 }),
      );
      expect(manager.delete).toHaveBeenCalledWith(ShoppingCartItem, {
        shopping_cart_id: 10,
      });
      expect(getOrderByIdSpy).toHaveBeenCalledWith(100, 1);
      expect(result).toEqual({ order_id: 100 });
    });

    it('decrements stock with a guard against overselling', async () => {
      await service.createOrder(1, validOrderDto);

      expect(stockUpdateQueryBuilder.where).toHaveBeenCalledWith(
        'product_id = :id AND stock_quantity >= :qty',
        { id: 5, qty: 2 },
      );
    });

    it('throws NotFoundException when the user has no shopping cart', async () => {
      shoppingCartRepository.findOne.mockResolvedValue(null);

      await expect(service.createOrder(1, validOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the cart is empty', async () => {
      cartItemsRepository.find.mockResolvedValue([]);

      await expect(service.createOrder(1, validOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when a cart item is no longer available', async () => {
      productsRepository.find.mockResolvedValue([
        { ...availableProduct, is_available: false },
      ]);

      await expect(service.createOrder(1, validOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for an unknown shipping type', async () => {
      shippingTypeRepository.findOne.mockResolvedValue(null);

      await expect(service.createOrder(1, validOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when home delivery has no shipping address', async () => {
      await expect(
        service.createOrder(1, {
          ...validOrderDto,
          shipping_address: undefined,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('rolls back with BadRequestException when stock is insufficient', async () => {
      stockUpdateQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      await expect(service.createOrder(1, validOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      // The order itself should never be persisted once the stock guard fails.
      expect(manager.save).not.toHaveBeenCalledWith(Order, expect.anything());
    });
  });

  describe('updateOrderStatus (user self-service cancel)', () => {
    const order = { order_id: 100, user_id: 1, status_id: 1 };
    const cancelledStatus = { status_id: 3, status_name: 'canceled' };
    const shippedStatus = { status_id: 1, status_name: 'shipped' };

    beforeEach(() => {
      ordersRepository.findOne.mockResolvedValue({ ...order });
      orderStatusRepository.findOne.mockImplementation(
        ({ where }: { where: { status_name: string } }) => {
          if (where.status_name === 'canceled') return cancelledStatus;
          if (where.status_name === 'shipped') return shippedStatus;
          return null;
        },
      );
      jest
        .spyOn(service as any, 'updateOrderStatusCore')
        .mockResolvedValue({ order_id: 100, status_id: 3 });
    });

    it('throws NotFoundException when the order does not belong to the user', async () => {
      ordersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus(100, 2, {
          status_id: 3,
        } satisfies UpdateOrderStatusDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects any target status other than canceled', async () => {
      await expect(
        service.updateOrderStatus(100, 1, {
          status_id: 2,
        } satisfies UpdateOrderStatusDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects cancellation once the order has progressed past shipped', async () => {
      ordersRepository.findOne.mockResolvedValue({ ...order, status_id: 2 });

      await expect(
        service.updateOrderStatus(100, 1, {
          status_id: 3,
        } satisfies UpdateOrderStatusDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows cancelling an order that has not shipped yet', async () => {
      const result = await service.updateOrderStatus(100, 1, {
        status_id: 3,
      } satisfies UpdateOrderStatusDto);

      expect(result).toEqual({ order_id: 100, status_id: 3 });
    });
  });
});
