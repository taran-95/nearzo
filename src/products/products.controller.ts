import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { UploadCustomProductDto } from './dtos/uploadCustomProduct.dto.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { SessionAuthGuard } from '../auth/guards/sessionAuth.guard.js';
import { UserTypeGuard } from '../auth/guards/userType.guard.js';
import { UserTypes } from '../auth/decorators/userTypes.decorator.js';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @Get()
    getProducts() {
        return this.productsService.getProducts();
    }

    @Get(':id')
    async getProduct(@Param("id", ParseIntPipe) id: number) {
        return await this.productsService.getProduct(id);
    }

    //@UseGuards(SessionAuthGuard, UserTypeGuard)
    //@UserTypes('shop')
    @Post('identified/:identifier')
    async uploadIdentifiedProduct(@Param("identifier") identifier: string) {
        return await this.productsService.uploadIdentifiedProduct(identifier);
    }

    @UseGuards(SessionAuthGuard, UserTypeGuard)
    @UserTypes('shop')
    @Post('custom')
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
    uploadCustomProduct(@Body() uploadCustomProductDto: UploadCustomProductDto,
                    @UploadedFiles() files) 
    {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one product image is required');
        }
        return this.productsService.uploadCustomProduct(uploadCustomProductDto, files);
    }



}
