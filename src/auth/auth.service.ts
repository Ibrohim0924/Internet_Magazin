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
    // Agar foydalanuvchi ro'yxatini belgilamagan bo'lsa, 'user' ro'yxatini beramiz
    if (!signupDto.role) {
      signupDto.role = Role.User;
    }
    
    // Foydalanuvchini yaratamiz
    const result = await this.usersService.create(signupDto);
    
    // Agar foydalanuvchi yaratilgan bo'lsa, token generatsiya qilamiz
    if (result.user) {
      const payload = { sub: result.user.id, email: result.user.email };
      const token = this.jwtService.sign(payload);
      
      return { 
        message: 'User signed up and logged in', 
        user: result.user, 
        token 
      };
    }
    
    return result;
  }

  async signin(signinDto: SigninDto) {
    const user = await this.usersService.findByEmail(signinDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(signinDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    
    // refreshToken maydonini o'z ichiga olmaydigan foydalanuvchi obyektini yaratamiz
    const { refreshToken, ...userWithoutRefreshToken } = user as any;
    
    return { message: 'User signed in', user: userWithoutRefreshToken, token };
  }
}