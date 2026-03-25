import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':id')
  track(@Param('id') id: string) {
    return this.trackingService.trackShipment(id);
  }
}
