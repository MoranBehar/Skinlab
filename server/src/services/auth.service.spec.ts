import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    updateAccessToken: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const mockUser = {
    user_id: 1,
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    role_id: 0,
    points: 0,
    access_token: undefined,
    creating_date: new Date(),
  } as unknown as User;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateAccessToken: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates a new user and returns an access token when the email is not taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({ ...mockUser });

      const result = await authService.register({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'plain-password',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com', role_id: 0 }),
      );
      expect(result.access_token).toBe('signed-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws ConflictException when the email is already registered', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser });

      await expect(
        authService.register({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'plain-password',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result.access_token).toBe('signed-jwt-token');
      expect(usersService.updateAccessToken).toHaveBeenCalledWith(
        mockUser.user_id,
        'signed-jwt-token',
      );
    });

    it('throws UnauthorizedException for an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nobody@example.com',
          password: 'whatever',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.updateAccessToken).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.updateAccessToken).not.toHaveBeenCalled();
    });
  });
});
