import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [OffersController],
  providers: [OffersService],
  imports: [PrismaModule]
})
export class OffersModule {}
