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
import { MedicineBatchesService } from './medicine-batches.service.js';
import {
  CreateMedicineBatchDto,
  UpdateMedicineBatchDto,
  MedicineBatchResponseDto,
} from '../../dto/medicine-batch.dto.js';
import { BatchStatus } from '../../enums/medicine-batch-status.enum.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Role } from '../../../roles/enums/role.enum.js';

@ApiTags('Catalog - Medicine Batches')
@Controller(['catalog/medicine/batches', 'medicine/batches'])
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class MedicineBatchesController {
  constructor(private readonly batchesService: MedicineBatchesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Register a new medicine batch (FEFO tracked)' })
  @ApiStandardResponse({
    type: MedicineBatchResponseDto,
    status: HttpStatus.CREATED,
    description: 'Medicine batch recorded successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() dto: CreateMedicineBatchDto) {
    return this.batchesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'List medicine batches with FEFO sorting' })
  @ApiQuery({ name: 'productVariantId', required: false, format: 'uuid' })
  @ApiQuery({ name: 'status', required: false, enum: BatchStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardResponse({
    type: MedicineBatchResponseDto,
    isArray: true,
    description: 'List of medicine batches',
  })
  findAll(
    @Query('productVariantId') productVariantId?: string,
    @Query('status') status?: BatchStatus,
    @Query('search') search?: string,
  ) {
    return this.batchesService.findAll({ productVariantId, status, search });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @Permissions('inventory.view')
  @ApiOperation({ summary: 'Get a medicine batch by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiStandardResponse({
    type: MedicineBatchResponseDto,
    description: 'Medicine batch details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Update medicine batch stock, status or expiry' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiStandardResponse({
    type: MedicineBatchResponseDto,
    description: 'Medicine batch updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMedicineBatchDto) {
    return this.batchesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('inventory.manage')
  @ApiOperation({ summary: 'Delete a medicine batch (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiStandardMessageResponse({ description: 'Batch removed successfully' })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.batchesService.remove(id);
  }
}
