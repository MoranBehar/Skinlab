import axios from 'axios';
import { User } from '../types/auth.types';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RegisterResponse {
  access_token: string;
  user: User;
}

class AuthService {
  async login(email: string, password: string, rememberMe: boolean): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password,
        rememberMe,
      });

      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_role', response.data.user.role_id.toString());
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(fullName: string, email: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(`${process.env.REACT_APP_API_URL}/auth/register`, {
        full_name: fullName,
        email,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_role', response.data.user.role_id.toString());
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
    }
  }

  async getMe(): Promise<User> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await axios.get<User>(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem('user_role', response.data.role_id.toString());
      localStorage.setItem('user', JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj.role_id) {
          localStorage.setItem('user_role', userObj.role_id.toString());
      }
      
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
}

export const authService = new AuthService();