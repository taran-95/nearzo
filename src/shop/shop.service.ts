import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateShopDto } from '../auth/dtos/createShop.dto.js';

@Injectable()
export class ShopService {
    constructor(private readonly prisma: PrismaService){}

    findById(id: number) {
        return this.prisma.shop.findUnique({
            where: {id},
        });
    }

    findByEmail(email: string) {
        return this.prisma.shop.findUnique({
            where: {email},
        });
    }

    async create(createShopDto: CreateShopDto) {
        await this.prisma.$executeRaw`
            INSERT INTO "Shop" ("store_name", "owner_name", "address", "location", "email", "phone", "passwordHash")
            VALUES (
                ${createShopDto.store_name}, 
                ${createShopDto.owner_name}, 
                ${createShopDto.address},
                ST_SetSRID(ST_MakePoint(${createShopDto.longitude}, ${createShopDto.latitude}), 4326)::geography,
                ${createShopDto.email}, 
                ${createShopDto.phone}, 
                ${createShopDto.password})
        `;

        return this.findByEmail(createShopDto.email);
    }

    async findStoresInRadiusMeters(radiusMeters: number, latitude: number, longitude: number) {
        const stores = await this.prisma.$queryRaw`
            SELECT 
            id,
            store_name,
            owner_name,
            address,
            email,
            phone,
            registered_at

        `;
    }

}
