import { ShipmentEvent as PrismaShipmentEvent } from '../../../../generated/prisma/client';
import { ShipmentStatus  } from '../../domain/shipment-status';
import { ShipmentEvent   } from '../../domain/entities/shipment-event.entity';

export class PrismaShipmentEventMapper {
  static toDomain(prismaShipmentEvent: PrismaShipmentEvent): ShipmentEvent {
    return new ShipmentEvent(
      prismaShipmentEvent.id,
      prismaShipmentEvent.shipmentId,
      prismaShipmentEvent.status as ShipmentStatus,
      prismaShipmentEvent.timestamp,
      prismaShipmentEvent.userId,
      prismaShipmentEvent.location,
      prismaShipmentEvent.notes,
    );
  }

  static toPrisma(shipmentEvent: ShipmentEvent) {
    return {
      id: shipmentEvent.id,
      shipmentId: shipmentEvent.shipmentId,
      status: shipmentEvent.status,
      timestamp: shipmentEvent.timestamp,
      userId: shipmentEvent.userId,
      location: shipmentEvent.location,
      notes: shipmentEvent.notes,
    };
  }
}