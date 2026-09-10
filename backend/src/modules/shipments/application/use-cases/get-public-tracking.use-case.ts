import { Injectable, NotFoundException, Inject } from '@nestjs/common';

import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';
import { SHIPMENT_REPOSITORY } from '../../domain/repositories/shipment.repository';

import type { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';
import { SHIPMENT_EVENT_REPOSITORY } from '../../domain/repositories/shipment-event.repository';

@Injectable()
export class GetPublicTrackingUseCase {
    constructor(
        @Inject(SHIPMENT_REPOSITORY)
        private readonly shipmentRepository: ShipmentRepository,

        @Inject(SHIPMENT_EVENT_REPOSITORY)
        private readonly shipmentEventRepository: ShipmentEventRepository,
    ) {}

    async execute(trackingCode: string) {
        const shipment =
        await this.shipmentRepository.findByTrackingCode(trackingCode);

        if (!shipment) {
        throw new NotFoundException(
            `Shipment with tracking code ${trackingCode} not found`,
        );
        }

        const events =
        await this.shipmentEventRepository.findByShipmentId(shipment.id);

        return {
        shipment,
        events,
        };
    }
}