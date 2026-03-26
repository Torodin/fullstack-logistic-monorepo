import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { PrismaService } from '@fullstack-logistic-wrk/prisma';
import { State } from '@fullstack-logistic-wrk/prisma/generated';
import { FindAllShipmentsQueryDto } from './dto/find-all-shipments-query.dto';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;
  let shipmentsService: ShipmentsService;
  let prismaService: {
    shipment: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      shipment: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [
        ShipmentsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShipmentsController>(ShipmentsController);
    shipmentsService = module.get<ShipmentsService>(ShipmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('forwards query params to the service', async () => {
      const query: FindAllShipmentsQueryDto = {
        page: 2,
        limit: 5,
        state: State.IN_TRANSIT,
      };
      const expectedResponse = {
        data: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      };
      const findAllSpy = jest.spyOn(shipmentsService, 'findAll').mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(findAllSpy).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });
  });
});
