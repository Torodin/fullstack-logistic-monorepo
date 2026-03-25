import { Injectable } from '@nestjs/common';
import { ShipmentsService } from '../shipments/shipments.service';

@Injectable()
export class TrackingService {
    constructor(
        private shipmentsService: ShipmentsService
    ) {}

    async trackShipment(id: string) {
        const shipment = await this.shipmentsService.findOne(id);

        return {
            state: shipment.state,
            events: shipment.events
        }
    }
}
