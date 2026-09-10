import {
    IsNotEmpty,
    IsString,
    IsNumber,
    Min,
} from 'class-validator';

export class CreateShipmentDto {
  @IsNotEmpty()
  @IsString()
  origin: string;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsString()
  recipient: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNumber()
  @Min(0)
  weight: number;
}