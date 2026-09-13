import { Module } from '@nestjs/common';
import { ShopService } from './shop.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [ShopService],
  imports: [PrismaModule],
  exports: [ShopService]
})
export class ShopModule {}
