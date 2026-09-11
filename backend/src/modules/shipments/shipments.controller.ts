import { 
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseGuards,
    Param,
    Patch,
    Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateShipmentUseCase } from './application/use-cases/create-shipment.use-case';
import { CreateShipmentDto } from './application/dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './application/dto/list-shipments-query.dto';
import { ListShipmentsUseCase } from './application/use-cases/list-shipments.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetShipmentUseCase } from './application/use-cases/get-shipment.use-case';
import { UpdateShipmentStatusUseCase } from './application/use-cases/update-shipment-status.use-case';
import { UpdateShipmentStatusDto } from './application/dto/update-shipment-status.dto';
import { AssignVehiclesUseCase } from './application/use-cases/assign-vehicles.use-case';
import { AssignVehiclesDto } from './application/dto/assign-vehicles.dto';
import { CancelShipmentUseCase } from './application/use-cases/cancel-shipment.use-case';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('shipments')
@ApiBearerAuth('access-token')
@Controller('shipments')
export class ShipmentsController {
    constructor(
        private readonly createShipmentUseCase: CreateShipmentUseCase,
        private readonly listShipmentsUseCase: ListShipmentsUseCase,
        private readonly getShipmentUseCase: GetShipmentUseCase,
        private readonly updateShipmentStatusUseCase: UpdateShipmentStatusUseCase,
        private readonly assignVehiclesUseCase: AssignVehiclesUseCase,
        private readonly cancelShipmentUseCase: CancelShipmentUseCase,
    ) {}

    @ApiOperation({ summary: 'Create a new shipment' })
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() body: CreateShipmentDto,
        @Req() request: Request & { user: { sub: string } },
    ) {
        const user = request.user as { sub: string };
        return this.createShipmentUseCase.execute({
            ...body,
            createdById: user.sub,
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERVISOR')
    @ApiOperation({ summary: 'Assign vehicles to shipments' })
    @Post('assign-vehicles')
    async assignVehicles(
        @Body() body: AssignVehiclesDto,
    ) {
        return this.assignVehiclesUseCase.execute({
            shipmentIds: body.shipmentIds,
            vehicleCapacity: body.vehicleCapacity,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List all shipments' })
    @Get()
    async findAll(@Query() query: ListShipmentsQueryDto) {
        return this.listShipmentsUseCase.execute({
            page: query.page,
            limit: query.limit,
            status: query.status,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a shipment by ID' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.getShipmentUseCase.execute(id);
    }
    
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update the status of a shipment' })
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: UpdateShipmentStatusDto,
        @Req() request: Request & { user: { sub: string } },
    ) {
        return this.updateShipmentStatusUseCase.execute({
            id,
            status: body.status,
            userId: request.user.sub,
            location: body.location,
            notes: body.notes,
        });
    }
    
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Cancel a shipment' })
    @Delete(':id')
    async cancel(
        @Param('id') id: string,
        @Req() request: Request & { user: { sub: string } },
    ) {
        return this.cancelShipmentUseCase.execute({
            id,
            userId: request.user.sub,
        });
    }
}
