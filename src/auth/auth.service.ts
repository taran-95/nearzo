import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ShopService } from '../shop/shop.service.js';
import { UsersService } from '../users/users.service.js';
import { CreateShopDto } from './dtos/createShop.dto.js';
import { CreateUserDto } from './dtos/createUser.dto.js';
import { LoginShopDto } from './dtos/loginShop.dto.js';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dtos/loginUser.dto.js';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly shopService: ShopService) {}

    async registerShop(dto: CreateShopDto) {
        const existingShop = await this.shopService.findByEmail(dto.email);

        if(existingShop) {
            throw new ConflictException("This email is already registered");
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        dto.password = passwordHash;

        const shop = await this.shopService.create(dto);

        return {
            id: shop.id,
            name: shop.store_name,
            email: shop.email,
            userType: 'shop' as const,
        };
    }

    async registerUser(dto: CreateUserDto) {
        const existingUser = await this.userService.findByEmail(dto.email);

        if(existingUser) {
            throw new ConflictException("This email is already registered");
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        dto.password = passwordHash;

        const user = await this.userService.create(dto);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: 'user' as const,
        };
    }

    async loginShop(dto: LoginShopDto) {
        const shop = await this.shopService.findByEmail(dto.email);

        if(!shop) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const valid = await bcrypt.compare(dto.password, shop.passwordHash);
        if(!valid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return {
            id: shop.id,
            name: shop.store_name,
            email: shop.email,
            userType: 'shop' as const,
        };
    }

    async loginUser(dto: LoginUserDto) {
        const user = await this.userService.findByEmail(dto.email);

        if(!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if(!valid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: 'user' as const,
        };
    }

    getShopProfile(id: number) {
        return this.shopService.findById(id);
    }

    getUserProfile(id: number) {
        return this.userService.findById(id);
    }
}
