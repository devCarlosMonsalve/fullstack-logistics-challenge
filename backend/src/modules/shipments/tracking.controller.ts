import { Controller, Get, Param } from '@nestjs/common';
import { GetPublicTrackingUseCase } from './application/use-cases/get-public-tracking.use-case';

@Controller('tracking')
export class TrackingController {
    constructor(
        private readonly getPublicTrackingUseCase: GetPublicTrackingUseCase,
    ) {}

    @Get(':trackingCode')
    async track(@Param('trackingCode') trackingCode: string) {
        return this.getPublicTrackingUseCase.execute(trackingCode);
    }
}