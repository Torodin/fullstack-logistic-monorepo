import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@fullstack-logistic-wrk/prisma'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        'apps/api/.env',
        'packages/prisma/.env',
      ]
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ShipmentsModule,
    TrackingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
