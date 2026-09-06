import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from '../contrrollers/chat.controller';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from '../gateways/chat.gateway';
import { WsJwtGuard } from '../common/guards/wsJwtAuth.guard';
import { Message } from '../entities/message.entity';
import { UsersModule } from './users.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UsersModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, WsJwtGuard],
})
export class ChatModule {}
