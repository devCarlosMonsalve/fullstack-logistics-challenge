import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SHIPMENT_REPOSITORY } from '../../domain/repositories/shipment.repository';
import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';
import type { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';
import { SHIPMENT_EVENT_REPOSITORY } from '../../domain/repositories/shipment-event.repository';
import { ShipmentEvent } from '../../domain/entities/shipment-event.entity';
import { ShipmentStatus } from '../../domain/shipment-status';

interface UpdateShipmentStatusInput {
    id: string;
    status: ShipmentStatus;
    userId: string;
    location?: string;
    notes?: string;
}

const allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
    [ShipmentStatus.CREATED]: [
        ShipmentStatus.IN_WAREHOUSE,
        ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.IN_WAREHOUSE]: [
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.IN_TRANSIT]: [
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.RETURNED,
        ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.OUT_FOR_DELIVERY]: [
        ShipmentStatus.DELIVERED,
        ShipmentStatus.RETURNED,
        ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.DELIVERED]: [],
    [ShipmentStatus.RETURNED]: [],
    [ShipmentStatus.CANCELLED]: [],
};

@Injectable()
export class UpdateShipmentStatusUseCase {
    constructor(
        @Inject(SHIPMENT_REPOSITORY)
        private readonly shipmentRepository: ShipmentRepository,
        @Inject(SHIPMENT_EVENT_REPOSITORY)
        private readonly shipmentEventRepository: ShipmentEventRepository,
    ) {}
    async execute(input: UpdateShipmentStatusInput) {
        const shipment = await this.shipmentRepository.findById(input.id);
        if (!shipment) {
            throw new NotFoundException('Shipment not found');
        }

        const allowedNextStatuses = allowedTransitions[shipment.status];
        if (!allowedNextStatuses.includes(input.status)) {
            throw new BadRequestException(`Cannot transition from ${shipment.status} to ${input.status}`);
        }

        shipment.status = input.status;
        shipment.updatedAt = new Date();

        if(input.status === ShipmentStatus.DELIVERED){
            shipment.deliveredAt = new Date();
        }
        await this.shipmentRepository.update(shipment);

        const event = ShipmentEvent.create(
            shipment.id,
            input.status,
            input.userId,
            input.location ?? null,
            input.notes ?? null,
        );

        await this.shipmentEventRepository.create(event);

        return shipment;
    }
}