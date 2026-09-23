import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ShopModule } from './shop/shop.module.js';
import { OffersModule } from './offers/offers.module.js';

@Module({
  imports: [ProductsModule, PrismaModule, AuthModule, UsersModule, ShopModule, OffersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
