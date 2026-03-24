import { PrismaService } from '@fullstack-logistic-wrk/prisma';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prismaService: PrismaService
    ) {}

    findByEmail(email: string) {
        return this.prismaService.user.findUnique({ where: { email } });
    }

    findById(id: number) {
        return this.prismaService.user.findUnique({ where: { id } });
    }

    async create(createDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createDto.password, 10)

        return this.prismaService.user.create({
            data: { ...createDto, password: hashedPassword }
        })
    }
}
