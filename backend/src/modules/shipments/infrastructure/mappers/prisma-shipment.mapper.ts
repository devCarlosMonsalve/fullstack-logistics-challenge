import { Shipment } from '../../domain/entities/shipment.entity';
import { ShipmentStatus } from '../../domain/shipment-status';

export const toDomain = (prismaShipment: {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  recipient: string;
  phone: string | null;
  weight: { toNumber(): number };
  status: string;
  deliveredAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}): Shipment => {
  return new Shipment(
    prismaShipment.id,
    prismaShipment.trackingCode,
    prismaShipment.origin,
    prismaShipment.destination,
    prismaShipment.recipient,
    prismaShipment.phone,
    prismaShipment.weight.toNumber(),
    prismaShipment.status as ShipmentStatus,
    prismaShipment.deliveredAt,
    prismaShipment.createdById,
    prismaShipment.createdAt,
    prismaShipment.updatedAt,
  );
};

export const toPrisma = (shipment: Shipment) => {
  return {
    id: shipment.id,
    trackingCode: shipment.trackingCode,
    origin: shipment.origin,
    destination: shipment.destination,
    recipient: shipment.recipient,
    phone: shipment.phone ?? null,
    weight: shipment.weight,
    status: shipment.status,
    deliveredAt: shipment.deliveredAt,
    createdById: shipment.createdById,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  };
};