import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("user not found");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("wrong password");
    }

    const token = await this.jwtService.signAsync({ 
      id: user.id,
      email: user.email,
      role: user.role, 
    });

    return { 
      message: "Login successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.full_name,
        role: user.role, 
      },
    };
  }
}
