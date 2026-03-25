import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignVehiclesDto {
    @ApiProperty({
        description: 'Shipments to assign',
        example: '["ENV-12122000-0001", "ENV-12122000-0002"]',
    })
    @IsNotEmpty()
    @IsString({ each: true })
    shipmentIds: string[];

    @ApiProperty({
        description: 'Vehicle capacity in kg',
        example: 100,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    vehicleCapacity: number;
}
