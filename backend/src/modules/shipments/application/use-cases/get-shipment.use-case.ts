import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SHIPMENT_REPOSITORY } from '../../domain/repositories/shipment.repository';
import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';

import type { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';

import { SHIPMENT_EVENT_REPOSITORY } from '../../domain/repositories/shipment-event.repository';

@Injectable()
export class GetShipmentUseCase {
    constructor(
        @Inject(SHIPMENT_REPOSITORY)
        private readonly shipmentRepository: ShipmentRepository,
        @Inject(SHIPMENT_EVENT_REPOSITORY)
        private readonly shipmentEventRepository: ShipmentEventRepository,
    ) {}

    async execute(id: string) {
        const shipment = await this.shipmentRepository.findById(id);
        if (!shipment) {
            throw new NotFoundException(`Shipment with ID ${id} not found`);
        }
        const events  = await this.shipmentEventRepository.findByShipmentId(id);
        return {
            shipment,
            events,
        };
    }
}

