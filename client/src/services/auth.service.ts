import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

class AuthService {
  async login(email: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Save token and user
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', data.access_token);
    storage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        full_name: fullName, 
        email, 
        password 
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Save token and user
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async fetchUserData(token: string): Promise<User> {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

