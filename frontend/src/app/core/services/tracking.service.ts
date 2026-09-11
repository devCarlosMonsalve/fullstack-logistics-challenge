import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';
import { ShipmentDetailResponse } from '../../shared/models/shipment.models';

@Injectable({
    providedIn: 'root',
})
export class TrackingService {
    constructor(private readonly http: HttpClient) {}

    getByTrackingCode(trackingCode: string): Observable<ShipmentDetailResponse> {
        return this.http.get<ShipmentDetailResponse>(
            `${API_CONFIG.baseUrl}/tracking/${encodeURIComponent(trackingCode)}`,
        );
    }
}
