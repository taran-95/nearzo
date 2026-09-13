import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength } from "class-validator";

export class CreateShopDto {
    
    @IsString()
    @IsNotEmpty()
    store_name: string

    @IsString()
    @IsNotEmpty()
    owner_name: string

    @IsString()
    @IsNotEmpty()
    location: string

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