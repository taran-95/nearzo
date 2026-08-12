import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [PrismaModule]
})
export class ProductsModule {}
