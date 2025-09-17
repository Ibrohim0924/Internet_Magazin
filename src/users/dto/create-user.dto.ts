import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    role?: string

}
