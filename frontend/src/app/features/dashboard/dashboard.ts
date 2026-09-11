import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { ShipmentService } from '../../core/services/shipment.service';
import {
  Shipment,
  ShipmentStatus,
} from '../../shared/models/shipment.models';

const STATUSES: readonly ShipmentStatus[] = [
  'CREATED',
  'IN_WAREHOUSE',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
];

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly shipmentService = inject(ShipmentService);

  protected readonly shipments = signal<Shipment[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly statusSummary = computed(() =>
    STATUSES.map((status) => ({
      status,
      count: this.shipments().filter((shipment) => shipment.status === status)
        .length,
    })),
  );

  ngOnInit(): void {
    this.loadSummary();
  }

  protected loadSummary(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.shipmentService
      .list({ page: 1, limit: 50 })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.shipments.set(response.data);
          this.total.set(response.total);
          this.page.set(response.page);
        },
        error: (error: unknown) => {
          this.shipments.set([]);
          this.total.set(0);
          this.errorMessage.set(getErrorMessage(error));
        },
      });
  }

  protected formatStatus(status: ShipmentStatus): string {
    return status.replaceAll('_', ' ');
  }
}

function getErrorMessage(error: unknown): string {
  if (
    error instanceof HttpErrorResponse &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error &&
    typeof error.error.message === 'string' &&
    error.error.message.trim()
  ) {
    return error.error.message;
  }

  return 'Unable to load the shipment summary. Please try again.';
}
