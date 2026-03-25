import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaModule } from '@fullstack-logistic-wrk/prisma';
import { ShipmentUpdatedListener } from './listeners/shipment-updated.listener';

@Module({
  imports: [PrismaModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentUpdatedListener],
})
export class ShipmentsModule {}
