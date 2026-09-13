import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { ShopModule } from '../shop/shop.module.js';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UsersModule, ShopModule]
})
export class AuthModule {}
