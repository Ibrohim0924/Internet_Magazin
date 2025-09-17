import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from './decorators/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const allowedRoles = new Set(Object.values(Role));
    if (!signupDto.role || !allowedRoles.has(signupDto.role as Role)) {
      signupDto.role = Role.User;
    }

    const result = await this.usersService.create(signupDto);

    if (result.user) {
      const payload = { sub: result.user.id, email: result.user.email };
      const token = this.jwtService.sign(payload);

      return {
        message: 'User signed up and logged in',
        user: result.user,
        token,
      };
    }

    return result;
  }

  async signin(signinDto: SigninDto) {
    const user = await this.usersService.findByEmail(signinDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(signinDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const { refreshToken, password, ...safeUser } = user as any;

    return { message: 'User signed in', user: safeUser, token };
  }
}
