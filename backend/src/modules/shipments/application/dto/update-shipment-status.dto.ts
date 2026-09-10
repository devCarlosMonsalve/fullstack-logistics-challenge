import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ShipmentStatus } from '../../domain/shipment-status';

export class UpdateShipmentStatusDto {
    @IsEnum(ShipmentStatus)
    status: ShipmentStatus;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}