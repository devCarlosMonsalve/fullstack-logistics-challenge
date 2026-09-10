import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsUUID, Min } from 'class-validator';

export class AssignVehiclesDto {
    @IsArray()
    @IsUUID('4', { each: true })
    shipmentIds: string[];

    @Type(() => Number)
    @IsNumber({}, { each: true })
    @Min(0.01)
    vehicleCapacity: number;
}