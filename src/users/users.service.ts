import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from '../auth/dtos/createUser.dto.js';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService){}

    findById(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                registered_at: true,
            }
        });
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {email},
        });
    }

    create(createUserDto: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                phone: createUserDto.phone,
                passwordHash: createUserDto.password,
            },
        });
    }
}
