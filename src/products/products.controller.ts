import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { UploadProductDto } from './dtos/uploadProduct.dto.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @Get()
    getProducts() {
        return this.productsService.getProducts();
    }

    @Post()
    @UseInterceptors(FilesInterceptor('images', 5, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },

        fileFilter: (req, file, callback) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
            ];

            if (allowedTypes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(
                new BadRequestException(
                    'Only JPEG, PNG, WebP and GIF images are allowed',
                ),
                false,
                );
            }
        },

        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, callback) => {
                const extension = extname(file.originalname);
                callback(null, `${randomUUID()}${extension}`);
            },
        }),
    }))
    uploadProduct(@Body() uploadProductDto: UploadProductDto,
                    @UploadedFiles() files) 
    {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one product image is required');
        }
        return this.productsService.uploadProduct(uploadProductDto, files);
    }

}
