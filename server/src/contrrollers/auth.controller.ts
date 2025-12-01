import { 
  Controller, Post, Body, Get, UseGuards, Req, Res,HttpCode,HttpStatus} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../DTO/auth/register.dto';
import { LoginDto } from '../DTO/auth/login.dto';
import { JwtAuthGuard } from '../common/guards/jwtAuth.guard';
import { GetUser } from '../common/decorators/getUser.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/success?token=${result.access_token}`
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser('user_id') userId: number) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: any) {
    return {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      points: user.points,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@GetUser('user_id') userId: number) {
    return this.authService.refreshToken(userId);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken() {
    return { valid: true };
  }
}