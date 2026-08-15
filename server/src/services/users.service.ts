import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../DTO/users/createUser.dto';
import { UpdateUserDto } from '../DTO/users/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(userId: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { user_id: userId } });
  }

  async updateAccessToken(
    userId: number,
    accessToken: string | undefined,
  ): Promise<void> {
    await this.usersRepository.update(userId, { access_token: accessToken });
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: [
        'user_id',
        'full_name',
        'email',
        'role_id',
        'points',
        'creating_date',
      ],
    });
  }

  async delete(userId: number): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException('משתמש לא נמצא');
    }
  }
}
