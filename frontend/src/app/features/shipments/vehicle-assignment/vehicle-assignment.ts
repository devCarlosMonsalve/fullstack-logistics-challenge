import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ShipmentService } from '../../../core/services/shipment.service';
import { VehicleAssignmentResponse } from '../../../shared/models/shipment.models';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-vehicle-assignment',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './vehicle-assignment.html',
  styleUrl: './vehicle-assignment.scss',
})
export class VehicleAssignmentComponent {
  private readonly shipmentService = inject(ShipmentService);

  protected readonly assignmentForm = new FormGroup({
    shipmentIds: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, shipmentIdsValidator],
    }),
    vehicleCapacity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });
  protected readonly result = signal<VehicleAssignmentResponse | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly displayedColumns = ['trackingCode', 'weight'];

  protected onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const value = this.assignmentForm.getRawValue();
    const shipmentIds = [
      ...new Set(
        value.shipmentIds
          .split(/[,\r\n]+/)
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ];

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.result.set(null);
    this.shipmentService
      .assignVehicles({
        shipmentIds,
        vehicleCapacity: value.vehicleCapacity!,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => this.result.set(response),
        error: (error: unknown) => {
          this.errorMessage.set(getErrorMessage(error));
        },
      });
  }
}

function shipmentIdsValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  const values = control.value
    .split(/[,\r\n]+/)
    .map((id) => id.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return { required: true };
  }

  return values.every((value) => UUID_PATTERN.test(value))
    ? null
    : { invalidShipmentIds: true };
}

function getErrorMessage(error: unknown): string {
  if (
    error instanceof HttpErrorResponse &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error
  ) {
    const message = error.error.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (Array.isArray(message)) {
      return message.filter((item) => typeof item === 'string').join(' ');
    }
  }

  return 'Unable to assign vehicles. Please try again.';
}
