export interface ShipmentForAssignment {
    shipmentId: string;
    trackingCode: string;
    weight: number;
}

export interface VehicleForAssignment {
    vehicleNumber: number;
    shipments: ShipmentForAssignment[];
    totalWeight: number;
    remainingCapacity: number;
}

export class FirstFitDecreasingService {
    assign(
        shipments: ShipmentForAssignment[],
        vehicleCapacity: number
    ): VehicleForAssignment[] {
        const sortedShipments = [...shipments].sort((a, b) => b.weight - a.weight);
        const vehicles: VehicleForAssignment[] = [];

        for (const shipment of sortedShipments) {
            let assigned = false;
            for (const vehicle of vehicles) {
                if (vehicle.remainingCapacity >= shipment.weight) {
                    vehicle.shipments.push(shipment);
                    vehicle.totalWeight += shipment.weight;
                    vehicle.remainingCapacity -= shipment.weight;
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                vehicles.push({
                vehicleNumber: vehicles.length + 1,
                shipments: [shipment],
                totalWeight: shipment.weight,
                remainingCapacity: vehicleCapacity - shipment.weight,
                });
            }
        }

        return vehicles;
    }
}