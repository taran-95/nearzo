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

    create(createShopDto: CreateShopDto) {
        return this.prisma.shop.create({
            data: {
                store_name: createShopDto.store_name,
                owner_name: createShopDto.owner_name,
                location: createShopDto.location,
                email: createShopDto.email,
                phone: createShopDto.phone,
                passwordHash: createShopDto.password,
            },
        });
    }

}
