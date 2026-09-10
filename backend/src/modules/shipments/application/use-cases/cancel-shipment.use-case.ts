import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';
import { SHIPMENT_REPOSITORY } from '../../domain/repositories/shipment.repository';

import type { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';
import { SHIPMENT_EVENT_REPOSITORY } from '../../domain/repositories/shipment-event.repository';

import { ShipmentEvent } from '../../domain/entities/shipment-event.entity';
import { ShipmentStatus } from '../../domain/shipment-status';

@Injectable()
    export class CancelShipmentUseCase {
    constructor(
        @Inject(SHIPMENT_REPOSITORY)
        private readonly shipmentRepository: ShipmentRepository,

        @Inject(SHIPMENT_EVENT_REPOSITORY)
        private readonly shipmentEventRepository: ShipmentEventRepository,
    ) {}

    async execute({
        id,
        userId,
    }: {
        id: string;
        userId: string;
    }) {
        const shipment = await this.shipmentRepository.findById(id);

        if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`);
        }

        if (shipment.status === ShipmentStatus.DELIVERED) {
        throw new BadRequestException(
            'A delivered shipment cannot be cancelled',
        );
        }

        shipment.status = ShipmentStatus.CANCELLED;
        shipment.updatedAt = new Date();

        await this.shipmentRepository.update(shipment);

        const event = ShipmentEvent.create(
        shipment.id,
        ShipmentStatus.CANCELLED,
        userId,
        );

        await this.shipmentEventRepository.create(event);

        return shipment;
    }
}