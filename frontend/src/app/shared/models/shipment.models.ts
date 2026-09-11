export type ShipmentStatus =
    | 'CREATED'
    | 'IN_WAREHOUSE'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'RETURNED'
    | 'CANCELLED';

export interface Shipment {
    id: string;
    trackingCode: string;
    origin: string;
    destination: string;
    recipient: string;
    phone: string | null;
    weight: number;
    status: ShipmentStatus;
    deliveredAt: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShipmentEvent {
    id: string;
    shipmentId: string;
    status: ShipmentStatus;
    timestamp: string;
    userId: string;
    location: string | null;
    notes: string | null;
}

export interface CreateShipmentRequest {
    origin: string;
    destination: string;
    recipient: string;
    phone?: string;
    weight: number;
}

export interface UpdateShipmentStatusRequest {
    status: ShipmentStatus;
    location?: string;
    notes?: string;
}

export interface ShipmentListQuery {
    page?: number;
    limit?: number;
    status?: ShipmentStatus;
}

export interface ShipmentListResponse {
    data: Shipment[];
    total: number;
    page: number;
    limit: number;
}

export interface ShipmentDetailResponse {
    shipment: Shipment;
    events: ShipmentEvent[];
}

export interface VehicleAssignmentRequest {
    shipmentIds: string[];
    vehicleCapacity: number;
}

export interface AssignedShipment {
    shipmentId: string;
    trackingCode: string;
    weight: number;
}

export interface VehicleAssignment {
    vehicleNumber: number;
    shipments: AssignedShipment[];
    totalWeight: number;
    remainingCapacity: number;
}

export interface VehicleAssignmentResponse {
    vehicles: VehicleAssignment[];
    totalVehiclesUsed: number;
    totalWeight: number;
}
