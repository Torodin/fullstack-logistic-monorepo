import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { State } from '@fullstack-logistic-wrk/prisma/generated';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { finalize, Observable } from 'rxjs';
import { ShipmentListResponse, ShipmentsService } from '../shipments.service';
import { CreateShipmentModal } from '../create-shipment-modal/create-shipment-modal';

@Component({
  selector: 'app-shipment-list',
  templateUrl: './shipment-list.html',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    TagModule,
    SelectModule,
    ButtonModule,
    CreateShipmentModal,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentList {
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  shipmentsList$!: Observable<ShipmentListResponse>;
  totalRecords = signal(0);
  isLoading = signal(false);

  selectedState = signal<State | ''>('');
  showCreateModal = signal(false);
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

  onShipmentCreated(): void {
    this.page.set(1);
    this.loadShipments();
  }

  onViewDetails(id: string): void {
    this.router.navigate(['/shipments', id]);
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

    this.shipmentsList$ = this.shipmentsService
      .findAll({
        page: this.page(),
        limit: this.rows(),
        state: this.selectedState() || undefined,
      });
    
    this.shipmentsList$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ pagination }) => {
          this.totalRecords.set(pagination.total);
        },
        error: () => {
          this.totalRecords.set(0);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load shipments. Please try again.' });
        },
      });
  }
}
