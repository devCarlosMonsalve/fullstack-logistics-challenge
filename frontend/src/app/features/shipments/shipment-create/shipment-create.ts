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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ShipmentService } from '../../../core/services/shipment.service';
import { CreateShipmentRequest } from '../../../shared/models/shipment.models';

@Component({
  selector: 'app-shipment-create',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './shipment-create.html',
  styleUrl: './shipment-create.scss',
})
export class ShipmentCreate {
  private readonly shipmentService = inject(ShipmentService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly shipmentForm = new FormGroup({
    origin: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank],
    }),
    destination: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank],
    }),
    recipient: new FormControl('', {
      nonNullable: true,
      validators: [nonBlank],
    }),
    phone: new FormControl('', { nonNullable: true }),
    weight: new FormControl<number | null>(null, {
      validators: [Validators.required, nonNegativeNumber],
    }),
  });
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(): void {
    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }

    const value = this.shipmentForm.getRawValue();
    const phone = value.phone.trim();
    const request: CreateShipmentRequest = {
      origin: value.origin.trim(),
      destination: value.destination.trim(),
      recipient: value.recipient.trim(),
      weight: value.weight!,
      ...(phone ? { phone } : {}),
    };

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.shipmentService
      .create(request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (shipment) => {
          this.snackBar.open('Shipment created successfully.', 'Close', {
            duration: 4000,
          });
          void this.router.navigate(['/shipments', shipment.id]);
        },
        error: (error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'create the shipment'));
        },
      });
  }
}

function nonNegativeNumber(
  control: AbstractControl<number | null>,
): ValidationErrors | null {
  return control.value !== null && control.value >= 0
    ? null
    : { nonNegative: true };
}

function nonBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

function getErrorMessage(error: unknown, action: string): string {
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

  return `Unable to ${action}. Please try again.`;
}
