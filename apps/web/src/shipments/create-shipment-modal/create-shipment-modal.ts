import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CreateShipmentPayload, ShipmentsService } from '../shipments.service';

interface CreateShipmentFormModel {
	origin: string;
	destination: string;
	addressee: string;
	phone: string;
	weight: number | null;
}

@Component({
	selector: 'app-create-shipment-modal',
	templateUrl: './create-shipment-modal.html',
	imports: [
		CommonModule,
		FormsModule,
		DialogModule,
		ButtonModule,
		InputTextModule,
		InputNumberModule,
	],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateShipmentModal {
	private readonly shipmentsService = inject(ShipmentsService);

	visible = input(false);
	visibleChange = output<boolean>();
	shipmentCreated = output<void>();

	isSubmitting = signal(false);
	errorMessage = signal('');

	form = signal<CreateShipmentFormModel>(this.createInitialForm());

	close(): void {
		this.errorMessage.set('');
		this.form.set(this.createInitialForm());
		this.visibleChange.emit(false);
	}

	onSubmit(): void {
		const form = this.form();

		if (!form.origin.trim() || !form.destination.trim() || !form.addressee.trim() || form.weight === null) {
			this.errorMessage.set('Please complete all required fields.');
			return;
		}

		const payload: CreateShipmentPayload = {
			origin: form.origin.trim(),
			destination: form.destination.trim(),
			addressee: form.addressee.trim(),
			weight: form.weight,
			phone: form.phone.trim() || undefined,
		};

		this.isSubmitting.set(true);
		this.errorMessage.set('');

		this.shipmentsService
			.create(payload)
			.pipe(finalize(() => this.isSubmitting.set(false)))
			.subscribe({
				next: () => {
					this.shipmentCreated.emit();
					this.close();
				},
				error: () => {
					this.errorMessage.set('Failed to create shipment. Please try again.');
				},
			});
	}

	updateField<K extends keyof CreateShipmentFormModel>(field: K, value: CreateShipmentFormModel[K]): void {
		this.form.update((current) => ({
			...current,
			[field]: value,
		}));
	}

	private createInitialForm(): CreateShipmentFormModel {
		return {
			origin: '',
			destination: '',
			addressee: '',
			phone: '',
			weight: null,
		};
	}
}
