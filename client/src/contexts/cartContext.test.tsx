import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './cartContext';
import { AuthProvider } from './authContext';
import { cartAPI } from '../services/cart.api';
import { CartResponse } from '../types/cart.types';

jest.mock('../services/cart.api');

const mockedCartAPI = cartAPI as jest.Mocked<typeof cartAPI>;

function TestConsumer() {
  const { cartCount, loading, addToCart } = useCart();
  return (
    <div>
      <span data-testid="count">{cartCount}</span>
      <span data-testid="loading">{loading ? 'loading' : 'idle'}</span>
      <button onClick={() => addToCart(1, 2)}>Add</button>
    </div>
  );
}

function renderWithProviders() {
  return render(
    <AuthProvider>
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    </AuthProvider>,
  );
}

const emptyCartResponse: CartResponse = {
  cart: { shopping_cart_id: 1, user_id: 1, items: [] },
  summary: { totalItems: 0, subtotal: 0, tax: 0, total: 0 },
};

const authedUser = {
  user_id: 1,
  full_name: 'Test User',
  email: 't@example.com',
  role_id: 0,
  points: 0,
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('does not load a cart when the user is not authenticated', async () => {
    renderWithProviders();

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('idle'),
    );
    expect(mockedCartAPI.getCart).not.toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('loads the cart on mount when the user is authenticated', async () => {
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify(authedUser));

    mockedCartAPI.getCart.mockResolvedValue({
      ...emptyCartResponse,
      summary: { totalItems: 3, subtotal: 10, tax: 1.8, total: 11.8 },
    });
    mockedCartAPI.getCartCount.mockResolvedValue(3);

    renderWithProviders();

    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('3'),
    );
    expect(mockedCartAPI.getCart).toHaveBeenCalledTimes(1);
  });

  it('updates cart state after addToCart resolves', async () => {
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify(authedUser));

    mockedCartAPI.getCart.mockResolvedValue(emptyCartResponse);
    mockedCartAPI.getCartCount.mockResolvedValue(0);
    mockedCartAPI.addToCart.mockResolvedValue({
      cart: {
        shopping_cart_id: 1,
        user_id: 1,
        items: [
          {
            shopping_cart_id: 1,
            product_id: 1,
            quantity: 2,
            product: {} as CartResponse['cart']['items'][number]['product'],
          },
        ],
      },
      summary: { totalItems: 2, subtotal: 20, tax: 3.6, total: 23.6 },
    });

    renderWithProviders();
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('idle'),
    );

    userEvent.click(screen.getByText('Add'));

    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('2'),
    );
    expect(mockedCartAPI.addToCart).toHaveBeenCalledWith(1, 2);
  });
});
