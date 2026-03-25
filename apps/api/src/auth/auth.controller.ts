import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './decorator/roles.decorator';
import { Role } from '@fullstack-logistic-wrk/prisma';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @ApiOperation({ summary: 'User login' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
    })
    @ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        type: 'object',
        properties: {
          access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
    })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @ApiOperation({ summary: 'Register a new user (SUPERVISOR only)' })
    @ApiBearerAuth('JWT-auth')
    @ApiResponse({
      status: 201,
      description: 'User created successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          email: { type: 'string', example: 'newuser@example.com' },
          name: { type: 'string', example: 'John Doe' },
          role: { type: 'string', example: 'USER' },
        },
      },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid token or insufficient permissions' })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPERVISOR)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req) {
        return req.logout();
    }
}
