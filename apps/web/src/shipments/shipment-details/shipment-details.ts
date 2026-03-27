import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STATE_TRANSITIONS } from '@fullstack-logistic-wrk/domain-constants';
import { Event, State } from '@fullstack-logistic-wrk/prisma/generated';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ShipmentDetailsResponse, ShipmentsService, UpdateShipmentPayload } from '../shipments.service';

interface StateOption {
  label: string;
  value: State;
}

interface ShipmentStateFormModel {
  state: State | null;
  location: string;
  notes: string;
}

@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
    FieldsetModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly messageService = inject(MessageService);

  shipment = signal<ShipmentDetailsResponse | null>(null);
  isLoading = signal(true);
  showStateModal = signal(false);
  isUpdatingState = signal(false);
  stateForm = signal<ShipmentStateFormModel>(this.createInitialStateForm());

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id')?.trim() ?? '';

      if (!id) {
        this.shipment.set(null);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid shipment id.' });
        this.isLoading.set(false);
        return;
      }

      this.loadShipment(id);
    });
  }

  goBack(): void {
    this.router.navigate(['/shipments']);
  }

  openStateModal(): void {
    const nextStates = this.availableNextStates();

    if (!this.shipment() || !nextStates.length) {
      return;
    }

    this.stateForm.set({
      state: nextStates[0],
      location: '',
      notes: '',
    });
    this.showStateModal.set(true);
  }

  closeStateModal(): void {
    if (this.isUpdatingState()) {
      return;
    }

    this.resetStateModal();
  }

  availableNextStates(): State[] {
    const currentState = this.shipment()?.state;

    if (!currentState) {
      return [];
    }

    return STATE_TRANSITIONS[currentState] ?? [];
  }

  availableStateOptions(): StateOption[] {
    return this.availableNextStates().map((state) => ({
      label: this.formatState(state),
      value: state,
    }));
  }

  canChangeState(): boolean {
    return !!this.shipment() && !this.isLoading() && this.availableNextStates().length > 0;
  }

  canSubmitStateChange(): boolean {
    const form = this.stateForm();

    return !!form.state && !!form.location.trim() && !this.isUpdatingState();
  }

  submitStateChange(): void {
    const currentShipment = this.shipment();
    const form = this.stateForm();

    if (!currentShipment) {
      return;
    }

    if (!form.state || !this.availableNextStates().includes(form.state)) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Select a valid next state.' });
      return;
    }

    const location = form.location.trim();
    if (!location) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Location is required.' });
      return;
    }

    const payload: UpdateShipmentPayload = {
      state: form.state,
      location,
      notes: form.notes.trim() || undefined,
    };

    this.isUpdatingState.set(true);

    this.shipmentsService
      .update(currentShipment.id, payload)
      .pipe(finalize(() => this.isUpdatingState.set(false)))
      .subscribe({
        next: () => {
          this.resetStateModal();
          this.loadShipment(currentShipment.id);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update shipment state. Please try again.' });
        },
      });
  }

  updateState(state: State | null): void {
    this.stateForm.update((current) => ({
      ...current,
      state,
    }));
  }

  updateLocation(location: string): void {
    this.stateForm.update((current) => ({
      ...current,
      location,
    }));
  }

  updateNotes(notes: string): void {
    this.stateForm.update((current) => ({
      ...current,
      notes,
    }));
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

    this.shipmentsService
      .findOne(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (shipment) => {
          if (!shipment) {
            this.shipment.set(null);
            this.messageService.add({ severity: 'warn', summary: 'Not found', detail: 'Shipment not found.' });
            return;
          }

          this.shipment.set({
            ...shipment,
            events: this.sortEventsByDateDesc(shipment.events),
          });
        },
        error: () => {
          this.shipment.set(null);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load shipment details. Please try again.' });
        },
      });
  }

  private sortEventsByDateDesc(events: Event[]): Event[] {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private createInitialStateForm(): ShipmentStateFormModel {
    return {
      state: null,
      location: '',
      notes: '',
    };
  }

  private resetStateModal(): void {
    this.showStateModal.set(false);
    this.stateForm.set(this.createInitialStateForm());
  }
}
