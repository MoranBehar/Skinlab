import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../DTO/users/updateUser.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../common/decorators/getUser.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
//every endpoint demaend loging in
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser('user_id') userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      return undefined;
    }

    //not returning password and token
    const {
      password: _password,
      access_token: _accessToken,
      ...userProfile
    } = user;
    return userProfile;
  }

  @Put('profile')
  async updateProfile(
    @GetUser('user_id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    //if cahaging passord - update it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersService.update(userId, updateUserDto);

    //not returning password and token
    const {
      password: _password,
      access_token: _accessToken,
      ...userProfile
    } = updatedUser;
    return userProfile;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);

    if (!user) {
      return undefined;
    }

    //not returning password and token
    const {
      password: _password,
      access_token: _accessToken,
      ...userProfile
    } = user;
    return userProfile;
  }

  @Delete('profile')
  async deleteAccount(@GetUser('user_id') userId: number) {
    await this.usersService.delete(userId);
    return { message: 'Account successfully deleted' };
  }
}
