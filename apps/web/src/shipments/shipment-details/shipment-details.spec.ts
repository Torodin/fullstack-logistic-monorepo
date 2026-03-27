import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { State } from '@fullstack-logistic-wrk/prisma/generated';
import { ShipmentDetails } from './shipment-details';
import { ShipmentsService } from '../shipments.service';

describe('ShipmentDetails', () => {
  const findOneCalls: string[] = [];
  const navigateCalls: unknown[] = [];

  const defaultShipment = {
    id: 'SHP00001',
    origin: 'Madrid',
    destination: 'Barcelona',
    addressee: 'John Doe',
    phone: '12345',
    weight: 12,
    state: State.IN_TRANSIT,
    delivered_at: null,
    created_at: new Date('2026-03-27T10:00:00.000Z'),
    updated_at: new Date('2026-03-27T10:00:00.000Z'),
    events: [
      {
        id: 2,
        userId: 10,
        shipmentId: 'SHP00001',
        location: 'Madrid Hub',
        notes: 'Arrived at hub',
        date: new Date('2026-03-27T12:00:00.000Z'),
      },
    ],
  };

  const shipmentServiceMock = {
    findOne: (id: string) => {
      findOneCalls.push(id);
      return of(defaultShipment);
    },
  };

  const routerMock = {
    navigate: (commands: unknown) => {
      navigateCalls.push(commands);
      return Promise.resolve(true);
    },
  };

  beforeEach(async () => {
    findOneCalls.length = 0;
    navigateCalls.length = 0;

    await TestBed.configureTestingModule({
      imports: [ShipmentDetails],
      providers: [
        {
          provide: ShipmentsService,
          useValue: shipmentServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'SHP00001' })),
          },
        },
      ],
    }).compileComponents();
  });

  it('loads shipment details from route id', () => {
    const fixture = TestBed.createComponent(ShipmentDetails);
    fixture.detectChanges();

    expect(findOneCalls).toEqual(['SHP00001']);
    expect(fixture.componentInstance.shipment()?.id).toBe('SHP00001');
  });

  it('navigates back to shipments list', () => {
    const fixture = TestBed.createComponent(ShipmentDetails);
    const component = fixture.componentInstance;

    component.goBack();

    expect(navigateCalls).toEqual([['/shipments']]);
  });
});
