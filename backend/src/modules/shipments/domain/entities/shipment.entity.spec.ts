import { Shipment } from './shipment.entity';
import { ShipmentStatus } from '../shipment-status';

describe('Shipment', () => {
    it('should create a shipment with the provided data', () => {
        const createdAt = new Date();
        const updatedAt = new Date();

        const shipment = new Shipment(
        'shipment-1',
        'ENV-20260911-TEST',
        'Madrid',
        'Barcelona',
        'Carlos Test',
        '600123456',
        5.5,
        ShipmentStatus.CREATED,
        null,
        'user-1',
        createdAt,
        updatedAt,
        );

        expect(shipment.id).toBe('shipment-1');
        expect(shipment.trackingCode).toBe('ENV-20260911-TEST');
        expect(shipment.origin).toBe('Madrid');
        expect(shipment.destination).toBe('Barcelona');
        expect(shipment.recipient).toBe('Carlos Test');
        expect(shipment.phone).toBe('600123456');
        expect(shipment.weight).toBe(5.5);
        expect(shipment.status).toBe(ShipmentStatus.CREATED);
        expect(shipment.deliveredAt).toBeNull();
        expect(shipment.createdById).toBe('user-1');
        expect(shipment.createdAt).toBe(createdAt);
        expect(shipment.updatedAt).toBe(updatedAt);
    });
});