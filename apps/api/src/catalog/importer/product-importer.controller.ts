import { Controller, Post, Get, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductImporterService } from './product-importer.service.js';
import { ImportMode } from './entities/import-log.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunImportDto {
  @ApiProperty({ description: 'Source name: dummyjson or openfoodfacts', example: 'dummyjson' })
  @IsString()
  @IsNotEmpty()
  source: 'dummyjson' | 'openfoodfacts';

  @ApiPropertyOptional({ enum: ImportMode, default: ImportMode.IMPORT })
  @IsOptional()
  @IsEnum(ImportMode)
  mode?: ImportMode;

  @ApiPropertyOptional({ description: 'Number of products to import', default: 20 })
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

@ApiTags('Admin / Product Importer')
@Controller('admin/importer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class ProductImporterController {
  constructor(private readonly importerService: ProductImporterService) {}

  @Post('run')
  @ApiOperation({ summary: 'Trigger a product import or dry-run (Admin only)' })
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
  @ApiOperation({ summary: 'Get history of product import runs (Admin only)' })
  getLogs(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.importerService.getImportLogs(parsedLimit);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get specific import log details (Admin only)' })
  getLogDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.importerService.getImportLogById(id);
  }
}
