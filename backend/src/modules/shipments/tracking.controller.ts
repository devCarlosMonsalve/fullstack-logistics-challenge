import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPublicTrackingUseCase } from './application/use-cases/get-public-tracking.use-case';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
    constructor(
        private readonly getPublicTrackingUseCase: GetPublicTrackingUseCase,
    ) {}

    @ApiOperation({ summary: 'Track a shipment by tracking code' })
    @Get(':trackingCode')
    async track(@Param('trackingCode') trackingCode: string) {
        return this.getPublicTrackingUseCase.execute(trackingCode);
    }
}