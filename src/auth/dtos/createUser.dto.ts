import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
    
    @IsString()
    @IsNotEmpty()
    name: string

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MaxLength(10)
    phone: string

    @MinLength(6)
    @IsNotEmpty()
    password: string;
}