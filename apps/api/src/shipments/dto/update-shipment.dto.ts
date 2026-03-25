import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateShipmentDto } from './create-shipment.dto';
import { State } from '@fullstack-logistic-wrk/prisma';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
    @ApiProperty({
        description: 'New state of the shipment',
        enum: State,
        example: State.IN_TRANSIT,
    })
    @IsEnum(State)
    state: State;

    @ApiProperty({
        description: 'Location of the shipment update',
        example: 'Warehouse A',
    })
    @IsString()
    location: string;

    @ApiProperty({
        description: 'Additional notes about the shipment update',
        example: 'Shipment delayed due to weather conditions',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
