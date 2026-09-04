import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { ShoppingCart } from '../entities/shoppingCart.entity';
import { ShoppingCartItem } from '../entities/shoppingCartItem.entity';
import { Product } from '../entities/product.entity';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let cartItemRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let productRepository: { findOne: jest.Mock };

  const cart = { shopping_cart_id: 10, user_id: 1, items: [] };
  const availableProduct = {
    product_id: 5,
    is_available: true,
    price: 100,
    discount_percentage: 0,
  };

  beforeEach(async () => {
    cartRepository = {
      findOne: jest.fn().mockResolvedValue({ ...cart }),
      create: jest.fn(),
      save: jest.fn(),
    };
    cartItemRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    productRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(ShoppingCart), useValue: cartRepository },
        {
          provide: getRepositoryToken(ShoppingCartItem),
          useValue: cartItemRepository,
        },
        { provide: getRepositoryToken(Product), useValue: productRepository },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addToCart', () => {
    it('adds a new item to the cart when the product is not already in it', async () => {
      productRepository.findOne.mockResolvedValue({ ...availableProduct });
      cartItemRepository.findOne.mockResolvedValue(null);
      cartItemRepository.create.mockImplementation((data: unknown) => data);
      cartItemRepository.save.mockResolvedValue(undefined);

      await service.addToCart(1, { product_id: 5, quantity: 2 });

      expect(cartItemRepository.create).toHaveBeenCalledWith({
        shopping_cart_id: cart.shopping_cart_id,
        product_id: 5,
        quantity: 2,
      });
      expect(cartItemRepository.save).toHaveBeenCalled();
    });

    it('increments the quantity when the product is already in the cart', async () => {
      productRepository.findOne.mockResolvedValue({ ...availableProduct });
      const existingItem = {
        shopping_cart_id: cart.shopping_cart_id,
        product_id: 5,
        quantity: 3,
      };
      cartItemRepository.findOne.mockResolvedValue(existingItem);
      cartItemRepository.save.mockResolvedValue(undefined);

      await service.addToCart(1, { product_id: 5, quantity: 2 });

      expect(existingItem.quantity).toBe(5);
      expect(cartItemRepository.save).toHaveBeenCalledWith(existingItem);
      expect(cartItemRepository.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the product does not exist', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addToCart(1, { product_id: 999, quantity: 1 }),
      ).rejects.toThrow(NotFoundException);

      expect(cartItemRepository.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the product is not available', async () => {
      productRepository.findOne.mockResolvedValue({
        ...availableProduct,
        is_available: false,
      });

      await expect(
        service.addToCart(1, { product_id: 5, quantity: 1 }),
      ).rejects.toThrow(BadRequestException);

      expect(cartItemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateCartItem', () => {
    it('updates the quantity of an existing item', async () => {
      const existingItem = {
        shopping_cart_id: cart.shopping_cart_id,
        product_id: 5,
        quantity: 1,
      };
      cartItemRepository.findOne.mockResolvedValue(existingItem);
      cartItemRepository.save.mockResolvedValue(undefined);

      await service.updateCartItem(1, 5, { quantity: 9 });

      expect(existingItem.quantity).toBe(9);
      expect(cartItemRepository.save).toHaveBeenCalledWith(existingItem);
    });

    it('throws NotFoundException when the item is not in the cart', async () => {
      cartItemRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCartItem(1, 5, { quantity: 9 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromCart', () => {
    it('removes an existing item', async () => {
      cartItemRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.removeFromCart(1, 5)).resolves.not.toThrow();
      expect(cartItemRepository.delete).toHaveBeenCalledWith({
        shopping_cart_id: cart.shopping_cart_id,
        product_id: 5,
      });
    });

    it('throws NotFoundException when the item does not exist in the cart', async () => {
      cartItemRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.removeFromCart(1, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
