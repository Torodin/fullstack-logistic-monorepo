import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { State } from '@fullstack-logistic-wrk/prisma';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { finalize, Observable } from 'rxjs';
import { ShipmentListResponse, ShipmentsService } from '../shipments.service';

@Component({
  selector: 'app-shipment-list',
  templateUrl: './shipment-list.html',
  styleUrl: './shipment-list.css',
  imports: [CommonModule, FormsModule, TableModule, PaginatorModule, TagModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentList {
  private readonly shipmentsService = inject(ShipmentsService);

  shipments$!: Observable<ShipmentListResponse>;
  totalRecords = signal(0);
  isLoading = signal(false);
  errorMessage = signal('');

  selectedState = signal<State | ''>('');
  page = signal(1);
  rows = signal(10);

  readonly stateOptions = [
    { label: 'All states', value: '' },
    { label: 'Created', value: State.CREATED },
    { label: 'In warehouse', value: State.IN_WAREHOUSE },
    { label: 'In transit', value: State.IN_TRANSIT },
    { label: 'In delivery', value: State.IN_DELIVERY },
    { label: 'Delivered', value: State.DELIVERED },
    { label: 'Returned', value: State.RETURNED },
    { label: 'Canceled', value: State.CANCELED },
  ];

  constructor() {
    this.loadShipments();
  }

  get first(): number {
    return (this.page() - 1) * this.rows();
  }

  onStateChange(value: string): void {
    this.selectedState.set((value as State | '') ?? '');
    this.page.set(1);
    this.loadShipments();
  }

  onPageChange(event: PaginatorState): void {
    const rows = event.rows ?? this.rows();
    const first = event.first ?? 0;

    this.rows.set(rows);
    this.page.set(Math.floor(first / rows) + 1);
    this.loadShipments();
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

  private loadShipments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.shipments$ = this.shipmentsService
      .findAll({
        page: this.page(),
        limit: this.rows(),
        state: this.selectedState() || undefined,
      });
    
    this.shipments$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ pagination }) => {
          this.totalRecords.set(pagination.total);
        },
        error: () => {
          this.totalRecords.set(0);
          this.errorMessage.set('Failed to load shipments. Please try again.');
        },
      });
  }
}
