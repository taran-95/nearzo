import { Controller, Post, Body, Req, Get, UnauthorizedException, UseGuards, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { CreateShopDto } from './dtos/createShop.dto.js';
import { CreateUserDto } from './dtos/createUser.dto.js';
import { LoginShopDto } from './dtos/loginShop.dto.js';
import { LoginUserDto } from './dtos/loginUser.dto.js';
import { SessionAuthGuard } from './guards/sessionAuth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('register/shop')
    async registerShop(@Body() dto: CreateShopDto, @Req() req: Request) {
        const shop = await this.authService.registerShop(dto);
        req.session.userId = shop.id;
        req.session.userType = shop.userType;
        return { message: 'Shop registered successfully' };
    }

    @Post('register/user')
    async registerUser(@Body() dto: CreateUserDto, @Req() req: Request) {
        const user = await this.authService.registerUser(dto);
        req.session.userId = user.id;
        req.session.userType = user.userType;
        return { message: 'User registered successfully' };
    }

    @Post('login/shop')
    async loginShop(@Body() dto: LoginShopDto, @Req() req: Request) {
        const shop = await this.authService.loginShop(dto);
        req.session.userId = shop.id;
        req.session.userType = shop.userType;
        return { message: 'Logged in successfully' };
    }

    @Post('login/user')
    async loginUser(@Body() dto: LoginUserDto, @Req() req: Request) {
        const user = await this.authService.loginUser(dto);
        req.session.userId = user.id;
        req.session.userType = user.userType;
        return { message: 'Logged in successfully' };
    }

    @UseGuards(SessionAuthGuard)
    @Get('me')
    async getProfile(@Req() req: Request) {
        //if (!req.session.userId || !req.session.userType) { 
          //  throw new UnauthorizedException('Not authenticated'); 
        //}
        const userId = req.session.userId!;
        if (req.session.userType === 'shop') {
            const shop = await this.authService.getShopProfile(userId);
            return { userType: 'shop', user: shop };
        }

        const user = await this.authService.getUserProfile(userId);
        return { userType: 'user', user: user, };
    }

    @Post('logout') 
    logout(@Req() req: Request) { 
        console.log("1");
        req.session.destroy((err) => {
            if (err) { 
                throw err;
             } 
            }
        );
        console.log("2");
        return { message: 'Logged out successfully', }; 
    }
}
