import { ShipmentEvent } from '../entities/shipment-event.entity';

export const SHIPMENT_EVENT_REPOSITORY = Symbol('SHIPMENT_EVENT_REPOSITORY');

export interface ShipmentEventRepository {
    create(event: ShipmentEvent): Promise<void>;
    findByShipmentId(shipmentId: string): Promise<ShipmentEvent[]>;
}