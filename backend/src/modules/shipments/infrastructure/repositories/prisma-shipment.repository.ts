import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Shipment } from '../../domain/entities/shipment.entity';
import {
  ShipmentFilters,
  PaginatedShipments,
  ShipmentRepository,
} from '../../domain/repositories/shipment.repository';
import { toDomain, toPrisma } from '../mappers/prisma-shipment.mapper';

@Injectable()
export class PrismaShipmentRepository implements ShipmentRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(shipment: Shipment): Promise<void> {
    const prismaShipment = toPrisma(shipment);
    await this.prisma.shipment.create({
      data: prismaShipment,
    });
  }

  async findById(id: string): Promise<Shipment | null> {
    const prismaShipment = await this.prisma.shipment.findUnique({
      where: { id },
    });
    if (!prismaShipment) {
      return null;
    }
    return toDomain(prismaShipment);
  }

  async findByTrackingCode(
    trackingCode: string,
  ): Promise<Shipment | null> {
    const prismaShipment = await this.prisma.shipment.findUnique({
      where: { trackingCode },
    });
    if (!prismaShipment) {
      return null;
    }
    return toDomain(prismaShipment);
  }

  async findAll(
    page: number,
    limit: number,
    filters?: ShipmentFilters,
  ): Promise<PaginatedShipments> {
    const skip = (page - 1) * limit;
    const where = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.origin && { origin: filters.origin }),
      ...(filters?.destination && { destination: filters.destination }),
    };

    const shipments = await this.prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.shipment.count({
      where,
    });

    const data = shipments.map(toDomain);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(shipment: Shipment): Promise<void> {
    const prismaShipment = toPrisma(shipment);
    await this.prisma.shipment.update({
      where: { id: prismaShipment.id },
      data: prismaShipment,
    });
  }
}