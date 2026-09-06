import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Socket } from 'socket.io';
import {
  authenticateSocket,
  WsJwtGuard,
  getSocketUser,
} from './wsJwtAuth.guard';
import { UsersService } from '../../services/users.service';

function buildClient(
  auth: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
  data: Record<string, unknown> = {},
): Socket {
  return { handshake: { auth, headers }, data } as unknown as Socket;
}

describe('authenticateSocket', () => {
  let jwtService: JwtService;
  let configService: ConfigService;
  let usersService: UsersService;
  let verifyMock: jest.Mock;
  let findByIdMock: jest.Mock;

  const payload = { sub: 1, email: 'user@example.com', role: 0 };
  const dbUser = {
    user_id: 1,
    email: 'user@example.com',
    full_name: 'Test User',
    role_id: 0,
    points: 0,
  };

  beforeEach(() => {
    verifyMock = jest.fn().mockReturnValue(payload);
    findByIdMock = jest.fn().mockResolvedValue(dbUser);
    jwtService = { verify: verifyMock } as unknown as JwtService;
    configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    usersService = { findById: findByIdMock } as unknown as UsersService;
  });

  it('authenticates using the token from handshake.auth.token', async () => {
    const client = buildClient({ token: 'valid-token' });

    const user = await authenticateSocket(
      client,
      jwtService,
      configService,
      usersService,
    );

    expect(verifyMock).toHaveBeenCalledWith('valid-token', {
      secret: 'test-secret',
    });
    expect(user).toEqual({
      user_id: 1,
      email: 'user@example.com',
      full_name: 'Test User',
      role_id: 0,
      points: 0,
    });
  });

  it('falls back to the Authorization header when no auth.token is present', async () => {
    const client = buildClient({}, { authorization: 'Bearer header-token' });

    await authenticateSocket(client, jwtService, configService, usersService);

    expect(verifyMock).toHaveBeenCalledWith('header-token', {
      secret: 'test-secret',
    });
  });

  it('throws WsException when no token is provided at all', async () => {
    const client = buildClient();

    await expect(
      authenticateSocket(client, jwtService, configService, usersService),
    ).rejects.toThrow(WsException);

    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('throws WsException when the token is valid but the user no longer exists', async () => {
    findByIdMock.mockResolvedValue(null);
    const client = buildClient({ token: 'valid-token' });

    await expect(
      authenticateSocket(client, jwtService, configService, usersService),
    ).rejects.toThrow(WsException);
  });
});

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let verifyMock: jest.Mock;
  let findByIdMock: jest.Mock;

  const dbUser = {
    user_id: 1,
    email: 'user@example.com',
    full_name: 'Test User',
    role_id: 0,
    points: 0,
  };

  beforeEach(() => {
    verifyMock = jest
      .fn()
      .mockReturnValue({ sub: 1, email: 'user@example.com', role: 0 });
    findByIdMock = jest.fn().mockResolvedValue(dbUser);
    const jwtService = { verify: verifyMock } as unknown as JwtService;
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    const usersService = { findById: findByIdMock } as unknown as UsersService;
    guard = new WsJwtGuard(jwtService, configService, usersService);
  });

  function buildContext(client: Socket): ExecutionContext {
    return {
      switchToWs: () => ({ getClient: () => client }),
    } as unknown as ExecutionContext;
  }

  it('authenticates and attaches the user when the socket has none yet', async () => {
    const client = buildClient({ token: 'valid-token' });

    const result = await guard.canActivate(buildContext(client));

    expect(result).toBe(true);
    expect(getSocketUser(client)).toEqual({
      user_id: 1,
      email: 'user@example.com',
      full_name: 'Test User',
      role_id: 0,
      points: 0,
    });
  });

  it('reuses the already-authenticated user instead of re-verifying the token', async () => {
    const existingUser = {
      user_id: 5,
      email: 'cached@example.com',
      full_name: 'Cached User',
      role_id: 0,
      points: 0,
    };
    const client = buildClient({}, {}, { user: existingUser });

    const result = await guard.canActivate(buildContext(client));

    expect(result).toBe(true);
    expect(verifyMock).not.toHaveBeenCalled();
    expect(getSocketUser(client)).toBe(existingUser);
  });
});
