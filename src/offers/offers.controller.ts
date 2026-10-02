import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe, Query, ParseFloatPipe } from '@nestjs/common';
import { OffersService } from './offers.service.js';
import { SessionAuthGuard } from '../auth/guards/sessionAuth.guard.js';
import { UserTypeGuard } from '../auth/guards/userType.guard.js';
import { UserTypes } from '../auth/decorators/userTypes.decorator.js';
import { CreateOfferDto } from './dtos/createOffer.dto.js';
import type { Request } from 'express';

@Controller('offers')
export class OffersController {
    constructor(private offersService: OffersService) {}

    @Get('product/:id')
    getOfferByProductId(@Param("id", ParseIntPipe) id: number) {
        return this.offersService.getOfferByProductId(id);
    }

    @Get('nearby')
    getNearByOffers(
        @Query('productId', ParseIntPipe) productId: number, 
        @Query('radius', ParseIntPipe) radius: number,
        @Query('lat', ParseFloatPipe) latitude: number,
        @Query('long', ParseFloatPipe) longitude: number) 
    {
        return this.offersService.getNearByOffers(productId, radius, latitude, longitude);
    }

    @UseGuards(SessionAuthGuard, UserTypeGuard)
    @UserTypes("shop")
    @Post()
    createOffer(@Body() dto: CreateOfferDto, @Req() req: Request){
        return this.offersService.createOffer(dto, req.session.userId!)
    }


}
