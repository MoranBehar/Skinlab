import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type {
  AuthenticatedRequest,
  RequestUser,
} from '../types/authenticatedRequest';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (user?: RequestUser): ExecutionContext => {
    const request = { user } as AuthenticatedRequest;
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows the request through when the route has no @Roles metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('allows a request from a user with a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([1]);

    const context = buildContext({
      user_id: 1,
      email: 'admin@example.com',
      full_name: 'Admin',
      role_id: 1,
      points: 0,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a request from a user without a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([1]);

    const context = buildContext({
      user_id: 2,
      email: 'user@example.com',
      full_name: 'Regular User',
      role_id: 0,
      points: 0,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('denies a request with no authenticated user', () => {
    reflector.getAllAndOverride.mockReturnValue([1]);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
