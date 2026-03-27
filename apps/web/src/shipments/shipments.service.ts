import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, Shipment, State } from '@fullstack-logistic-wrk/prisma/generated';

export interface ShipmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShipmentListResponse {
  data: Shipment[];
  pagination: ShipmentPagination;
}

export type ShipmentDetailsResponse = Shipment & {
  events: Event[];
};

export interface FindShipmentsParams {
  page: number;
  limit: number;
  state?: State | null;
}

export interface CreateShipmentPayload {
  origin: string;
  destination: string;
  addressee: string;
  phone?: string;
  weight: number;
}

export interface UpdateShipmentPayload {
  state: State;
  location: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShipmentsService {
  private readonly http = inject(HttpClient);

  findAll(params: FindShipmentsParams) {
    let queryParams = new HttpParams()
      .set('page', params.page)
      .set('limit', params.limit);

    if (params.state) {
      queryParams = queryParams.set('state', params.state);
    }

    return this.http.get<ShipmentListResponse>('api/shipments', {
      params: queryParams,
    });
  }

  create(payload: CreateShipmentPayload) {
    return this.http.post<Shipment>('api/shipments', payload);
  }

  update(id: string, payload: UpdateShipmentPayload) {
    return this.http.patch<Shipment>(`api/shipments/${encodeURIComponent(id)}/status`, payload);
  }

  findOne(id: string) {
    return this.http.get<ShipmentDetailsResponse>(`api/shipments/${encodeURIComponent(id)}`);
  }
}
