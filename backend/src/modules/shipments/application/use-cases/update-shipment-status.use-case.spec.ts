import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';

import { UpdateShipmentStatusUseCase } from './update-shipment-status.use-case';

import { ShipmentStatus } from '../../domain/shipment-status';

import type { ShipmentRepository } from '../../domain/repositories/shipment.repository';
import type { ShipmentEventRepository } from '../../domain/repositories/shipment-event.repository';
import { Shipment } from '../../domain/entities/shipment.entity';

describe('UpdateShipmentStatusUseCase', () => {
    let useCase: UpdateShipmentStatusUseCase;

    const shipmentRepository: jest.Mocked<ShipmentRepository> = {
        create: jest.fn(),
        findById: jest.fn(),
        findByTrackingCode: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
    };

    const shipmentEventRepository: jest.Mocked<ShipmentEventRepository> = {
        create: jest.fn(),
        findByShipmentId: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        useCase = new UpdateShipmentStatusUseCase(
        shipmentRepository,
        shipmentEventRepository,
        );
    });

    it('should throw NotFoundException if shipment not found', async () => {
        shipmentRepository.findById.mockResolvedValue(null);

        await expect(
        useCase.execute({
            id: 'non-existent-id',
            status: ShipmentStatus.DELIVERED,
            userId: 'user-1',
        }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should update shipment status and create event', async () => {
        const previousUpdatedAt = new Date('2020-01-01T00:00:00.000Z');
        const shipment = new Shipment(
            'shipment-1',
            'ENV-20260911-TEST',
            'Madrid',
            'Barcelona',
            'Carlos Test',
            '600123456',
            5.5,
            ShipmentStatus.IN_WAREHOUSE,
            null,
            'user-1',
            new Date(),
            previousUpdatedAt,
        );

        shipmentRepository.findById.mockResolvedValue(shipment);

        await useCase.execute({
            id: 'shipment-1',
            status: ShipmentStatus.IN_TRANSIT,
            userId: 'user-1',
        });

        expect(shipmentRepository.update).toHaveBeenCalledWith(shipment);

        expect(shipmentEventRepository.create).toHaveBeenCalled();
        expect(shipment.updatedAt.getTime()).toBeGreaterThan(
            previousUpdatedAt.getTime(),
        );
    });

    it('should allow cancellation from IN_TRANSIT', async () => {
        const shipment = new Shipment(
            'shipment-2',
            'ENV-20260911-TEST',
            'Madrid',
            'Barcelona',
            'Carlos Test',
            null,
            5.5,
            ShipmentStatus.IN_TRANSIT,
            null,
            'user-1',
            new Date(),
            new Date(),
        );

        shipmentRepository.findById.mockResolvedValue(shipment);

        await useCase.execute({
            id: 'shipment-2',
            status: ShipmentStatus.CANCELLED,
            userId: 'user-1',
        });

        expect(shipmentRepository.update).toHaveBeenCalledWith(shipment);
        expect(shipmentEventRepository.create).toHaveBeenCalled();
        expect(shipment.status).toBe(ShipmentStatus.CANCELLED);
    });

    it('should reject cancellation of a DELIVERED shipment', async () => {
        const shipment = new Shipment(
            'shipment-3',
            'ENV-20260911-TEST',
            'Madrid',
            'Barcelona',
            'Carlos Test',
            null,
            5.5,
            ShipmentStatus.DELIVERED,
            new Date(),
            'user-1',
            new Date(),
            new Date(),
        );

        shipmentRepository.findById.mockResolvedValue(shipment);

        await expect(
            useCase.execute({
            id: 'shipment-3',
            status: ShipmentStatus.CANCELLED,
            userId: 'user-1',
            }),
        ).rejects.toThrow();

        expect(shipmentRepository.update).not.toHaveBeenCalled();
        expect(shipmentEventRepository.create).not.toHaveBeenCalled();
    });
});