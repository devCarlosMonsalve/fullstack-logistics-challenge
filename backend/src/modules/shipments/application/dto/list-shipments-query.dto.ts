import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';

import { ShipmentStatus } from '../../domain/shipment-status';

export class ListShipmentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;
}