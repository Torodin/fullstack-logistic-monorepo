import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService, State } from '@fullstack-logistic-wrk/prisma';
import { STATE_TRANSITIONS } from './constants/state-transitions.const';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SHIPMENT_UPDATED_EVENT, ShipmentUpdatedEventPayload } from './events/shipment-updated.event';
import { SHIPMENT_DELIVERED_EVENT, ShipmentDeliveredEventPayload } from './events/shipment-delivered.event';
import { FindAllShipmentsQueryDto } from './dto/find-all-shipments-query.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  create(createShipmentDto: CreateShipmentDto) {
    return this.prismaService.shipment.create({ data: createShipmentDto });
  }

  async findAll(query: FindAllShipmentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = query.state ? { state: query.state } : undefined;

    const [data, total] = await Promise.all([
      this.prismaService.shipment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.shipment.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.prismaService.shipment.findUnique({ where: { id }, include: { events: true } });
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, userId: number) {
    const shipment = await this.prismaService.shipment.findUnique({ where: { id } });

    if (updateShipmentDto.state === shipment.state) return shipment;

    const allowedTransitions = STATE_TRANSITIONS[shipment.state] ?? [];
    if (!allowedTransitions.includes(updateShipmentDto.state)) {
      throw new BadRequestException(
        `Invalid state transition from ${shipment.state} to ${updateShipmentDto.state}`,
      );
    }

    const updatedShipment = await this.prismaService.shipment.update({
      where: { id },
      data: { state: updateShipmentDto.state },
    });

    const updateEventPayload: ShipmentUpdatedEventPayload = {
      shipmentId: updatedShipment.id,
      userId,
      location: updateShipmentDto.location,
      notes: updateShipmentDto.notes,
    };
    this.eventEmitter.emit(SHIPMENT_UPDATED_EVENT, updateEventPayload);

    if (updateShipmentDto.state === State.DELIVERED) {
      const deliveredEventPayload: ShipmentDeliveredEventPayload = { shipmentId: updatedShipment.id };
      this.eventEmitter.emit(SHIPMENT_DELIVERED_EVENT, deliveredEventPayload);
    }

    return updatedShipment;
  }

  async remove(id: string) {
    const shipment = await this.prismaService.shipment.findUnique({ where: { id } });

    if (shipment.state === State.DELIVERED) {
      throw new BadRequestException('Delivered shipments cannot be removed');
    }

    return this.prismaService.shipment.delete({ where: { id } });
  }
}
