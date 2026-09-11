import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ShipmentService } from './shipment.service';
import { API_CONFIG } from './api.config';
import {
  Shipment,
  ShipmentListResponse,
  VehicleAssignmentResponse,
} from '../../shared/models/shipment.models';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let httpController: HttpTestingController;

  const shipment: Shipment = {
    id: 'shipment-1',
    trackingCode: 'TRK-001',
    origin: 'Madrid',
    destination: 'Lisbon',
    recipient: 'Ada',
    phone: null,
    weight: 12.5,
    status: 'CREATED',
    deliveredAt: null,
    createdById: 'user-1',
    createdAt: '2026-09-11T00:00:00.000Z',
    updatedAt: '2026-09-11T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShipmentService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('sends list filters as query parameters', () => {
    const response: ShipmentListResponse = {
      data: [shipment],
      total: 1,
      page: 2,
      limit: 25,
    };
    let received: ShipmentListResponse | undefined;

    service
      .list({ page: 2, limit: 25, status: 'IN_TRANSIT' })
      .subscribe((value) => (received = value));

    const request = httpController.expectOne(
      (candidate) =>
        candidate.url === `${API_CONFIG.baseUrl}/shipments` &&
        candidate.params.get('page') === '2' &&
        candidate.params.get('limit') === '25' &&
        candidate.params.get('status') === 'IN_TRANSIT',
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
    expect(received).toEqual(response);
  });

  it('encodes shipment IDs in detail and mutation URLs', () => {
    service.getById('shipment/id').subscribe();
    const detailRequest = httpController.expectOne(
      `${API_CONFIG.baseUrl}/shipments/shipment%2Fid`,
    );
    expect(detailRequest.request.method).toBe('GET');
    detailRequest.flush({ shipment, events: [] });

    service
      .updateStatus('shipment/id', {
        status: 'IN_TRANSIT',
        location: 'Madrid',
      })
      .subscribe();
    const updateRequest = httpController.expectOne(
      `${API_CONFIG.baseUrl}/shipments/shipment%2Fid/status`,
    );
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual({
      status: 'IN_TRANSIT',
      location: 'Madrid',
    });
    updateRequest.flush({ ...shipment, status: 'IN_TRANSIT' });

    service.cancel('shipment/id').subscribe();
    const cancelRequest = httpController.expectOne(
      `${API_CONFIG.baseUrl}/shipments/shipment%2Fid`,
    );
    expect(cancelRequest.request.method).toBe('DELETE');
    cancelRequest.flush({ ...shipment, status: 'CANCELLED' });
  });

  it('posts vehicle assignment requests and returns the allocation', () => {
    const payload = {
      shipmentIds: ['5cc70dd4-0018-45b1-8d89-31982b075508'],
      vehicleCapacity: 20,
    };
    const response: VehicleAssignmentResponse = {
      vehicles: [
        {
          vehicleNumber: 1,
          shipments: [
            {
              shipmentId: payload.shipmentIds[0],
              trackingCode: shipment.trackingCode,
              weight: shipment.weight,
            },
          ],
          totalWeight: shipment.weight,
          remainingCapacity: 7.5,
        },
      ],
      totalVehiclesUsed: 1,
      totalWeight: shipment.weight,
    };
    let received: VehicleAssignmentResponse | undefined;

    service
      .assignVehicles(payload)
      .subscribe((value) => (received = value));

    const request = httpController.expectOne(
      `${API_CONFIG.baseUrl}/shipments/assign-vehicles`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(response);
    expect(received).toEqual(response);
  });
});
