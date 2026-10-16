import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { AgriTraceabilityService } from './agri-traceability.service.js';
import {
  CreateProduceBatchDto,
  AddCheckpointLogDto,
  ReassessQualityDto,
  QueryProduceBatchesDto,
} from './dto/produce-batch.dto.js';
import { CropType, ProduceGrade } from './enums/produce-traceability.enum.js';

@ApiTags('Agri-Traceability & Produce Quality Grading')
@Controller('traceability')
export class AgriTraceabilityController {
  constructor(private readonly traceabilityService: AgriTraceabilityService) {}

  /**
   * Public traceability passport query for consumer QR code scan
   */
  @Get('public/:batchNumber')
  @ApiOperation({
    summary: 'Public produce traceability passport',
    description: 'Returns verifiable farm-to-fork origin, harvest date, quality grade, and cold-chain timeline.',
  })
  async getPublicPassport(@Param('batchNumber') batchNumber: string) {
    return this.traceabilityService.getPublicBatchPassport(batchNumber);
  }

  /**
   * Seller creates a new harvest batch with automated AI quality grade
   */
  @Post('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Record harvest batch and evaluate produce grade',
    description: 'Generates batch passport, calculates quality score and defect %, and stamps initial checkpoint.',
  })
  async createBatch(@Request() req: any, @Body() dto: CreateProduceBatchDto) {
    return this.traceabilityService.createProduceBatch(req.user.id, dto);
  }

  /**
   * Seller gets their harvest batches
   */
  @Get('batches/my-batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List batches for authenticated seller' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cropType', required: false, enum: CropType })
  async getMyBatches(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('cropType') cropType?: CropType,
  ) {
    return this.traceabilityService.getSellerBatches(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      cropType,
    );
  }

  /**
   * Get batch details by ID
   */
  @Get('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get produce batch details by ID' })
  async getBatchById(@Request() req: any, @Param('id') id: string) {
    const isSellerOnly =
      req.user.role === Role.SELLER &&
      !req.user.roles?.includes(Role.ADMIN) &&
      !req.user.roles?.includes(Role.SUPER_ADMIN);

    return this.traceabilityService.getBatchById(id, isSellerOnly ? req.user.id : undefined);
  }

  /**
   * Record handover checkpoint event
   */
  @Post('batches/:id/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN, Role.RIDER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record batch handover checkpoint event' })
  async addCheckpoint(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddCheckpointLogDto,
  ) {
    const isSeller = req.user.role === Role.SELLER;
    return this.traceabilityService.addCheckpointEvent(
      id,
      dto,
      isSeller ? req.user.id : undefined,
    );
  }

  /**
   * Reassess quality grading scores
   */
  @Patch('batches/:id/reassess')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reassess produce quality grade' })
  async reassessQuality(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReassessQualityDto,
  ) {
    const isSeller = req.user.role === Role.SELLER;
    return this.traceabilityService.reassessQuality(
      id,
      dto,
      isSeller ? req.user.id : undefined,
    );
  }
}
