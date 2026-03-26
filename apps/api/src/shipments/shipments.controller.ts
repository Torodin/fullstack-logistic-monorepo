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
import { Role } from '@fullstack-logistic-wrk/prisma/generated';
import { Roles } from '../auth/decorator/roles.decorator';
import type { Request } from 'express';
import { AssignVehiclesDto } from './dto/assign-vehicles.dto';

@ApiBearerAuth('JWT-auth')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERVISOR, Role.OPERATOR)
  @Post()
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Post('assign-vehicles')
  assignVehicles(@Body() assignVehiclesDto: AssignVehiclesDto) {
    return this.shipmentsService.assignVehicles(assignVehiclesDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERVISOR, Role.OPERATOR)
  @Get()
  @ApiOperation({ summary: 'List shipments with pagination and optional state filter' })
  findAll(@Query() query: FindAllShipmentsQueryDto) {
    return this.shipmentsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERVISOR, Role.OPERATOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Register a new user (SUPERVISOR only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERVISOR, Role.OPERATOR)
  @Patch(':id/status')
  update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @Req() req: Request,
  ) {
    return this.shipmentsService.update(id, updateShipmentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERVISOR, Role.OPERATOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(id);
  }
}
