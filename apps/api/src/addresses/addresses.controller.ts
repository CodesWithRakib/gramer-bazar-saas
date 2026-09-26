import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { AddressResponseDto } from './dto/address-response.dto.js';
import { MessageResponseDto } from '../common/dto/api-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Addresses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({
    summary: 'Save a new delivery address',
    description: 'Creates a new postal/hyperlocal delivery address linked to the authenticated user account.',
  })
  @ApiStandardResponse({
    type: AddressResponseDto,
    status: HttpStatus.CREATED,
    description: 'Address created successfully',
  })
  @ApiCommonErrors([400, 401, 500])
  create(@CurrentUser('id') userId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all addresses for current user',
    description: 'Retrieves the complete address book for the authenticated customer.',
  })
  @ApiStandardResponse({
    type: AddressResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of user saved addresses',
  })
  @ApiCommonErrors([401, 500])
  findAll(@CurrentUser('id') userId: string) {
    return this.addressesService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve single address by ID',
    description: 'Returns address details if it belongs to the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Address UUID' })
  @ApiStandardResponse({
    type: AddressResponseDto,
    status: HttpStatus.OK,
    description: 'Address details',
  })
  @ApiCommonErrors([401, 404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update existing delivery address',
    description: 'Modifies address fields or toggles default status for the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Address UUID' })
  @ApiStandardResponse({
    type: AddressResponseDto,
    status: HttpStatus.OK,
    description: 'Address updated successfully',
  })
  @ApiCommonErrors([400, 401, 404, 500])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove address from address book',
    description: 'Deletes an address belonging to the authenticated user.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Address UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Address deleted successfully',
  })
  @ApiCommonErrors([401, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.remove(id, userId);
  }
}
