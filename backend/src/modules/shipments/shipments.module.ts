import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { SHIPMENT_REPOSITORY } from './domain/repositories/shipment.repository';
import { SHIPMENT_EVENT_REPOSITORY } from './domain/repositories/shipment-event.repository';

import { PrismaShipmentRepository } from './infrastructure/repositories/prisma-shipment.repository';
import { PrismaShipmentEventRepository } from './infrastructure/repositories/prisma-shipment-event.repository';

import { CreateShipmentUseCase } from './application/use-cases/create-shipment.use-case';
import { ListShipmentsUseCase } from './application/use-cases/list-shipments.use-case';
import { GetShipmentUseCase } from './application/use-cases/get-shipment.use-case';
import { UpdateShipmentStatusUseCase } from './application/use-cases/update-shipment-status.use-case';
import { FirstFitDecreasingService } from './domain/services/first-fit-decreasing.service';
import { AssignVehiclesUseCase } from './application/use-cases/assign-vehicles.use-case';
import { CancelShipmentUseCase } from './application/use-cases/cancel-shipment.use-case';
import { ShipmentsController } from './shipments.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    {
      provide: SHIPMENT_REPOSITORY,
      useClass: PrismaShipmentRepository,
    },
    {
      provide: SHIPMENT_EVENT_REPOSITORY,
      useClass: PrismaShipmentEventRepository,
    },
    CreateShipmentUseCase,
    ListShipmentsUseCase,
    GetShipmentUseCase,
    UpdateShipmentStatusUseCase,
    FirstFitDecreasingService,
    AssignVehiclesUseCase,
    CancelShipmentUseCase,
  ],
  controllers: [ShipmentsController],
  exports: [SHIPMENT_REPOSITORY, SHIPMENT_EVENT_REPOSITORY],
})
export class ShipmentsModule {}