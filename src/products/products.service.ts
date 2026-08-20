import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadProductDto } from './dtos/uploadProduct.dto.js';


@Injectable()
export class ProductsService {

    constructor(private readonly prisma: PrismaService) {}

    getProducts() {
        return this.prisma.product.findMany({
            include: {
                images: {
                    orderBy: {
                        position: 'asc',
                    }
                }
            }
        });
    }

    async uploadProduct(uploadProductDto: UploadProductDto, files) {
        //TODO
        const product = await this.prisma.product.create({data: uploadProductDto});
        
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

        return this.prisma.productImage.createMany({
            data: images,
        });
    }
}
