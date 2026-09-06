import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from '../entities/message.entity';
import { UsersService } from './users.service';
import { RequestUser } from '../common/types/authenticatedRequest';

describe('ChatService', () => {
  let service: ChatService;
  let messagesRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    update: jest.Mock;
  };
  let usersService: { findById: jest.Mock };

  const regularUser: RequestUser = {
    user_id: 1,
    email: 'user@example.com',
    full_name: 'Regular User',
    role_id: 0,
    points: 0,
  };

  const admin: RequestUser = {
    user_id: 99,
    email: 'admin@example.com',
    full_name: 'Admin',
    role_id: 1,
    points: 0,
  };

  beforeEach(async () => {
    messagesRepository = {
      create: jest.fn((data: unknown) => data),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };
    usersService = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Message), useValue: messagesRepository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('sendMessage', () => {
    it('posts a regular user message to their own conversation', async () => {
      messagesRepository.save.mockResolvedValue({ message_id: 1 });

      await service.sendMessage(regularUser, { body: 'Hello' });

      expect(messagesRepository.create).toHaveBeenCalledWith({
        user_id: regularUser.user_id,
        sender_id: regularUser.user_id,
        body: 'Hello',
      });
    });

    it('posts an admin message to the specified user conversation', async () => {
      messagesRepository.save.mockResolvedValue({ message_id: 2 });

      await service.sendMessage(admin, {
        body: 'How can we help?',
        user_id: 1,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith({
        user_id: 1,
        sender_id: admin.user_id,
        body: 'How can we help?',
      });
    });

    it('throws BadRequestException when an admin does not specify a target user', async () => {
      await expect(
        service.sendMessage(admin, { body: 'Hello' }),
      ).rejects.toThrow(BadRequestException);

      expect(messagesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    it('returns the messages for the given user ordered by sent_at', async () => {
      const messages = [{ message_id: 1 }];
      messagesRepository.find.mockResolvedValue(messages);

      const result = await service.getConversation(1);

      expect(messagesRepository.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        order: { sent_at: 'ASC' },
      });
      expect(result).toBe(messages);
    });
  });

  describe('markConversationAsRead', () => {
    it('marks the user’s own messages as read when an admin reads the conversation', async () => {
      messagesRepository.find.mockResolvedValue([
        { message_id: 1, sender_id: 1, is_read: false },
        { message_id: 2, sender_id: 99, is_read: false },
      ]);

      await service.markConversationAsRead(1, 1);

      expect(messagesRepository.update).toHaveBeenCalledWith([1], {
        is_read: true,
      });
    });

    it('marks the admin’s replies as read when the user reads the conversation', async () => {
      messagesRepository.find.mockResolvedValue([
        { message_id: 1, sender_id: 1, is_read: false },
        { message_id: 2, sender_id: 99, is_read: false },
      ]);

      await service.markConversationAsRead(1, 0);

      expect(messagesRepository.update).toHaveBeenCalledWith([2], {
        is_read: true,
      });
    });

    it('does nothing when there is nothing new to mark as read', async () => {
      messagesRepository.find.mockResolvedValue([
        { message_id: 1, sender_id: 1, is_read: true },
      ]);

      await service.markConversationAsRead(1, 1);

      expect(messagesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getConversationsForAdmin', () => {
    it('summarizes each conversation with the last message and unread count', async () => {
      messagesRepository.find.mockResolvedValue([
        {
          message_id: 1,
          user_id: 1,
          sender_id: 1,
          body: 'Hi',
          sent_at: new Date('2026-01-01T10:00:00Z'),
          is_read: false,
        },
        {
          message_id: 2,
          user_id: 1,
          sender_id: 99,
          body: 'Hello, how can we help?',
          sent_at: new Date('2026-01-01T10:05:00Z'),
          is_read: true,
        },
      ]);
      usersService.findById.mockResolvedValue({
        user_id: 1,
        full_name: 'Regular User',
        email: 'user@example.com',
      });

      const result = await service.getConversationsForAdmin();

      expect(result).toEqual([
        {
          user_id: 1,
          full_name: 'Regular User',
          email: 'user@example.com',
          last_message: 'Hello, how can we help?',
          last_message_at: new Date('2026-01-01T10:05:00Z'),
          unread_count: 1,
        },
      ]);
    });
  });
});
