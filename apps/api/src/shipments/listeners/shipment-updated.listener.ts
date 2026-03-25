import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@fullstack-logistic-wrk/prisma';
import { SHIPMENT_UPDATED_EVENT, ShipmentUpdatedEventPayload } from '../events/shipment-updated.event';
import { SHIPMENT_DELIVERED_EVENT, ShipmentDeliveredEventPayload } from '../events/shipment-delivered.event';

@Injectable()
export class ShipmentUpdatedListener {
  constructor(private readonly prismaService: PrismaService) {}

  @OnEvent(SHIPMENT_UPDATED_EVENT)
  async handleShipmentUpdated(payload: ShipmentUpdatedEventPayload) {
    await this.prismaService.event.create({
      data: {
        shipmentId: payload.shipmentId,
        userId: payload.userId,
        location: payload.location,
        notes: payload.notes,
      },
    });
  }

  @OnEvent(SHIPMENT_DELIVERED_EVENT)
  async handleShipmentDelivered(payload: ShipmentDeliveredEventPayload) {
    await this.prismaService.shipment.update({
      where: { id: payload.shipmentId },
      data: {
        delivered_at: new Date(), 
      },
    });
  }
}
