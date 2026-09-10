import { 
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseGuards,
    Param,
    Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import { CreateShipmentUseCase } from './application/use-cases/create-shipment.use-case';
import { CreateShipmentDto } from './application/dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './application/dto/list-shipments-query.dto';
import { ListShipmentsUseCase } from './application/use-cases/list-shipments.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetShipmentUseCase } from './application/use-cases/get-shipment.use-case';
import { UpdateShipmentStatusUseCase } from './application/use-cases/update-shipment-status.use-case';
import { UpdateShipmentStatusDto } from './application/dto/update-shipment-status.dto';

@Controller('shipments')
export class ShipmentsController {
    constructor(
        private readonly createShipmentUseCase: CreateShipmentUseCase,
        private readonly listShipmentsUseCase: ListShipmentsUseCase,
        private readonly getShipmentUseCase: GetShipmentUseCase,
        private readonly updateShipmentStatusUseCase: UpdateShipmentStatusUseCase,
    ) {}

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

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Query() query: ListShipmentsQueryDto) {
        return this.listShipmentsUseCase.execute({
            page: query.page,
            limit: query.limit,
            status: query.status,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.getShipmentUseCase.execute(id);
    }
    
    @UseGuards(JwtAuthGuard)
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
}
