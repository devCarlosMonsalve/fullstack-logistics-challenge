import { Inject, Injectable } from '@nestjs/common';

import { 
    PaginatedShipments,
    SHIPMENT_REPOSITORY,
} from '../../domain/repositories/shipment.repository';
import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';

import { ShipmentStatus } from '../../domain/shipment-status';

interface ListShipmentsInput {
    page: number;
    limit: number;
    status?: ShipmentStatus;
}

@Injectable()
export class ListShipmentsUseCase {
    constructor(
        @Inject(SHIPMENT_REPOSITORY)
        private readonly shipmentRepository: ShipmentRepository,
    ) {}

    async execute(input: ListShipmentsInput): Promise<PaginatedShipments> {
        return this.shipmentRepository.findAll(
            input.page,
            input.limit,
            input.status ? { status: input.status } : undefined
        );
    }
}