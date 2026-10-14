import { BadGatewayException, BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadCustomProductDto } from './dtos/uploadCustomProduct.dto.js';
import { ProductSource, ProductType } from '../generated/prisma/enums.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';


@Injectable()
export class ProductsService {

    constructor(private readonly prisma: PrismaService, @Inject(CACHE_MANAGER) private cache: Cache) {}

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
                try {
                    const identifier = product.identifiedProduct?.gtin;
                    if(!identifier) {
                        console.error(`${product.id} not stored properly in db`);
                        return product;
                    }
                    const productObj = await this.callApi(identifier);

                    if(!productObj) {
                        throw new NotFoundException(`Product with identifier ${identifier} not found`);
                    }

                    return {
                    ...product,
                    identifiedProduct: {
                        ...product.identifiedProduct,
                        ...productObj,
                    },
                };
                } catch (error) {
                    console.error(`Failed to fetch identified products: ${error}`)
                }

                return product;
            })
        );
        
        const products = [...customProducts, ...updatedRecords];
        //console.log(products);
        return products;
    }

    async getProductsByIds(ids: number[]) {
        const customProducts = await this.prisma.product.findMany({
            where: {
                id: {
                    in: ids
                },
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
                id: {
                    in: ids
                },
                type: ProductType.IDENTIFIED
            },
            include: {
                identifiedProduct: true
            }
        });

        const updatedRecords = await Promise.all(
            identifiedProductRecords.map(async (product) => {
                try {
                    const identifier = product.identifiedProduct?.gtin;
                    if(!identifier) {
                        console.error(`${product.id} not stored properly in db`);
                        return product;
                    }
                    const productObj = await this.callApi(identifier);

                    if(!productObj) {
                        throw new NotFoundException(`Product with identifier ${identifier} not found`);
                    }

                    return {
                    ...product,
                    identifiedProduct: {
                        ...product.identifiedProduct,
                        ...productObj,
                    },
                };
                } catch (error) {
                    console.error(`Failed to fetch identified products: ${error}`)
                }

                return product;
            })
        );
        
        const products = [...customProducts, ...updatedRecords];
        //console.log(products);
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

        if(!product) {
            throw new NotFoundException(`Product with ID ${id} not found.`);
        }

        if (product?.identifiedProduct) {
            try {
                const productObj = await this.callApi(product.identifiedProduct.gtin);

                if(!productObj) {
                    throw new NotFoundException(`Product with identifier ${product.identifiedProduct.gtin} not found`);
                }

                return {
                ...product,
                identifiedProduct: {
                    ...product.identifiedProduct,
                    ...productObj,
                },
            };
            } catch (error) {
                console.error('Failed to fetch from identified product: ', error);
            }
        }
        return product;
    }

    async uploadIdentifiedProduct(identifier: string) {
        const exist = await this.prisma.identifiedProduct.findUnique({
            where: {
                gtin: identifier
            }
        });
        if(exist) {
            console.log(exist);
            throw new BadRequestException("Error fetching product details. The product was probably uploaded previously. Try searching for it and creating offer for it.");
        } 
        const product = await this.callApi(identifier);
        if(!product) {
            throw new NotFoundException(`Product with identifier ${identifier} not found`);
        }
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
            throw new BadRequestException("Error creating identified product record.");
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

    ///TODO: Refactor
    async callApi(identifier: string, sourceProvider: ProductSource = ProductSource.UPC_DEV) {
        const key = `productIdentifier:${identifier}`;
        const cached = await this.cache.get(key);
        if (cached) {
            console.log(`cached response identifier: ${identifier}`);
            return cached;
        }

        if(sourceProvider === ProductSource.UPC_DEV && await this.canQueryApi(ProductSource.UPC_DEV)) {
            try {
                console.log("upcdev");
                const product = await this.callUpcDevApi(identifier);
                await this.cache.set(key, product, 3_600_000);
                return product;
            } catch (error) {
                console.error(error);
                if(await this.canQueryApi(ProductSource.OPENFOODFACTS)) {
                    try {
                        console.log("openfoodfacts");
                        const product = await this.callOpenFoodFactApi(identifier);
                        await this.cache.set(key, product, 3_600_000);
                        return product;
                    } catch (error) {
                        console.error(error);
                        if(await this.canQueryApi(ProductSource.UPCITEMDB)) {
                            try {
                                console.log("upcitemdb");
                                const product = await this.callUpcItemDbApi(identifier);
                                await this.cache.set(key, product, 3_600_000);
                                return product;
                            } catch (error) {
                                console.error(error);
                                console.error("All apis failed.");
                            }
                        }
                    }
                }
            }
        } else if(sourceProvider === ProductSource.OPENFOODFACTS && await this.canQueryApi(ProductSource.OPENFOODFACTS)) {
            try {
                console.log("openfoodfacts");
                const product = await this.callOpenFoodFactApi(identifier);
                await this.cache.set(key, product, 3_600_000);
                return product;
            } catch (error) {
                console.error(error);
                if(await this.canQueryApi(ProductSource.UPC_DEV)) {
                    try {
                        console.log("upcdev");
                        const product = await this.callUpcDevApi(identifier);
                        await this.cache.set(key, product, 3_600_000);
                        return product;
                    } catch (error) {
                        console.error(error);
                        if(await this.canQueryApi(ProductSource.UPCITEMDB)) {
                            try {
                                console.log("upcitemdb");
                                const product = await this.callUpcItemDbApi(identifier);
                                await this.cache.set(key, product, 3_600_000);
                                return product;
                            } catch (error) {
                                console.error(error);
                                console.error("All apis failed.");
                            }
                        }
                    }
                }
            }
        } else {
            if(await this.canQueryApi(ProductSource.UPCITEMDB)) {
                try {
                    console.log("upcitemdb");
                    const product = await this.callUpcItemDbApi(identifier);
                    await this.cache.set(key, product, 3_600_000);
                    return product;
                } catch (error) {
                    console.error(error);
                    if(await this.canQueryApi(ProductSource.UPC_DEV)) {
                        try {
                            console.log("upcdev");
                            const product = await this.callUpcDevApi(identifier);
                            await this.cache.set(key, product, 3_600_000);
                            return product;
                        } catch (error) {
                            console.error(error);
                            if(await this.canQueryApi(ProductSource.OPENFOODFACTS)) {
                                try {
                                    console.log("openfoodfacts");
                                    const product = await this.callOpenFoodFactApi(identifier);
                                    await this.cache.set(key, product, 3_600_000);
                                    return product;
                                } catch (error) {
                                    console.error(error);
                                    console.error("All apis failed.");
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async callUpcDevApi(identifier: string) {
        const response = await fetch(`https://upc.dev/v1/product/${identifier}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        ///TODO: Change order perhaps
        this.updateApiUsage(ProductSource.UPC_DEV, response.headers);

        if(!response.ok) {
            const error = await response.json();
            throw new BadGatewayException(error.message);
        }

        const rawProduct = await response.json();

        const product = {
            name: rawProduct.data.name,
            description: rawProduct.data.description,
            images: [rawProduct.data.image_url]
        }
        return product;
    }

    async callUpcItemDbApi(identifier: string) {
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${identifier}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        ///TODO: Change order perhaps
        this.updateApiUsage(ProductSource.UPCITEMDB, response.headers);
        
        if(!response.ok) {
            const error = await response.json();
            throw new BadGatewayException(error.message);
        }

        const rawProduct = await response.json();
        
        if(rawProduct.total === 0) {
            throw new NotFoundException("No product found: upcitemdb");
        }
        
        const product = {
            name: rawProduct.items[0].title,
            description: rawProduct.items[0].description,
            images: rawProduct.items[0].images
        }

        return product;
    }

    async callOpenFoodFactApi(identifier: string) {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${identifier}.json`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        ///TODO: Change order perhaps
        this.updateApiUsage(ProductSource.UPC_DEV, response.headers);

        if(!response.ok) {
            const error = await response.json();
            throw new BadGatewayException(error.message);
        }

        const rawProduct = await response.json();

        if(rawProduct.status === 0) {
            throw new NotFoundException("No product found: openfoodfacts");
        }

        const product = {
            name: rawProduct.product.brand_owner,
            description: rawProduct.product.product_name_en ? rawProduct.product.product_name_en:rawProduct.product.product_name,
            images: [rawProduct.product.image_url]
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
