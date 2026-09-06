import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Socket } from 'socket.io';
import { UsersService } from '../../services/users.service';
import type { JwtPayload } from '../../strategies/jwt.strategy';
import type { RequestUser } from '../types/authenticatedRequest';

interface ChatSocketData {
  user?: RequestUser;
}

export function getSocketUser(client: Socket): RequestUser | undefined {
  return (client.data as ChatSocketData).user;
}

export function setSocketUser(client: Socket, user: RequestUser): void {
  (client.data as ChatSocketData).user = user;
}

export async function authenticateSocket(
  client: Socket,
  jwtService: JwtService,
  configService: ConfigService,
  usersService: UsersService,
): Promise<RequestUser> {
  const token = extractToken(client);
  if (!token) {
    throw new WsException('Unauthorized');
  }

  const payload = jwtService.verify<JwtPayload>(token, {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
  });
  const user = await usersService.findById(payload.sub);
  if (!user) {
    throw new WsException('Unauthorized');
  }

  return {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    role_id: user.role_id,
    points: user.points,
  };
}

function extractToken(client: Socket): string | undefined {
  const authToken = client.handshake.auth?.token as string | undefined;
  if (authToken) {
    return authToken;
  }

  const header = client.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return undefined;
}

// Per-message defense-in-depth guard for the chat gateway's @SubscribeMessage
// handlers. Connections are already authenticated in ChatGateway.handleConnection
// (which disconnects unauthenticated clients immediately); this guard re-uses
// that result via getSocketUser instead of re-verifying the token on every
// message, since a socket is a long-lived connection rather than a one-shot
// HTTP request.
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    if (getSocketUser(client)) {
      return true;
    }

    const user = await authenticateSocket(
      client,
      this.jwtService,
      this.configService,
      this.usersService,
    );
    setSocketUser(client, user);

    return true;
  }
}
