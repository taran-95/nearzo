import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
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

    @UseGuards(SessionAuthGuard, UserTypeGuard)
    @UserTypes("shop")
    @Post()
    createOffer(@Body() dto: CreateOfferDto, @Req() req: Request){
        return this.offersService.createOffer(dto, req.session.userId!)
    }

}
