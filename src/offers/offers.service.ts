import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dtos/createOffer.dto.js';
import { ProductsService } from '../products/products.service.js';
import { UpdateOfferDto } from './dtos/updateOffer.dto.js';

@Injectable()
export class OffersService {
    constructor(private readonly prisma: PrismaService, private readonly productsService: ProductsService) {}

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
                seller: {
                    select: {
                        id: true,
                        store_name: true,
                        owner_name: true,
                        address: true,
                        phone: true,
email: true
                    }
                }
            }
        });
    }

    async getOfferBySellerId(id: number) {
        const offers = await this.prisma.offer.findMany({
            where: {
                sellerId: id
            },
            include: {
                product: true
            }
        });

        const productIds = offers.map((offer) => offer.product.id);
        const products = await this.productsService.getProductsByIds(productIds);

        const productMap = new Map(products.map((p) => [p.id, p]));
        const data = offers.map((offer) => ({
            ...offer,
            product: productMap.get(offer.productId) || null
        }));
        console.log(data);
        return data;
    }


    async getOffer(id: number) {
        return this.prisma.offer.findUnique({
            where: {id: id}
        });
    }

    async getOfferBySellerAndProductId(sellerId: number, productId: number) {
        return await this.prisma.offer.findFirst({
            where: {
                sellerId: sellerId,
                productId: productId
            }
        });
    }

    async updateOffer(id: number, dto: UpdateOfferDto, sellerId: number) {
        const offer = await this.prisma.offer.findUnique({ where: { id: id } });
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }
        if (offer.sellerId !== sellerId) {
            throw new ForbiddenException('You do not have permission to modify this offer');
        }
        return this.prisma.offer.update({
            where: { id: id },
            data: dto
        });
    }

    async deleteOffer(id: number, sellerId: number) { 
        const offer = await this.prisma.offer.findUnique({ where: { id: id } });
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }
        if (offer.sellerId !== sellerId) {
            throw new ForbiddenException('You do not have permission to delete this offer');
        }
        return this.prisma.offer.delete({ where: { id: id } });
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

    async search(query: string) {
        const tokens = query
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (tokens.length === 0) return [];

        // "creamy pea" -> "creamy & pea:*"
        const tsquery = tokens
            .map((t, i) => (i === tokens.length - 1 ? `${t}:*` : t))
            .join(' & ');

        // 1. Best-ranked offer per product
        const rows = await this.prisma.$queryRaw<{ id: number; rank: number }[]>`
            SELECT "productId" AS id,
                MAX(ts_rank(search_vector, to_tsquery('english', ${tsquery}))) AS rank
            FROM "Offer"
            WHERE search_vector @@ to_tsquery('english', ${tsquery})
            GROUP BY "productId"
            ORDER BY rank DESC
            LIMIT 10
        `;

        if (rows.length === 0) return [];

        // 2. Load the products with the regular client
        const products = await this.productsService.getProductsByIds(rows.map((r) => r.id));

        // 3. `IN` doesn't preserve order, so restore the ranking
        const byId = new Map(products.map((p) => [p.id, p]));
        return rows.map((r) => byId.get(r.id)).filter((p) => p !== undefined);
    }
}
