import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ManufacturersService } from './manufacturers.service.js';
import {
  CreateManufacturerDto,
  UpdateManufacturerDto,
  ManufacturerResponseDto,
} from '../dto/manufacturer.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Catalog - Manufacturers')
@Controller(['catalog/manufacturers', 'manufacturers'])
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('brands.create')
  @ApiOperation({ summary: 'Register a pharmaceutical manufacturer (Admin only)' })
  @ApiStandardResponse({
    type: ManufacturerResponseDto,
    status: HttpStatus.CREATED,
    description: 'Manufacturer created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() dto: CreateManufacturerDto) {
    return this.manufacturersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List manufacturers (optionally filtered)' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Demo' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiStandardResponse({
    type: ManufacturerResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Manufacturer list',
  })
  @ApiCommonErrors([500])
  findAll(@Query('search') search?: string, @Query('isActive') isActive?: string) {
    return this.manufacturersService.findAll(
      search,
      isActive === undefined ? undefined : isActive === 'true',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a manufacturer by id' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({
    type: ManufacturerResponseDto,
    status: HttpStatus.OK,
    description: 'Manufacturer details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.manufacturersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('brands.update')
  @ApiOperation({ summary: 'Update a manufacturer (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({
    type: ManufacturerResponseDto,
    status: HttpStatus.OK,
    description: 'Manufacturer updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateManufacturerDto) {
    return this.manufacturersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('brands.delete')
  @ApiOperation({ summary: 'Delete an unused manufacturer (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Manufacturer deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.manufacturersService.remove(id);
  }
}
