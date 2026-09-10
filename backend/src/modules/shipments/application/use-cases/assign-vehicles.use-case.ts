import {
    BadRequestException,
    Injectable,
    Inject,
    NotFoundException
} from '@nestjs/common';

import { SHIPMENT_REPOSITORY } from '../../domain/repositories/shipment.repository';
import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';
import { ShipmentStatus } from '../../domain/shipment-status';
import { FirstFitDecreasingService, ShipmentForAssignment } from '../../domain/services/first-fit-decreasing.service';

interface AssignVehiclesInput {
    shipmentIds: string[];
    vehicleCapacity: number;
}

@Injectable()
export class AssignVehiclesUseCase {
    constructor(
        @Inject(SHIPMENT_REPOSITORY)
        private readonly shipmentRepository: ShipmentRepository,
        private readonly firstFitDecreasingService: FirstFitDecreasingService
    ) {}

    async execute(input: AssignVehiclesInput) {
       const shipments: ShipmentForAssignment[] = [];

    for (const shipmentId of input.shipmentIds) {
      const shipment = await this.shipmentRepository.findById(shipmentId);

      if (!shipment) {
        throw new NotFoundException(
          `Shipment ${shipmentId} not found`,
        );
      }

      if (shipment.status !== ShipmentStatus.IN_WAREHOUSE) {
        throw new BadRequestException(
          `Shipment ${shipment.trackingCode} must be IN_WAREHOUSE`,
        );
      }

      if (shipment.weight > input.vehicleCapacity) {
        throw new BadRequestException(
          `Shipment ${shipment.trackingCode} with weight ${shipment.weight} exceeds vehicle capacity ${input.vehicleCapacity}`,
        );
      }

      shipments.push({
        shipmentId: shipment.id,
        trackingCode: shipment.trackingCode,
        weight: shipment.weight,
      });
    }

    const vehicles = this.firstFitDecreasingService.assign(
      shipments,
      input.vehicleCapacity,
    );

    const totalWeight = shipments.reduce(
      (total, shipment) => total + shipment.weight,
      0,
    );

    return {
      vehicles,
      totalVehiclesUsed: vehicles.length,
      totalWeight,
    };
  }
}