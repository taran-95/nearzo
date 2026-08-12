import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @Get()
    getNotes() {
        return this.productsService.getProducts();
    }

}
