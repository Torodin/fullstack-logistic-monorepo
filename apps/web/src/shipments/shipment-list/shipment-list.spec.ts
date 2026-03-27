import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ShipmentList } from './shipment-list';
import { ShipmentsService } from '../shipments.service';

describe('ShipmentList', () => {
  const findAllCalls: unknown[] = [];
  const navigateCalls: unknown[] = [];

  const shipmentsServiceMock = {
    findAll: (params: unknown) => {
      findAllCalls.push(params);
      return of({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    },
  };

  const routerMock = {
    navigate: (commands: unknown) => {
      navigateCalls.push(commands);
      return Promise.resolve(true);
    },
  };

  beforeEach(async () => {
    findAllCalls.length = 0;
    navigateCalls.length = 0;

    await TestBed.configureTestingModule({
      imports: [ShipmentList],
      providers: [
        {
          provide: ShipmentsService,
          useValue: shipmentsServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();
  });

  it('navigates to shipment details on view action', () => {
    const fixture = TestBed.createComponent(ShipmentList);
    const component = fixture.componentInstance;

    component.onViewDetails('SHP00001');

    expect(navigateCalls).toEqual([['/shipments', 'SHP00001']]);
  });
});
