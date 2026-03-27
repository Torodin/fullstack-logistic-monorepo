import { Test, TestingModule } from '@nestjs/testing';
import { State } from '@fullstack-logistic-wrk/prisma/generated';
import { ShipmentsService } from '../shipments/shipments.service';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let shipmentsService: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    shipmentsService = {
      findOne: jest.fn(),
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: ShipmentsService,
          useValue: shipmentsService,
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the shipment tracking state and events', async () => {
    const shipment = {
      id: 'SHP00001',
      state: State.IN_TRANSIT,
      events: [
        {
          id: 1,
          shipmentId: 'SHP00001',
          userId: 8,
          location: 'Madrid Hub',
          notes: 'Checked in',
          date: new Date('2026-03-27T10:00:00.000Z'),
        },
      ],
    };

    shipmentsService.findOne.mockResolvedValue(shipment);

    await expect(service.trackShipment('SHP00001')).resolves.toEqual({
      state: State.IN_TRANSIT,
      events: shipment.events,
    });
    expect(shipmentsService.findOne).toHaveBeenCalledWith('SHP00001');
  });
});
