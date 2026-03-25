import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@fullstack-logistic-wrk/prisma';
import { ShipmentUpdatedListener } from './shipment-updated.listener';

describe('ShipmentUpdatedListener', () => {
  let listener: ShipmentUpdatedListener;
  let prismaService: {
    event: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      event: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentUpdatedListener,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    listener = module.get<ShipmentUpdatedListener>(ShipmentUpdatedListener);
  });

  it('should persist a new event row when shipment.updated is received', async () => {
    await listener.handleShipmentUpdated({
      shipmentId: 'ENV-0001',
      userId: 7,
      location: 'Warehouse B',
      notes: 'Loaded into truck',
    });

    expect(prismaService.event.create).toHaveBeenCalledWith({
      data: {
        shipmentId: 'ENV-0001',
        userId: 7,
        location: 'Warehouse B',
        notes: 'Loaded into truck',
      },
    });
  });
});
