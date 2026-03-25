import { ApiPropertyOptional } from '@nestjs/swagger';
import { State } from '@fullstack-logistic-wrk/prisma';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindAllShipmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of shipments per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter shipments by state',
    enum: State,
    example: State.IN_TRANSIT,
  })
  @IsOptional()
  @IsEnum(State)
  state?: State;
}
