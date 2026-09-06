import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/getUser.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET /chat/messages - the logged-in user's own conversation with support
  @Get('messages')
  async getMyMessages(@GetUser('user_id') userId: number) {
    return this.chatService.getConversation(userId);
  }

  // GET /chat/admin/conversations - every user's conversation summary
  @Get('admin/conversations')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getConversations() {
    return this.chatService.getConversationsForAdmin();
  }

  // GET /chat/admin/messages/:userId - one user's full conversation
  @Get('admin/messages/:userId')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getConversationForAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getConversation(userId);
  }
}
