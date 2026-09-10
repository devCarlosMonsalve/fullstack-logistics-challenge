import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';
import { ShipmentEvent } from '../../domain/entities/shipment-event.entity';
import { PrismaShipmentEventMapper } from '../mappers/prisma-shipment-event.mapper';

import { $Enums } from '../../../../generated/prisma/client';

@Injectable()
export class PrismaShipmentEventRepository implements ShipmentEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(shipmentEvent: ShipmentEvent) : Promise<void> {
    await this.prisma.shipmentEvent.create({
      data: {
      id: shipmentEvent.id,
      shipmentId: shipmentEvent.shipmentId,
      status: shipmentEvent.status as $Enums.ShipmentStatus,
      timestamp: shipmentEvent.timestamp,
      userId: shipmentEvent.userId,
      location: shipmentEvent.location,
      notes: shipmentEvent.notes,
      },
    });
  }

  async findByShipmentId(shipmentId: string) : Promise<ShipmentEvent[]> {
    const prismaShipmentEvents = await this.prisma.shipmentEvent.findMany({
      where: { shipmentId },
      orderBy: { timestamp: 'asc' },
    });
    return prismaShipmentEvents.map(PrismaShipmentEventMapper.toDomain);
  }
}