import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateShipmentDto } from './create-shipment.dto';
import { State } from '@fullstack-logistic-wrk/prisma';
import { IsEnum } from 'class-validator';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
    @ApiProperty({
        description: 'New state of the shipment',
        enum: State,
        example: State.IN_TRANSIT,
    })
    @IsEnum(State)
    state: State;
}
