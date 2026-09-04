import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './loginPage';
import { useAuth } from '../contexts/authContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../contexts/authContext');
const mockedUseAuth = useAuth as jest.Mock;

describe('LoginPage', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ login: mockLogin });
  });

  it('logs in with the entered credentials and navigates to /home on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<LoginPage />);

    userEvent.type(
      screen.getByPlaceholderText('Enter your email'),
      'user@example.com',
    );
    userEvent.type(
      screen.getByPlaceholderText('Enter your password'),
      'secret123',
    );
    userEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith(
        'user@example.com',
        'secret123',
        false,
      ),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home'));
  });

  it('shows an error message when login fails and does not navigate', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginPage />);

    userEvent.type(
      screen.getByPlaceholderText('Enter your email'),
      'user@example.com',
    );
    userEvent.type(
      screen.getByPlaceholderText('Enter your password'),
      'wrong-password',
    );
    userEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
