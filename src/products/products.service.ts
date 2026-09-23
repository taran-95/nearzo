import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadCustomProductDto } from './dtos/uploadCustomProduct.dto.js';
import { ProductSource, ProductType } from '../generated/prisma/enums.js';


@Injectable()
export class ProductsService {

    constructor(private readonly prisma: PrismaService) {}

    async getProducts() {
        const products = await this.prisma.product.findMany({
            include: {
                customProduct: {
                    include: {
                        images: true
                    }
                },
                identifiedProduct: true
            }
        });

        
    }

    async getProduct(id: number) {
        return this.prisma.product.findUnique({
            where: {id},
            include: {
                customProduct: {
                    include: {
                        images: true
                    }
                },
                identifiedProduct: true
            }
        })
    }

    async uploadIdentifiedProduct(identifier: String) {
        if (await this.canQueryApi(ProductSource.UPCITEMDB)) {
            const product = await this.callUpcItemDbApi(identifier);
            return product.items[0];
        }
    }

    async uploadCustomProduct(uploadCustomProductDto: UploadCustomProductDto, files) {
        const product = await this.prisma.product.create({
            data: {
                type: ProductType.CUSTOM,

                customProduct: {
                    create: {
                        name: uploadCustomProductDto.name,
                        description: uploadCustomProductDto.description
                    }
                }
            },
            include: {
                customProduct: true
            }
        });
        
        const images = files.map((file, index) => ({
            productId: product.id,
            filename: file.filename,
            originalname: file.originalname,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            position: index,
            isPrimary: index === 0 ? true : false
        }));

        return await this.prisma.productImage.createMany({
            data: images,
        });
    }

    async callUpcItemDbApi(identifier: String) {
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${identifier}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        this.updateApiUsage(ProductSource.UPCITEMDB, response.headers);
        
        if(!response.ok) {
            const error = await response.json();
            throw new BadGatewayException(error.message);
        }

        const product = await response.json();
        
        if(product.total === 0) {
            throw new NotFoundException("No product found");
        }

        return product;
    }



   async canQueryApi(api: ProductSource) {
        const usage = await this.prisma.productApiUsage.findUnique({where: {provider: api}});

        if(!usage) {
            return true;
        }

        const now = new Date();

        if(now >= usage.resetAt) {
            return true;
        }

        return usage.remaining > 0;
   }

   async updateApiUsage(api: ProductSource, headers) {

        const limit = Number(headers.get('x-ratelimit-limit'));
        const remaining = Number(headers.get('x-ratelimit-remaining'));
        const reset = Number(headers.get('x-ratelimit-reset'));

        await this.prisma.productApiUsage.upsert({
            where: {provider: api},
            create: {
                provider: api,
                limit,
                remaining,
                resetAt: new Date(reset * 1000)
            },
            update: {
                limit,
                remaining,
                resetAt: new Date(reset * 1000),
                disabledUntil: remaining === 0 ? new Date(reset * 1000) : null,
            }
        });
   }
}
