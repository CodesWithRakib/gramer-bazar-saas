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
import { AttributesService } from './attributes.service.js';
import { CreateAttributeDto, UpdateAttributeDto } from '../dto/attribute.dto.js';
import { AttributeResponseDto } from '../dto/product-type.dto.js';
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
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';

@ApiTags('Catalog - Attributes')
@Controller(['catalog/attributes', 'attributes'])
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.create')
  @ApiOperation({ summary: 'Create a reusable catalog attribute (Admin only)' })
  @ApiStandardResponse({
    type: AttributeResponseDto,
    status: HttpStatus.CREATED,
    description: 'Attribute created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() dto: CreateAttributeDto) {
    return this.attributesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List catalog attributes' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'dataType', required: false, enum: AttributeDataType })
  @ApiStandardResponse({
    type: AttributeResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Attribute list',
  })
  @ApiCommonErrors([500])
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('dataType') dataType?: AttributeDataType,
  ) {
    return this.attributesService.findAll(
      search,
      isActive === undefined ? undefined : isActive === 'true',
      dataType,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a catalog attribute with options' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({
    type: AttributeResponseDto,
    status: HttpStatus.OK,
    description: 'Attribute details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.update')
  @ApiOperation({ summary: 'Update a catalog attribute (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardResponse({
    type: AttributeResponseDto,
    status: HttpStatus.OK,
    description: 'Attribute updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 409, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAttributeDto) {
    return this.attributesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('categories.delete')
  @ApiOperation({ summary: 'Delete a catalog attribute (Admin only)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Attribute deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attributesService.remove(id);
  }
}
