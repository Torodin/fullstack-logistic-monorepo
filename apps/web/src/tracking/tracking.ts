import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TrackingService } from './tracking.service';
import { Observable } from 'rxjs';
import { Event, State } from '@fullstack-logistic-wrk/prisma/generated';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-tracking',
    templateUrl: './tracking.html',
    imports: [CommonModule, FormsModule, PanelModule, CardModule, InputTextModule, ButtonModule, InputGroupModule],
    standalone: true,
})
export class Tracking {
    private readonly trackingService = inject(TrackingService);
    private readonly messageService = inject(MessageService);

    trackingCode = '';
    isLoading = false;
    trackingData$!: Observable<{ state: State; events: Event[] }>;

    onSubmit(): void {
        const normalizedCode = this.trackingCode.trim();

        if (!normalizedCode) {
            return;
        }

        this.trackingData$ = this.trackingService.getTrackingData(normalizedCode);

        this.trackingData$.subscribe({
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tracking data. Please try again later.' });
                this.isLoading = false;
            },
            complete: () => {
                this.isLoading = false;
            },
        });
    }
}
