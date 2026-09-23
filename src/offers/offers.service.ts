import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dtos/createOffer.dto.js';

@Injectable()
export class OffersService {
    constructor(private readonly prisma: PrismaService) {}

    async createOffer(dto: CreateOfferDto, sellerId: number) {
        return this.prisma.offer.create({
            data: {
                productId: dto.productId,
                sellerId: sellerId,
                price: dto.price,
                quantity: dto.quantity,
                searchKeywords: dto.searchKeywords
            }
        });
    }

    async getOfferByProductId(id: number) {
        return this.prisma.offer.findMany({
            where: {
                productId: id
            },
            include: {
                seller: true
            }
        });
    }
}
