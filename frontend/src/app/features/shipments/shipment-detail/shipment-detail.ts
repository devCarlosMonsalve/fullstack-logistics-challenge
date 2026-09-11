import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ShipmentService } from '../../../core/services/shipment.service';
import {
  ShipmentDetailResponse,
  ShipmentStatus,
  UpdateShipmentStatusRequest,
} from '../../../shared/models/shipment.models';

const ALLOWED_TRANSITIONS: Record<
  ShipmentStatus,
  readonly ShipmentStatus[]
> = {
  CREATED: ['IN_WAREHOUSE', 'CANCELLED'],
  IN_WAREHOUSE: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'RETURNED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED', 'CANCELLED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

@Component({
  selector: 'app-shipment-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './shipment-detail.html',
  styleUrl: './shipment-detail.scss',
})
export class ShipmentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shipmentService = inject(ShipmentService);
  private readonly snackBar = inject(MatSnackBar);
  private shipmentId = '';

  protected readonly detail = signal<ShipmentDetailResponse | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isActionLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly availableStatuses = computed(() => {
    const shipment = this.detail()?.shipment;
    return shipment ? ALLOWED_TRANSITIONS[shipment.status] : [];
  });
  protected readonly canCancel = computed(() => {
    const status = this.detail()?.shipment.status;
    return status !== undefined && status !== 'DELIVERED' && status !== 'CANCELLED';
  });
  protected readonly statusForm = new FormGroup({
    status: new FormControl<ShipmentStatus | null>(null, Validators.required),
    location: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('No shipment ID was provided.');
      return;
    }

    this.shipmentId = id;
    this.loadShipment();
  }

  protected loadShipment(): void {
    if (!this.shipmentId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.shipmentService
      .getById(this.shipmentId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.detail.set({
            shipment: response.shipment,
            events: [...response.events].sort(
              (left, right) =>
                new Date(left.timestamp).getTime() -
                  new Date(right.timestamp).getTime() ||
                left.id.localeCompare(right.id),
            ),
          });
          this.statusForm.reset({
            status: null,
            location: '',
            notes: '',
          });
        },
        error: (error: unknown) => {
          this.detail.set(null);
          this.errorMessage.set(getErrorMessage(error, 'load the shipment'));
        },
      });
  }

  protected updateStatus(): void {
    const status = this.statusForm.controls.status.value;
    if (status === null) {
      this.statusForm.controls.status.markAsTouched();
      return;
    }

    if (!this.availableStatuses().includes(status)) {
      this.actionError.set('That status transition is not allowed.');
      return;
    }

    const location = this.statusForm.controls.location.value.trim();
    const notes = this.statusForm.controls.notes.value.trim();
    const request: UpdateShipmentStatusRequest = {
      status,
      ...(location ? { location } : {}),
      ...(notes ? { notes } : {}),
    };

    this.actionError.set(null);
    this.isActionLoading.set(true);
    this.shipmentService
      .updateStatus(this.shipmentId, request)
      .pipe(finalize(() => this.isActionLoading.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Shipment status updated.', 'Close', {
            duration: 4000,
          });
          this.loadShipment();
        },
        error: (error: unknown) => {
          this.actionError.set(
            getErrorMessage(error, 'update the shipment status'),
          );
        },
      });
  }

  protected cancelShipment(): void {
    if (!this.canCancel()) {
      return;
    }

    this.actionError.set(null);
    this.isActionLoading.set(true);
    this.shipmentService
      .cancel(this.shipmentId)
      .pipe(finalize(() => this.isActionLoading.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Shipment cancelled.', 'Close', {
            duration: 4000,
          });
          this.loadShipment();
        },
        error: (error: unknown) => {
          this.actionError.set(getErrorMessage(error, 'cancel the shipment'));
        },
      });
  }

  protected formatStatus(status: ShipmentStatus): string {
    return status.replaceAll('_', ' ');
  }
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
