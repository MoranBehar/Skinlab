import { Request } from 'express';

export interface RequestUser {
  user_id: number;
  email: string;
  full_name: string;
  role_id: number;
  points: number;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface GoogleAuthenticatedRequest extends Request {
  user: GoogleUser;
}
