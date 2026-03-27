import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

describe('TrackingController', () => {
  let controller: TrackingController;
  let trackingService: {
    trackShipment: jest.Mock;
  };

  beforeEach(() => {
    trackingService = {
      trackShipment: jest.fn(),
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingService,
        },
      ],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates shipment tracking to the service', async () => {
    const trackingResult = {
      state: 'IN_TRANSIT',
      events: [],
    };

    trackingService.trackShipment.mockResolvedValue(trackingResult);

    await expect(controller.track('SHP00001')).resolves.toEqual(trackingResult);
    expect(trackingService.trackShipment).toHaveBeenCalledWith('SHP00001');
  });
});
