import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) { }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    const emailCheck = await this.userRepo.findOne({ where: { email } });
    if (emailCheck) {
      return { message: 'This email already exists' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepo.save({ name, email, password: hashedPassword, role });
    
    // refreshToken maydonini o'z ichiga olmaydigan foydalanuvchi obyektini yaratamiz
    const { refreshToken, ...userWithoutRefreshToken } = user;
    
    return { message: 'User created successfully', user: userWithoutRefreshToken };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findAll() {
    const users = await this.userRepo.find();
    // Har bir foydalanuvchi uchun refreshToken maydonini o'chiramiz
    const usersWithoutRefreshToken = users.map(user => {
      const { refreshToken, ...userWithoutRefreshToken } = user;
      return userWithoutRefreshToken;
    });
    return { message: 'Users found successfully', users: usersWithoutRefreshToken };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // refreshToken maydonini o'z ichiga olmaydigan foydalanuvchi obyektini qaytaramiz
    const { refreshToken, ...userWithoutRefreshToken } = user;
    return userWithoutRefreshToken as User;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Agar email yangilanayotgan bo'lsa, uni tekshiramiz
    if (updateUserDto.email) {
      const existingUser = await this.userRepo.findOne({ where: { email: updateUserDto.email } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const result: UpdateResult = await this.userRepo.update(id, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.userRepo.findOne({ where: { id } });
    // refreshToken maydonini o'z ichiga olmaydigan foydalanuvchi obyektini yaratamiz
    if (updatedUser) {
      const { refreshToken, ...userWithoutRefreshToken } = updatedUser;
      return { message: 'User updated successfully', user: userWithoutRefreshToken };
    }
    return { message: 'User updated successfully' };
  }

  async remove(id: number) {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}