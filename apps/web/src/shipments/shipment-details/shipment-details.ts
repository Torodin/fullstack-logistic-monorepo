import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, State } from '@fullstack-logistic-wrk/prisma/generated';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ShipmentDetailsResponse, ShipmentsService } from '../shipments.service';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.html',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule, FieldsetModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shipmentsService = inject(ShipmentsService);

  shipment = signal<ShipmentDetailsResponse | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id')?.trim() ?? '';

      if (!id) {
        this.shipment.set(null);
        this.errorMessage.set('Invalid shipment id.');
        this.isLoading.set(false);
        return;
      }

      this.loadShipment(id);
    });
  }

  goBack(): void {
    this.router.navigate(['/shipments']);
  }

  formatState(state: State): string {
    return state.replace(/_/g, ' ');
  }

  stateSeverity(state: State): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (state) {
      case State.DELIVERED:
        return 'success';
      case State.RETURNED:
      case State.CANCELED:
        return 'danger';
      case State.IN_DELIVERY:
      case State.IN_TRANSIT:
        return 'info';
      case State.IN_WAREHOUSE:
        return 'warn';
      case State.CREATED:
      default:
        return 'secondary';
    }
  }

  private loadShipment(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.shipmentsService
      .findOne(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (shipment) => {
          if (!shipment) {
            this.shipment.set(null);
            this.errorMessage.set('Shipment not found.');
            return;
          }

          this.shipment.set({
            ...shipment,
            events: this.sortEventsByDateDesc(shipment.events),
          });
        },
        error: () => {
          this.shipment.set(null);
          this.errorMessage.set('Failed to load shipment details. Please try again.');
        },
      });
  }

  private sortEventsByDateDesc(events: Event[]): Event[] {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
