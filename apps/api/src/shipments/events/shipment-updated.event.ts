export const SHIPMENT_UPDATED_EVENT = 'shipment.updated';

export type ShipmentUpdatedEventPayload = {
  shipmentId: string;
  userId: number;
  location: string;
  notes?: string;
};
