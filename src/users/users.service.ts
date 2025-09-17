import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

type SafeUser = Omit<User, 'password' | 'refreshToken'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private sanitizeUser(user: User): SafeUser {
    const { password, refreshToken, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;
    const emailCheck = await this.userRepo.findOne({ where: { email } });
    if (emailCheck) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepo.save({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return {
      message: 'User created successfully',
      user: this.sanitizeUser(user),
    };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findAll() {
    const users = await this.userRepo.find();
    const sanitizedUsers = users.map((user) => this.sanitizeUser(user));
    return { message: 'Users found successfully', users: sanitizedUsers };
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });
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
    if (updatedUser) {
      return {
        message: 'User updated successfully',
        user: this.sanitizeUser(updatedUser),
      };
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
