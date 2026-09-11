import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';

import { TrackingService } from '../../../core/services/tracking.service';
import {
  ShipmentDetailResponse,
  ShipmentStatus,
} from '../../../shared/models/shipment.models';

const TRACKING_CODE_PATTERN = /^ENV-\d{8}-[A-Z0-9]{4}$/;

@Component({
  selector: 'app-public-tracking',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './public-tracking.html',
  styleUrl: './public-tracking.scss',
})
export class PublicTracking implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly trackingService = inject(TrackingService);
  private readonly destroyRef = inject(DestroyRef);
  private lookupSubscription?: Subscription;

  protected readonly trackingCode = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(TRACKING_CODE_PATTERN),
    ],
  });
  protected readonly detail = signal<ShipmentDetailResponse | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const trackingCode = normalizeTrackingCode(
          params.get('trackingCode') ?? '',
        );
        this.trackingCode.setValue(trackingCode);

        if (this.trackingCode.invalid) {
          this.lookupSubscription?.unsubscribe();
          this.detail.set(null);
          this.errorMessage.set(null);
          this.isLoading.set(false);
          this.trackingCode.markAsTouched();
          return;
        }

        this.loadTracking(trackingCode);
      });
  }

  protected submit(): void {
    const trackingCode = normalizeTrackingCode(this.trackingCode.value);
    this.trackingCode.setValue(trackingCode);

    if (this.trackingCode.invalid) {
      this.trackingCode.markAsTouched();
      return;
    }

    void this.router.navigate(['/tracking', trackingCode]);
  }

  protected retry(): void {
    if (this.trackingCode.valid) {
      this.loadTracking(this.trackingCode.value);
    }
  }

  protected formatStatus(status: ShipmentStatus): string {
    return status.replaceAll('_', ' ');
  }

  private loadTracking(trackingCode: string): void {
    this.lookupSubscription?.unsubscribe();
    this.detail.set(null);
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.lookupSubscription = this.trackingService
      .getByTrackingCode(trackingCode)
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
        },
        error: (error: unknown) => {
          this.errorMessage.set(getTrackingError(error, trackingCode));
        },
      });
  }
}

function normalizeTrackingCode(value: string): string {
  return value.trim().toUpperCase();
}

function getTrackingError(error: unknown, trackingCode: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Unable to retrieve tracking information. Please try again.';
  }

  switch (error.status) {
    case 0:
      return 'Unable to connect to the tracking service. Check your connection and try again.';
    case 404:
      return `No shipment was found for ${trackingCode}. Check the tracking code and try again.`;
    case 429:
      return 'Too many tracking requests. Please wait a moment and try again.';
    default:
      return 'Unable to retrieve tracking information. Please try again.';
  }
}
