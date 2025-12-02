export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role_id: number;
  points: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
}