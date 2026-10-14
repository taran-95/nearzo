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
import { RedisModule } from './redis/redis.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [ProductsModule, PrismaModule, AuthModule, UsersModule, ShopModule, OffersModule, RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [createKeyv('redis://localhost:6379')],
        ttl: 60 * 60, // 1 hour
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
