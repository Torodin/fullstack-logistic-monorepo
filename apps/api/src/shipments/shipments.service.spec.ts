import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { PrismaService, State } from '@fullstack-logistic-wrk/prisma';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let prismaService: {
    shipment: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      shipment: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('updates state for a valid transition CREATED -> IN_WAREHOUSE', async () => {
      const id = 'shipment-1';
      const existingShipment = { id, state: State.CREATED };
      const updatedShipment = { id, state: State.IN_WAREHOUSE };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);
      prismaService.shipment.update.mockResolvedValue(updatedShipment);

      const result = await service.update(id, { state: State.IN_WAREHOUSE });

      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.shipment.update).toHaveBeenCalledWith({
        where: { id },
        data: { state: State.IN_WAREHOUSE },
      });
      expect(result).toEqual(updatedShipment);
    });

    it('updates state for a valid transition IN_TRANSIT -> CANCELED', async () => {
      const id = 'shipment-2';
      const existingShipment = { id, state: State.IN_TRANSIT };
      const updatedShipment = { id, state: State.CANCELED };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);
      prismaService.shipment.update.mockResolvedValue(updatedShipment);

      const result = await service.update(id, { state: State.CANCELED });

      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.shipment.update).toHaveBeenCalledWith({
        where: { id },
        data: { state: State.CANCELED },
      });
      expect(result).toEqual(updatedShipment);
    });

    it('returns existing shipment when state is unchanged', async () => {
      const id = 'shipment-3';
      const existingShipment = { id, state: State.IN_TRANSIT };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      const result = await service.update(id, { state: State.IN_TRANSIT });

      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
      expect(result).toEqual(existingShipment);
    });

    it('throws for an invalid transition IN_DELIVERY -> CREATED', async () => {
      const id = 'shipment-4';
      const existingShipment = { id, state: State.IN_DELIVERY };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      await expect(service.update(id, { state: State.CREATED })).rejects.toThrow(
        new BadRequestException(
          `Invalid state transition from ${State.IN_DELIVERY} to ${State.CREATED}`,
        ),
      );
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
    });

    it('throws for undefined state input', async () => {
      const id = 'shipment-5';
      const existingShipment = { id, state: State.CREATED };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      await expect(
        service.update(id, { state: undefined as unknown as State }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
    });

    it('throws for null state input', async () => {
      const id = 'shipment-6';
      const existingShipment = { id, state: State.CREATED };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      await expect(
        service.update(id, { state: null as unknown as State }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
    });

    it('throws runtime error when shipment does not exist (current behavior)', async () => {
      const id = 'missing-shipment';

      prismaService.shipment.findUnique.mockResolvedValue(null);

      await expect(service.update(id, { state: State.IN_TRANSIT })).rejects.toThrow(TypeError);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
    });
  });
});
