import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@fullstack-logistic-wrk/prisma';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, pass: string): Promise<Omit<User, "password">> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            delete (user as Partial<Pick<User, "password">>).password;
            return user;
        }
        return null;
    }

    async login(user: Omit<User, "password">) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        }
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
