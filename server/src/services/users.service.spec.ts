import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser = {
    user_id: 1,
    full_name: 'Test User',
    email: 'test@example.com',
    role_id: 0,
    points: 0,
  } as unknown as User;

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('creates and saves a new user', async () => {
      const dto = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'hashed',
        role_id: 0,
      };
      usersRepository.create.mockReturnValue(dto);
      usersRepository.save.mockResolvedValue({ ...mockUser });

      const result = await service.create(dto);

      expect(usersRepository.create).toHaveBeenCalledWith(dto);
      expect(usersRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser });

      const result = await service.findByEmail('test@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('returns null when no user matches the email', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      usersRepository.findOne.mockResolvedValue({ ...mockUser });

      const result = await service.findById(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateAccessToken', () => {
    it('updates the stored access token', async () => {
      usersRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateAccessToken(1, 'new-token');

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        access_token: 'new-token',
      });
    });
  });

  describe('update', () => {
    it('merges the DTO into the existing user and saves it', async () => {
      const existingUser = { ...mockUser };
      usersRepository.findOne.mockResolvedValue(existingUser);
      usersRepository.save.mockImplementation((user: unknown) =>
        Promise.resolve(user),
      );

      const result = await service.update(1, { full_name: 'Updated Name' });

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'Updated Name' }),
      );
      expect(result).toEqual(
        expect.objectContaining({ full_name: 'Updated Name' }),
      );
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { full_name: 'Nobody' }),
      ).rejects.toThrow(NotFoundException);

      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns users with only the safe fields selected', async () => {
      usersRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(usersRepository.find).toHaveBeenCalledWith({
        select: [
          'user_id',
          'full_name',
          'email',
          'role_id',
          'points',
          'creating_date',
        ],
      });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('delete', () => {
    it('deletes an existing user', async () => {
      usersRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
