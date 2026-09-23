import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateOfferDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number

    @IsArray()
    @IsString({each: true})
    searchKeywords: string[];
}