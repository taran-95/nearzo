import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe, Query, ParseFloatPipe, Patch } from '@nestjs/common';
import { OffersService } from './offers.service.js';
import { SessionAuthGuard } from '../auth/guards/sessionAuth.guard.js';
import { UserTypeGuard } from '../auth/guards/userType.guard.js';
import { UserTypes } from '../auth/decorators/userTypes.decorator.js';
import { CreateOfferDto } from './dtos/createOffer.dto.js';
import type { Request } from 'express';
import { UpdateOfferDto } from './dtos/updateOffer.dto.js';

@Controller('offers')
export class OffersController {
    constructor(private offersService: OffersService) {}

    @Get('seller_product')
    getOfferBySellerAndProductId(@Query('seller', ParseIntPipe) sellerId: number, @Query('product', ParseIntPipe) productId: number) {
        return this.offersService.getOfferBySellerAndProductId(sellerId, productId);
    }

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

    @Get('search')
    search(@Query('query') query: string) {
        return this.offersService.search(query);
    }

    @UseGuards(SessionAuthGuard, UserTypeGuard)
    @UserTypes("shop")
    @Post()
    createOffer(@Body() dto: CreateOfferDto, @Req() req: Request){
        return this.offersService.createOffer(dto, req.session.userId!)
    }

    @UseGuards(SessionAuthGuard, UserTypeGuard)
    @UserTypes("shop")
    @Patch(':id')
    updateOffer(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOfferDto) {
        return this.offersService.updateOffer(id, dto);
    }

    @UseGuards(SessionAuthGuard, UserTypeGuard)
    @UserTypes("shop")
    @Post('delete/:id')
    deleteOffer(@Param('id', ParseIntPipe) id: number) {
        return this.offersService.deleteOffer(id);
    }

    @Get(':id')
    getOffer(@Param("id", ParseIntPipe) id: number) {
        return this.offersService.getOffer(id);
    }
}
