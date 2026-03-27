import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { Shipment, State } from '@fullstack-logistic-wrk/prisma/generated';
import {
  AssignVehiclesPayload,
  ShipmentsService,
  VehicleAssignationResponse,
  VehicleAssignment,
} from '../shipments.service';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-vehicle-assignation',
  templateUrl: './vehicle-assignation.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputNumberModule, CardModule, ProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleAssignation {
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly messageService = inject(MessageService);

  readonly shipments = signal<Shipment[]>([]);
  readonly selectedShipments = signal<Shipment[]>([]);
  readonly vehicleCapacity = signal<number | null>(null);
  readonly isLoadingShipments = signal(false);
  readonly isAssigning = signal(false);
  readonly result = signal<VehicleAssignationResponse | null>(null);

  readonly canAssign = computed(
    () =>
      this.selectedShipments().length > 0 &&
      (this.vehicleCapacity() ?? 0) > 0 &&
      !this.isAssigning(),
  );

  constructor() {
    this.loadShipments();
  }

  onSelectionChange(selection: Shipment[]): void {
    this.selectedShipments.set(selection);
    this.result.set(null);
  }

  onCapacityChange(value: number | null): void {
    this.vehicleCapacity.set(value);
    this.result.set(null);
  }

  onAssign(): void {
    const capacity = this.vehicleCapacity();
    const selected = this.selectedShipments();
    if (!capacity || selected.length === 0) return;

    const payload: AssignVehiclesPayload = {
      shipmentIds: selected.map((s) => s.id),
      vehicleCapacity: capacity,
    };

    this.isAssigning.set(true);
    this.shipmentsService
      .assignVehicles(payload)
      .pipe(finalize(() => this.isAssigning.set(false)))
      .subscribe({
        next: (response) => this.result.set(response),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Assignation failed',
            detail:
              'Could not assign vehicles. Verify the capacity is sufficient for all selected shipments.',
          });
        },
      });
  }

  getLoadPercent(vehicle: VehicleAssignment): number {
    const capacity = this.vehicleCapacity() ?? 1;
    return Math.min(Math.round((vehicle.totalWeight / capacity) * 100), 100);
  }

  getLoadBarColor(vehicle: VehicleAssignment): string {
    const percent = this.getLoadPercent(vehicle);
    if (percent >= 90) return 'red';
    if (percent >= 70) return 'orange';
    return 'light-green';
  }

  private loadShipments(): void {
    this.isLoadingShipments.set(true);
    this.shipmentsService
      .findAll({ page: 1, limit: 100, state: State.IN_WAREHOUSE })
      .pipe(finalize(() => this.isLoadingShipments.set(false)))
      .subscribe({
        next: ({ data }) => this.shipments.set(data),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load shipments.',
          });
        },
      });
  }
}
