import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductImporterService } from './product-importer.service.js';
import { ImportMode } from './entities/import-log.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportLogResponseDto } from './dto/import-response.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';

export class RunImportDto {
  @ApiProperty({ description: 'Source name: dummyjson or openfoodfacts', example: 'dummyjson' })
  @IsString()
  @IsNotEmpty()
  source: 'dummyjson' | 'openfoodfacts';

  @ApiPropertyOptional({ enum: ImportMode, default: ImportMode.IMPORT })
  @IsOptional()
  @IsEnum(ImportMode)
  mode?: ImportMode;

  @ApiPropertyOptional({ description: 'Number of products to import (1-100)', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Optional specific category tag to fetch' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Whether to update existing products if duplicates are detected', default: false })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}

@ApiTags('Catalog - Importer')
@Controller('admin/importer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class ProductImporterController {
  constructor(private readonly importerService: ProductImporterService) {}

  @Post('run')
  @ApiOperation({
    summary: 'Trigger bulk product import or dry-run (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Imports seed products from remote sources (dummyjson, openfoodfacts).',
  })
  @ApiStandardResponse({
    type: ImportLogResponseDto,
    status: HttpStatus.CREATED,
    description: 'Import job completed; log summary returned',
  })
  @ApiCommonErrors([400, 401, 403, 500])
  runImport(@Body() dto: RunImportDto) {
    return this.importerService.runImport({
      source: dto.source,
      mode: dto.mode || ImportMode.IMPORT,
      limit: dto.limit || 20,
      category: dto.category,
      updateExisting: dto.updateExisting || false,
    });
  }

  @Get('logs')
  @ApiOperation({
    summary: 'List history of product import runs (Admin only)',
    description: 'Returns historical execution records of automated catalog imports.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiStandardResponse({
    type: ImportLogResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of import log entries',
  })
  @ApiCommonErrors([401, 403, 500])
  getLogs(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.importerService.getImportLogs(parsedLimit);
  }

  @Get('logs/:id')
  @ApiOperation({
    summary: 'Retrieve specific import log details (Admin only)',
    description: 'Returns full diagnostic payload, count breakdown, and error messages for an import run.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Import log UUID' })
  @ApiStandardResponse({
    type: ImportLogResponseDto,
    status: HttpStatus.OK,
    description: 'Import log record',
  })
  @ApiCommonErrors([401, 403, 404, 500])
  getLogDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.importerService.getImportLogById(id);
  }
}
