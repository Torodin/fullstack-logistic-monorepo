import { IsNotEmpty, IsOptional, IsString, IsNumber, IsPositive, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty({
    description: 'Origin location of the shipment',
    example: 'Madrid',
  })
  @IsNotEmpty()
  @IsString()
  origin: string;

  @ApiProperty({
    description: 'Destination location of the shipment',
    example: 'Barcelona',
  })
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty({
    description: 'Name of the shipment addressee',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  addressee: string;

  @ApiPropertyOptional({
    description: 'Phone number of the addressee',
    example: '+345551234567',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{7,15}$/, {
    message: 'Phone number must be a valid international format (7-15 digits, optional +)',
  })
  phone?: string;

  @ApiProperty({
    description: 'Weight of the shipment in kg',
    example: 25.5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  weight: number;
}
