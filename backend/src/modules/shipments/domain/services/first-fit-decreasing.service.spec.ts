import { FirstFitDecreasingService } from './first-fit-decreasing.service';

describe('FirstFitDecreasingService', () => {
    describe('assign', () => {
        it('should assign shipments using First Fit Decreasing', () => {
        const service = new FirstFitDecreasingService();

        const shipments = [
            {
            shipmentId: 'shipment-1',
            trackingCode: 'ENV-001',
            weight: 5.5,
            },
            {
            shipmentId: 'shipment-2',
            trackingCode: 'ENV-002',
            weight: 3.5,
            },
            {
            shipmentId: 'shipment-3',
            trackingCode: 'ENV-003',
            weight: 7,
            },
        ];

        const vehicles = service.assign(shipments, 10);

        expect(vehicles).toHaveLength(2);

        expect(vehicles[0].shipments).toHaveLength(1);
        expect(vehicles[0].shipments[0].weight).toBe(7);
        expect(vehicles[0].totalWeight).toBe(7);
        expect(vehicles[0].remainingCapacity).toBe(3);

        expect(vehicles[1].shipments).toHaveLength(2);
        expect(vehicles[1].shipments[0].weight).toBe(5.5);
        expect(vehicles[1].shipments[1].weight).toBe(3.5);
        expect(vehicles[1].totalWeight).toBe(9);
        expect(vehicles[1].remainingCapacity).toBe(1);
        });
    });
});