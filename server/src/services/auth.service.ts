import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { RegisterDto } from '../DTO/auth/register.dto';
import { LoginDto } from '../DTO/auth/login.dto';
import type { GoogleAuthenticatedRequest } from '../common/types/authenticatedRequest';
import type { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      full_name: registerDto.full_name,
      email: registerDto.email,
      password: hashedPassword,
      role_id: 0,
      points: 0,
      creating_date: new Date(),
    });

    const token = this.generateToken(user.user_id, user.email, user.role_id);
    await this.usersService.updateAccessToken(user.user_id, token);

    return {
      access_token: token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        points: user.points,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.user_id, user.email, user.role_id);
    await this.usersService.updateAccessToken(user.user_id, token);

    return {
      access_token: token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        points: user.points,
      },
    };
  }

  async googleLogin(req: GoogleAuthenticatedRequest) {
    if (!req.user) {
      throw new BadRequestException('No user from Google');
    }

    const { email, firstName, lastName } = req.user;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        full_name: `${firstName} ${lastName}`,
        email: email,
        password: '',
        role_id: 0,
        points: 0,
        creating_date: new Date(),
      });
    }

    const token = this.generateToken(user.user_id, user.email, user.role_id);
    await this.usersService.updateAccessToken(user.user_id, token);

    return {
      access_token: token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        points: user.points,
      },
    };
  }

  async logout(userId: number) {
    await this.usersService.updateAccessToken(userId, undefined);
    return { message: 'Logged out successfully' };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user || user.access_token !== token) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateToken(userId: number, email: string, roleId: number): string {
    const payload = {
      sub: userId,
      email: email,
      role: roleId,
    };
    return this.jwtService.sign(payload);
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.generateToken(user.user_id, user.email, user.role_id);
    await this.usersService.updateAccessToken(user.user_id, token);

    return { access_token: token };
  }
}
