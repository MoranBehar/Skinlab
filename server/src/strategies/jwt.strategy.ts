import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {

    const secret = configService.getOrThrow<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload: ', payload);

    const { sub: userId } = payload;
    const user = await this.usersService.findById(userId);

    console.log('User found: ', user ? 'yes' : 'no');
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      points: user.points,
    };
  }
}