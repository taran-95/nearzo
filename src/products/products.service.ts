import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadCustomProductDto } from './dtos/uploadCustomProduct.dto.js';
import { ProductSource, ProductType } from '../generated/prisma/enums.js';


@Injectable()
export class ProductsService {

    constructor(private readonly prisma: PrismaService) {}

    async getProducts() {
        const customProducts = await this.prisma.product.findMany({
            where: {
                type: ProductType.CUSTOM
            },
            include: {
                customProduct: {
                    include: {
                        images: true
                    }
                }
            }
        });

        const identifiedProductRecords = await this.prisma.product.findMany({
            where: {
                type: ProductType.IDENTIFIED
            },
            include: {
                identifiedProduct: true
            }
        });

        const updatedRecords = await Promise.all(
            identifiedProductRecords.map(async (product) => {
                if (product.identifiedProduct?.sourceProvider === ProductSource.UPCITEMDB) {
                    try {
                        const productObj = await this.callUpcItemDbApi(product.identifiedProduct.gtin);

                        return {
                        ...product,
                        identifiedProduct: {
                            ...product.identifiedProduct,
                            ...productObj,
                        },
                    };
                    } catch (error) {
                        // call other apis
                    }
                }

                return;
            })
        );
        
        const products = [...customProducts, ...updatedRecords];
        console.log(products);
        return products;
    }

    async getProduct(id: number) {
        const product = await this.prisma.product.findUnique({
            where: {id},
            include: {
                customProduct: {
                    include: {
                        images: true
                    }
                },
                identifiedProduct: true
            }
        });

        if (product?.identifiedProduct) {
            if (product.identifiedProduct?.sourceProvider === ProductSource.UPCITEMDB) {
                    try {
                        const productObj = await this.callUpcItemDbApi(product.identifiedProduct.gtin);

                        return {
                        ...product,
                        identifiedProduct: {
                            ...product.identifiedProduct,
                            ...productObj,
                        },
                    };
                    } catch (error) {
                        // call other apis
                    }
            }
        }
        return product;
    }

    async uploadIdentifiedProduct(identifier: string) {
        if (await this.canQueryApi(ProductSource.UPCITEMDB)) {
            const product = await this.callUpcItemDbApi(identifier);
            try {
                const productRecord = await this.prisma.product.create({
                    data: {
                        type: ProductType.IDENTIFIED,

                        identifiedProduct: {
                            create: {
                                gtin: identifier,
                                sourceProvider: ProductSource.UPCITEMDB
                            }
                        },
                    },
                    include: {
                        identifiedProduct: true
                    }
                });
                return productRecord;
            } catch (error) {
                throw new BadRequestException("Error fetching product details. The product was probably uploaded previously. Try searching for it and creating offer for it.");
            }
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

        const productImages = await this.prisma.productImage.createMany({
            data: images,
        });

        return {product, productImages};
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

        const rawProduct = await response.json();
        
        if(rawProduct.total === 0) {
            throw new NotFoundException("No product found");
        }
        
        const product = {
            name: rawProduct.items[0].title,
            description: rawProduct.items[0].description,
            images: rawProduct.items[0].images
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
