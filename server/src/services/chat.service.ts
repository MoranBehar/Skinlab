import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { SendMessageDto } from '../DTO/chat/sendMessage.dto';
import { RequestUser } from '../common/types/authenticatedRequest';
import { UsersService } from './users.service';

export interface ConversationSummary {
  user_id: number;
  full_name: string;
  email: string;
  last_message: string;
  last_message_at: Date;
  unread_count: number;
}

const ADMIN_ROLE_ID = 1;

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  async sendMessage(
    sender: RequestUser,
    dto: SendMessageDto,
  ): Promise<Message> {
    const isAdmin = sender.role_id === ADMIN_ROLE_ID;

    if (isAdmin && !dto.user_id) {
      throw new BadRequestException(
        'user_id is required when an admin sends a message',
      );
    }

    const conversationUserId = isAdmin ? dto.user_id! : sender.user_id;

    const message = this.messagesRepository.create({
      user_id: conversationUserId,
      sender_id: sender.user_id,
      body: dto.body,
    });

    return this.messagesRepository.save(message);
  }

  async getConversation(userId: number): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { user_id: userId },
      order: { sent_at: 'ASC' },
    });
  }

  async markConversationAsRead(
    userId: number,
    readerRoleId: number,
  ): Promise<void> {
    const isAdmin = readerRoleId === ADMIN_ROLE_ID;
    const messages = await this.getConversation(userId);

    // An admin reading a conversation marks the user's own messages as read;
    // the user themselves reading it marks the admin's replies as read.
    const toMark = messages.filter((message) =>
      isAdmin
        ? message.sender_id === userId && !message.is_read
        : message.sender_id !== userId && !message.is_read,
    );

    if (toMark.length === 0) {
      return;
    }

    await this.messagesRepository.update(
      toMark.map((message) => message.message_id),
      { is_read: true },
    );
  }

  async getConversationsForAdmin(): Promise<ConversationSummary[]> {
    const messages = await this.messagesRepository.find({
      order: { sent_at: 'ASC' },
    });

    const byUser = new Map<number, Message[]>();
    for (const message of messages) {
      const existing = byUser.get(message.user_id) ?? [];
      existing.push(message);
      byUser.set(message.user_id, existing);
    }

    const summaries: ConversationSummary[] = [];
    for (const [userId, userMessages] of byUser) {
      const user = await this.usersService.findById(userId);
      if (!user) {
        continue;
      }

      const lastMessage = userMessages[userMessages.length - 1];
      const unreadCount = userMessages.filter(
        (message) => message.sender_id === userId && !message.is_read,
      ).length;

      summaries.push({
        user_id: userId,
        full_name: user.full_name,
        email: user.email,
        last_message: lastMessage.body,
        last_message_at: lastMessage.sent_at,
        unread_count: unreadCount,
      });
    }

    return summaries.sort(
      (a, b) => b.last_message_at.getTime() - a.last_message_at.getTime(),
    );
  }
}
