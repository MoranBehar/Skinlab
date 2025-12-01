import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../services/users.service';
import { UsersController } from '../contrrollers/users.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [// Sign User Entity
    TypeOrmModule.forFeature([User]) 
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // export for other modulse's use
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}