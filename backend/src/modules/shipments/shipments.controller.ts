import { 
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { Query } from '@nestjs/common';
import { CreateShipmentUseCase } from './application/use-cases/create-shipment.use-case';
import { CreateShipmentDto } from './application/dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './application/dto/list-shipments-query.dto';
import { ListShipmentsUseCase } from './application/use-cases/list-shipments.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shipments')
export class ShipmentsController {
    constructor(
        private readonly createShipmentUseCase: CreateShipmentUseCase,
        private readonly listShipmentsUseCase: ListShipmentsUseCase,
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
}
