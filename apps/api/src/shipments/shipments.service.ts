import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService, State } from '@fullstack-logistic-wrk/prisma';

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
    return this.prismaService.shipment.update({
      where: { id },
      data: updateShipmentDto,
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
