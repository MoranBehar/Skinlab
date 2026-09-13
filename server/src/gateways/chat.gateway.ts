import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  BadRequestException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Server, Socket } from 'socket.io';
import { UsersService } from '../services/users.service';
import { ChatService } from '../services/chat.service';
import { SendMessageDto } from '../DTO/chat/sendMessage.dto';
import { MarkReadDto } from '../DTO/chat/markRead.dto';
import {
  WsJwtGuard,
  authenticateSocket,
  extractToken,
  getSocketUser,
  setSocketUser,
} from '../common/guards/wsJwtAuth.guard';

interface SocketExpiryData {
  expiryTimer?: NodeJS.Timeout;
}

function hasExpiry(value: unknown): value is { exp: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { exp?: unknown }).exp === 'number'
  );
}

const ADMIN_ROLE_ID = 1;
export const ADMIN_ROOM = 'chat:admin';
export function roomForUser(userId: number): string {
  return `chat:${userId}`;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await authenticateSocket(
        client,
        this.jwtService,
        this.configService,
        this.usersService,
      );
      setSocketUser(client, user);

      await client.join(roomForUser(user.user_id));
      if (user.role_id === ADMIN_ROLE_ID) {
        await client.join(ADMIN_ROOM);
      }

      // A socket is long-lived, unlike an HTTP request - without this, a
      // JWT that expires (or belongs to a since-demoted/banned user) would
      // stay usable for as long as the socket stays open, since nothing
      // re-checks it after the handshake.
      this.scheduleExpiryDisconnect(client);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const timer = (client.data as SocketExpiryData).expiryTimer;
    if (timer) {
      clearTimeout(timer);
    }
  }

  private scheduleExpiryDisconnect(client: Socket): void {
    const token = extractToken(client);
    const decoded: unknown = token ? this.jwtService.decode(token) : null;

    if (!hasExpiry(decoded)) {
      return;
    }

    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    (client.data as SocketExpiryData).expiryTimer = setTimeout(
      () => client.disconnect(true),
      Math.max(msUntilExpiry, 0),
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const sender = getSocketUser(client)!;
    const message = await this.chatService.sendMessage(sender, dto);

    this.server.to(roomForUser(message.user_id)).emit('newMessage', message);
    this.server.to(ADMIN_ROOM).emit('newMessage', message);

    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: MarkReadDto,
  ): Promise<void> {
    const user = getSocketUser(client)!;
    const isAdmin = user.role_id === ADMIN_ROLE_ID;

    if (isAdmin && !dto.user_id) {
      throw new BadRequestException(
        'user_id is required when an admin marks a conversation as read',
      );
    }

    const conversationUserId = isAdmin ? dto.user_id! : user.user_id;
    await this.chatService.markConversationAsRead(
      conversationUserId,
      user.role_id,
    );
  }
}
