import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingService } from './tracking.service';
import { Observable } from 'rxjs';
import { Event, State } from '@fullstack-logistic-wrk/prisma';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.html',
    imports: [CommonModule, FormsModule, PanelModule, CardModule, InputTextModule, ButtonModule, InputGroupModule],
    standalone: true,
})
export class Tracking {
    private readonly trackingService = inject(TrackingService);

    trackingCode = '';
    isLoading = false;
    errorMessage = '';
    trackingData$!: Observable<{ state: State; events: Event[] }>;

    onSubmit(): void {
        const normalizedCode = this.trackingCode.trim();

        if (!normalizedCode) {
            return;
        }

        this.trackingData$ = this.trackingService.getTrackingData(normalizedCode);

        this.trackingData$.subscribe({
            error: () => {
                this.errorMessage = 'Failed to fetch tracking data. Please try again later.';
                this.isLoading = false;
            },
            complete: () => {
                this.isLoading = false;
            },
        });
    }
}
