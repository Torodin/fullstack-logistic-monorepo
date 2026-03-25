import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentsService } from './shipments.service';
import { PrismaService, State } from '@fullstack-logistic-wrk/prisma';
import { SHIPMENT_UPDATED_EVENT } from './events/shipment-updated.event';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let prismaService: {
    shipment: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let eventEmitter: {
    emit: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      shipment: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
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

      const result = await service.update(
        id,
        {
          state: State.IN_WAREHOUSE,
          location: 'Warehouse A',
          notes: 'Shipment arrived at warehouse',
        },
        8,
      );

      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.shipment.update).toHaveBeenCalledWith({
        where: { id },
        data: { state: State.IN_WAREHOUSE },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(SHIPMENT_UPDATED_EVENT, {
        shipmentId: id,
        userId: 8,
        location: 'Warehouse A',
        notes: 'Shipment arrived at warehouse',
      });
      expect(result).toEqual(updatedShipment);
    });

    it('updates state for a valid transition IN_TRANSIT -> CANCELED', async () => {
      const id = 'shipment-2';
      const existingShipment = { id, state: State.IN_TRANSIT };
      const updatedShipment = { id, state: State.CANCELED };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);
      prismaService.shipment.update.mockResolvedValue(updatedShipment);

      const result = await service.update(
        id,
        {
          state: State.CANCELED,
          location: 'On the way',
          notes: 'Shipment canceled by customer',
        },
        22,
      );

      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.shipment.update).toHaveBeenCalledWith({
        where: { id },
        data: { state: State.CANCELED },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(SHIPMENT_UPDATED_EVENT, {
        shipmentId: id,
        userId: 22,
        location: 'On the way',
        notes: 'Shipment canceled by customer',
      });
      expect(result).toEqual(updatedShipment);
    });

    it('returns existing shipment when state is unchanged', async () => {
      const id = 'shipment-3';
      const existingShipment = { id, state: State.IN_TRANSIT };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      const result = await service.update(id, { state: State.IN_TRANSIT, location: 'On the way' }, 5);

      expect(prismaService.shipment.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(result).toEqual(existingShipment);
    });

    it('throws for an invalid transition IN_DELIVERY -> CREATED', async () => {
      const id = 'shipment-4';
      const existingShipment = { id, state: State.IN_DELIVERY };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      await expect(
        service.update(id, { state: State.CREATED, location: 'In delivery' }, 11),
      ).rejects.toThrow(
        new BadRequestException(
          `Invalid state transition from ${State.IN_DELIVERY} to ${State.CREATED}`,
        ),
      );
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('throws for undefined state input', async () => {
      const id = 'shipment-5';
      const existingShipment = { id, state: State.CREATED };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      await expect(
        service.update(id, { state: undefined as unknown as State, location: 'Warehouse A' }, 11),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('throws for null state input', async () => {
      const id = 'shipment-6';
      const existingShipment = { id, state: State.CREATED };

      prismaService.shipment.findUnique.mockResolvedValue(existingShipment);

      await expect(
        service.update(id, { state: null as unknown as State, location: 'Warehouse A' }, 11),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('throws runtime error when shipment does not exist (current behavior)', async () => {
      const id = 'missing-shipment';

      prismaService.shipment.findUnique.mockResolvedValue(null);

      await expect(
        service.update(id, { state: State.IN_TRANSIT, location: 'Warehouse A' }, 11),
      ).rejects.toThrow(TypeError);
      expect(prismaService.shipment.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
