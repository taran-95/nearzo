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

    async getNearByOffers(productId: number, radiusKm: number, latitude: number, longitude: number) {
        const radiusMeters = radiusKm * 1000;
        const results = await this.prisma.$queryRaw<OfferAndShopInRadius>`
            SELECT
            o."productId" AS product_id,
            o.id AS offer_id,
            o.price,
            o.quantity,
            o."searchKeywords",
            o.created_at,
            o.updated_at,
            s.id AS shop_id,
            s.store_name,
            s.owner_name,
            s.address,
            s.email,
            s.phone,
            s.registered_at,
            ST_Y(s.location::geometry) AS shop_lat,
            ST_X(s.location::geometry) AS shop_long,
            ST_Distance(
                s.location,
                ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
            ) / 1000 AS distance_km
            FROM "Offer" o
            JOIN "Shop" s ON s.id = o."sellerId"
            WHERE o."productId" = ${productId}
            AND ST_DWithin(
                s.location,
                ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
                ${radiusMeters}
            )
            ORDER BY distance_km ASC;
        `;

        return results;
    }
}
