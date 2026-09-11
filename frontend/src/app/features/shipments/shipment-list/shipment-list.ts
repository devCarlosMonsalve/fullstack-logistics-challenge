import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ShipmentService } from '../../../core/services/shipment.service';
import {
  Shipment,
  ShipmentListQuery,
  ShipmentStatus,
} from '../../../shared/models/shipment.models';

const SHIPMENT_STATUSES: readonly ShipmentStatus[] = [
  'CREATED',
  'IN_WAREHOUSE',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
];

@Component({
  selector: 'app-shipment-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './shipment-list.html',
  styleUrl: './shipment-list.scss',
})
export class ShipmentList implements OnInit {
  private readonly shipmentService = inject(ShipmentService);

  protected readonly displayedColumns = [
    'trackingCode',
    'recipient',
    'destination',
    'status',
    'createdAt',
  ];
  protected readonly statuses = SHIPMENT_STATUSES;
  protected readonly statusFilter = new FormControl<ShipmentStatus | ''>('', {
    nonNullable: true,
  });
  protected readonly shipments = signal<Shipment[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadShipments();
  }

  protected onFilterChange(): void {
    this.pageIndex.set(0);
    this.loadShipments();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadShipments();
  }

  protected loadShipments(): void {
    const query: ShipmentListQuery = {
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
    };
    const status = this.statusFilter.value;
    if (status !== '') {
      query.status = status;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.shipmentService
      .list(query)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.shipments.set(response.data);
          this.total.set(response.total);
          this.pageIndex.set(Math.max(response.page - 1, 0));
          this.pageSize.set(response.limit);
        },
        error: (error: unknown) => {
          this.shipments.set([]);
          this.total.set(0);
          this.errorMessage.set(getErrorMessage(error, 'load shipments'));
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
