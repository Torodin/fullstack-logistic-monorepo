import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { FindAllShipmentsQueryDto } from './dto/find-all-shipments-query.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '@fullstack-logistic-wrk/prisma';
import { Roles } from '../auth/decorator/roles.decorator';
import type { Request } from 'express';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERVISOR, Role.OPERATOR)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List shipments with pagination and optional state filter' })
  findAll(@Query() query: FindAllShipmentsQueryDto) {
    return this.shipmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Register a new user (SUPERVISOR only)' })
  @Patch(':id/status')
  update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @Req() req: Request,
  ) {
    return this.shipmentsService.update(id, updateShipmentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(id);
  }
}
