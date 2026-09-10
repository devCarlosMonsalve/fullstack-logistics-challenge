import { Shipment } from '../entities/shipment.entity';
import { ShipmentStatus } from '../shipment-status';

export const SHIPMENT_REPOSITORY = Symbol('SHIPMENT_REPOSITORY');

export interface ShipmentFilters {
  status?: ShipmentStatus;
  origin?: string;
  destination?: string;
}

export interface PaginatedShipments {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
}

export interface ShipmentRepository {
  create(shipment: Shipment): Promise<void>;

  findById(id: string): Promise<Shipment | null>;

  findByTrackingCode(trackingCode: string): Promise<Shipment | null>;

  findAll(
    page: number,
    limit: number,
    filters?: ShipmentFilters,
  ): Promise<PaginatedShipments>;

  update(shipment: Shipment): Promise<void>;
}