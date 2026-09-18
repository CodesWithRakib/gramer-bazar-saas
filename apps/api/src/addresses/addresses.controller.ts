import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address for the current user' })
  create(@CurrentUser('id') userId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.addressesService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.remove(id, userId);
  }
}

