import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Shipment } from '../../domain/entities/shipment.entity';
import { ShipmentStatus } from '../../domain/shipment-status';

import {
  SHIPMENT_REPOSITORY,
} from '../../domain/repositories/shipment.repository';
import {
  SHIPMENT_EVENT_REPOSITORY,
} from '../../domain/repositories/shipment-event.repository';

import type { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';

import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';

import { ShipmentEvent } from '../../domain/entities/shipment-event.entity';

interface CreateShipmentInput {
  origin: string;
  destination: string;
  recipient: string;
  phone?: string;
  weight: number;
  createdById: string;
}

@Injectable()
export class CreateShipmentUseCase {
  constructor(
    @Inject(SHIPMENT_REPOSITORY)
    private readonly shipmentRepository: ShipmentRepository,
    @Inject(SHIPMENT_EVENT_REPOSITORY)
    private readonly shipmentEventRepository: ShipmentEventRepository,
  ) {}

  async execute(input: CreateShipmentInput): Promise<Shipment> {
    const id = randomUUID();
    const date = new Date();
    const yyyMMdd = date.toISOString().split('T')[0].replace(/-/g, '');

    const randomIdentifier = Math.random().toString(36).substring(2, 6).toUpperCase();

    const trackingCode = `ENV-${yyyMMdd}-${randomIdentifier}`;
    
    const shipment = new Shipment(
      id,
      trackingCode,
      input.origin,
      input.destination,
      input.recipient,
      input.phone ?? null,
      input.weight,
      ShipmentStatus.CREATED,
      null,
      input.createdById,
      date,
      date
    );

    await this.shipmentRepository.create(shipment);

    const event = ShipmentEvent.create(
      shipment.id,
      ShipmentStatus.CREATED,
      input.createdById
    );
    await this.shipmentEventRepository.create(event);

    return shipment;

  }
}