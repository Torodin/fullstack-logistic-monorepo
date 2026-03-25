import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService, State } from '@fullstack-logistic-wrk/prisma';
import { STATE_TRANSITIONS } from './constants/state-transitions.const';

@Injectable()
export class ShipmentsService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  create(createShipmentDto: CreateShipmentDto) {
    return this.prismaService.shipment.create({ data: createShipmentDto });
  }

  findAll() {
    return this.prismaService.shipment.findMany();
  }

  findOne(id: string) {
    return this.prismaService.shipment.findUnique({ where: { id } });
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto) {
    const shipment = await this.prismaService.shipment.findUnique({ where: { id } });

    if (updateShipmentDto.state === shipment.state) return shipment;

    const allowedTransitions = STATE_TRANSITIONS[shipment.state] ?? [];
    if (!allowedTransitions.includes(updateShipmentDto.state)) {
      throw new BadRequestException(
        `Invalid state transition from ${shipment.state} to ${updateShipmentDto.state}`,
      );
    }

    return this.prismaService.shipment.update({
      where: { id },
      data: { state: updateShipmentDto.state },
    });
  }

  async remove(id: string) {
    const shipment = await this.prismaService.shipment.findUnique({ where: { id } });

    if (shipment.state === State.DELIVERED) {
      throw new BadRequestException('Delivered shipments cannot be removed');
    }

    return this.prismaService.shipment.delete({ where: { id } });
  }
}
