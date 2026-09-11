import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from './api.config';
import {
    CreateShipmentRequest,
    Shipment,
    ShipmentDetailResponse,
    ShipmentListQuery,
    ShipmentListResponse,
    UpdateShipmentStatusRequest,
    VehicleAssignmentRequest,
    VehicleAssignmentResponse,
} from '../../shared/models/shipment.models';

@Injectable({
    providedIn: 'root',
})
export class ShipmentService {
    constructor(private readonly http: HttpClient) {}

    create(request: CreateShipmentRequest): Observable<Shipment> {
        return this.http.post<Shipment>(`${API_CONFIG.baseUrl}/shipments`, request);
    }

    list(query: ShipmentListQuery = {}): Observable<ShipmentListResponse> {
        let params = new HttpParams();

        if (query.page !== undefined) {
            params = params.set('page', query.page);
        }
        if (query.limit !== undefined) {
            params = params.set('limit', query.limit);
        }
        if (query.status !== undefined) {
            params = params.set('status', query.status);
        }

        return this.http.get<ShipmentListResponse>(`${API_CONFIG.baseUrl}/shipments`, {
            params,
        });
    }

    getById(id: string): Observable<ShipmentDetailResponse> {
        return this.http.get<ShipmentDetailResponse>(
            `${API_CONFIG.baseUrl}/shipments/${encodeURIComponent(id)}`,
        );
    }

    updateStatus(
        id: string,
        request: UpdateShipmentStatusRequest,
    ): Observable<Shipment> {
        return this.http.patch<Shipment>(
            `${API_CONFIG.baseUrl}/shipments/${encodeURIComponent(id)}/status`,
            request,
        );
    }

    cancel(id: string): Observable<Shipment> {
        return this.http.delete<Shipment>(
            `${API_CONFIG.baseUrl}/shipments/${encodeURIComponent(id)}`,
        );
    }

    assignVehicles(
        request: VehicleAssignmentRequest,
    ): Observable<VehicleAssignmentResponse> {
        return this.http.post<VehicleAssignmentResponse>(
            `${API_CONFIG.baseUrl}/shipments/assign-vehicles`,
            request,
        );
    }
}
