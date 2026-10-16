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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import { LogisticsDispatchService } from '../services/logistics-dispatch.service.js';
import {
  CreateDispatchClusterDto,
  UpdateDispatchRunStatusDto,
  ProgressWaypointDto,
} from '../dto/dispatch-cluster.dto.js';
import { DispatchRunStatus } from '../enums/dispatch-run-status.enum.js';

@ApiTags('Logistics Dispatch & Route Optimization')
@Controller('deliveries/logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LogisticsDispatchController {
  constructor(private readonly logisticsService: LogisticsDispatchService) {}

  @Get('suggested')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get suggested delivery route clusters',
    description: 'Groups unassigned deliveries by Upazila/Union and computes TSP route metrics.',
  })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'hubId', required: false, type: String })
  async getSuggestedClusters(
    @Query('district') district?: string,
    @Query('hubId') hubId?: string,
  ) {
    return this.logisticsService.suggestClusters(district, hubId);
  }

  @Post('runs')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create and dispatch a multi-stop route cluster run',
    description: 'Sequences waypoints using nearest-neighbor heuristic and assigns to a rider.',
  })
  async createRun(@Request() req: any, @Body() dto: CreateDispatchClusterDto) {
    return this.logisticsService.createDispatchRun(req.user.id, dto);
  }

  @Get('runs')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all dispatch runs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DispatchRunStatus })
  @ApiQuery({ name: 'district', required: false, type: String })
  async getAllRuns(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: DispatchRunStatus,
    @Query('district') district?: string,
  ) {
    return this.logisticsService.getAllRuns(page ? Number(page) : 1, limit ? Number(limit) : 20, status, district);
  }

  @Get('rider/active-run')
  @Roles(Role.RIDER)
  @ApiOperation({ summary: 'Get active delivery run for current rider' })
  async getRiderActiveRun(@Request() req: any) {
    return this.logisticsService.getRiderActiveRun(req.user.id);
  }

  @Patch('runs/:id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.RIDER)
  @ApiOperation({ summary: 'Update dispatch run status (start, complete, cancel)' })
  async updateRunStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchRunStatusDto,
  ) {
    return this.logisticsService.updateRunStatus(id, dto, req.user.id);
  }

  @Patch('runs/:id/waypoints/:sequence/progress')
  @Roles(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update waypoint stop status (mark arrived or delivered)' })
  async progressWaypoint(
    @Request() req: any,
    @Param('id') id: string,
    @Param('sequence') sequence: number,
    @Body() dto: ProgressWaypointDto,
  ) {
    const isRider = req.user.roles?.includes(Role.RIDER) || req.user.role === Role.RIDER;
    return this.logisticsService.progressWaypoint(
      id,
      Number(sequence),
      dto,
      isRider ? req.user.id : undefined,
    );
  }
}
