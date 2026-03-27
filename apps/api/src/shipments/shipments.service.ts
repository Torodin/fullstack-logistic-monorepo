import { BadRequestException, Injectable } from '@nestjs/common';
import { STATE_TRANSITIONS } from '@fullstack-logistic-wrk/domain-constants';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '@fullstack-logistic-wrk/prisma';
import { State } from '@fullstack-logistic-wrk/prisma/generated';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SHIPMENT_UPDATED_EVENT, ShipmentUpdatedEventPayload } from './events/shipment-updated.event';
import { SHIPMENT_DELIVERED_EVENT, ShipmentDeliveredEventPayload } from './events/shipment-delivered.event';
import { FindAllShipmentsQueryDto } from './dto/find-all-shipments-query.dto';
import { AssignVehiclesDto } from './dto/assign-vehicles.dto';
import { VehicleShipmentAssignationDto } from './dto/vehicle-shipment-assignation.dto';

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

  async assignVehicles(assignVehiclesDto: AssignVehiclesDto) {
    const requestedShipmentsIds = new Set(assignVehiclesDto.shipmentIds);

    const shipments = await this.prismaService.shipment.findMany({
      select: { id: true, weight: true },
      where: { id: { in: [...requestedShipmentsIds] } },
      orderBy: { weight: 'desc' },
    });

    const validShipments = new Set<string>();
    let totalWeight = 0;
    for (const shipment of shipments) {
      validShipments.add(shipment.id);
      totalWeight += shipment.weight;

      if (shipment.weight > assignVehiclesDto.vehicleCapacity) {
        throw new BadRequestException(`Shipment ${shipment.id} exceeds vehicle capacity and cannot be assigned`);
      }
    }

    if (validShipments.size !== requestedShipmentsIds.size) {
      const invalidIds = [...requestedShipmentsIds].filter(id => !validShipments.has(id));
      throw new BadRequestException(`The following shipment IDs are invalid: ${invalidIds.join(', ')}`);
    }

    const vehicles: VehicleShipmentAssignationDto['vehicles'] = [];
    for (const shipment of shipments) {
      let assigned = false;

      for (const vehicle of vehicles) {
        if (vehicle.remainingCapacity >= shipment.weight) {
          vehicle.shipments.push({ id: shipment.id, weight: shipment.weight });

          vehicle.totalWeight += shipment.weight;
          vehicle.remainingCapacity -= shipment.weight;

          assigned = true;
          break;
        }
      }

      if (!assigned) {
        vehicles.push({
          vehicleNumber: vehicles.length + 1,
          shipments: [{ 
            id: shipment.id, 
            weight: shipment.weight 
          }],
          totalWeight: shipment.weight,
          remainingCapacity: assignVehiclesDto.vehicleCapacity - shipment.weight,
        });
      }
    }

    return {
      vehicles,
      totalVechiclesUsed: vehicles.length,
      totalWeight,
    }
  }
}
