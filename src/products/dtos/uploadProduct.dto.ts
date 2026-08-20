import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class UploadProductDto {
    
    @IsString()
    @IsNotEmpty()
    name: string

    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    price: number

    @IsString()
    @IsNotEmpty()
    description: string

    @IsString()
    @IsNotEmpty()
    store_name: string

    @IsString()
    @IsNotEmpty()
    store_location: string
}