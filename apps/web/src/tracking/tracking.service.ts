import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event, State } from '@fullstack-logistic-wrk/prisma/generated';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  private readonly http = inject(HttpClient);

  getTrackingData(trackingCode: string) {
    return this.http.get<{state: State, events: Event[]}>(`api/tracking/${encodeURIComponent(trackingCode)}`);
  }
}
