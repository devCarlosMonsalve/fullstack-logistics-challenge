import { randomUUID } from 'crypto';
import { ShipmentStatus } from '../shipment-status';

export class ShipmentEvent {
  constructor(
    public readonly id: string,
    public readonly shipmentId: string,
    public readonly status: ShipmentStatus,
    public readonly timestamp: Date,
    public readonly userId: string,
    public readonly location: string | null,
    public readonly notes: string | null,
  ) {}

  static create(
    shipmentId: string,
    status: ShipmentStatus,
    userId: string,
    location: string | null = null,
    notes: string | null = null,
  ): ShipmentEvent {
    return new ShipmentEvent(
        randomUUID(), 
        shipmentId, 
        status, 
        new Date(), 
        userId, 
        location, 
        notes);
  }
}