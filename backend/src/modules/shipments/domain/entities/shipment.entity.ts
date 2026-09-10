import { ShipmentStatus } from '../shipment-status';    

export class Shipment {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  recipient: string;
  phone: string | null;
  weight: number;
  status: ShipmentStatus;
  deliveredAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    trackingCode: string,
    origin: string,
    destination: string,
    recipient: string,
    phone: string | null,
    weight: number,
    status: ShipmentStatus,
    deliveredAt: Date | null,
    createdById: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.trackingCode = trackingCode;
    this.origin = origin;
    this.destination = destination;
    this.recipient = recipient;
    this.phone = phone;
    this.weight = weight;
    this.status = status;
    this.deliveredAt = deliveredAt;
    this.createdById = createdById;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}