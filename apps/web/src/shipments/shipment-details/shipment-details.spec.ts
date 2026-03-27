import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { State } from '@fullstack-logistic-wrk/prisma/generated';
import { ShipmentDetails } from './shipment-details';
import { ShipmentsService } from '../shipments.service';

describe('ShipmentDetails', () => {
  const findOneCalls: string[] = [];
  const updateCalls: Array<{ id: string; payload: unknown }> = [];
  const navigateCalls: unknown[] = [];
  let shouldFailUpdate = false;

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
    update: (id: string, payload: unknown) => {
      updateCalls.push({ id, payload });

      if (shouldFailUpdate) {
        return throwError(() => new Error('Update failed'));
      }

      return of({ ...defaultShipment, state: (payload as { state: State }).state });
    },
  };

  const routerMock = {
    navigate: (commands: unknown) => {
      navigateCalls.push(commands);
      return Promise.resolve(true);
    },
  };

  beforeEach(async () => {
    shouldFailUpdate = false;
    findOneCalls.length = 0;
    updateCalls.length = 0;
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

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
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

  it('derives valid next states from shared transitions', () => {
    const fixture = TestBed.createComponent(ShipmentDetails);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.availableNextStates()).toEqual([
      State.IN_DELIVERY,
      State.RETURNED,
      State.CANCELED,
    ]);
  });

  it('updates shipment state and reloads shipment details', () => {
    const fixture = TestBed.createComponent(ShipmentDetails);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.openStateModal();
    component.updateState(State.IN_DELIVERY);
    component.updateLocation('Barcelona Distribution Center');
    component.updateNotes('Out for local delivery');
    component.submitStateChange();

    expect(updateCalls).toEqual([
      {
        id: 'SHP00001',
        payload: {
          state: State.IN_DELIVERY,
          location: 'Barcelona Distribution Center',
          notes: 'Out for local delivery',
        },
      },
    ]);
    expect(findOneCalls).toEqual(['SHP00001', 'SHP00001']);
    expect(component.showStateModal()).toBe(false);
    expect(component.updateErrorMessage()).toBe('');
  });

  it('shows an error when state update fails', () => {
    shouldFailUpdate = true;
    const fixture = TestBed.createComponent(ShipmentDetails);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.openStateModal();
    component.updateState(State.IN_DELIVERY);
    component.updateLocation('Barcelona Distribution Center');
    component.submitStateChange();

    expect(updateCalls).toHaveLength(1);
    expect(component.showStateModal()).toBe(true);
    expect(component.updateErrorMessage()).toBe('Failed to update shipment state. Please try again.');
  });
});
