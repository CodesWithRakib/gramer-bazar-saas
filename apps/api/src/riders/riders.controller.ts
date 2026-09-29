import { Controller, Get, Patch, Body, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RidersService } from './riders.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto.js';
import { UpdateRiderAvailabilityDto } from './dto/update-rider-availability.dto.js';
import { QueryRiderEarningsDto } from './dto/query-rider-earnings.dto.js';
import {
  RiderProfileResponseDto,
  RiderEarningsResponseDto,
  RiderDashboardResponseDto,
} from './dto/rider-response.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';

@ApiTags('Riders')
@Controller('riders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get('me')
  @Roles(Role.RIDER)
  @ApiOperation({
    summary: 'Rider: Get my operational profile',
    description:
      'Returns the authenticated rider profile (identity, vehicle, service zone, availability).',
  })
  @ApiStandardResponse({
    type: RiderProfileResponseDto,
    description: 'Rider profile retrieved successfully',
  })
  getMyProfile(@Request() req: { user: { id: string } }) {
    return this.ridersService.getProfile(req.user.id);
  }

  @Patch('me')
  @Roles(Role.RIDER)
  @ApiOperation({
    summary: 'Rider: Update my contact & vehicle details',
    description:
      'Updates self-service profile fields (address, zone, emergency contact, vehicle). Verified NID/license fields are immutable through this endpoint.',
  })
  @ApiStandardResponse({
    type: RiderProfileResponseDto,
    description: 'Rider profile updated successfully',
  })
  updateMyProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateRiderProfileDto,
  ) {
    return this.ridersService.updateProfile(req.user.id, dto);
  }

  @Patch('me/availability')
  @Roles(Role.RIDER)
  @ApiOperation({
    summary: 'Rider: Set my availability',
    description:
      'Mark yourself AVAILABLE (eligible for assignments) or OFFLINE. BUSY is system-managed and rejected here.',
  })
  @ApiStandardResponse({
    type: RiderProfileResponseDto,
    description: 'Availability updated successfully',
  })
  updateAvailability(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateRiderAvailabilityDto,
  ) {
    return this.ridersService.updateAvailability(req.user.id, dto.availability);
  }

  @Get('me/dashboard')
  @Roles(Role.RIDER)
  @ApiOperation({
    summary: 'Rider: Get operational dashboard',
    description:
      'Aggregated live metrics for the rider: assignments, active delivery, completion counts and earnings summary.',
  })
  @ApiStandardResponse({
    type: RiderDashboardResponseDto,
    description: 'Rider dashboard retrieved successfully',
  })
  getDashboard(@Request() req: { user: { id: string } }) {
    return this.ridersService.getDashboard(req.user.id);
  }

  @Get('me/earnings')
  @Roles(Role.RIDER)
  @ApiOperation({
    summary: 'Rider: Get my earnings ledger',
    description:
      'Paginated delivery earnings ledger with lifetime summary, filters by status and date range.',
  })
  @ApiStandardResponse({
    type: RiderEarningsResponseDto,
    description: 'Rider earnings retrieved successfully',
  })
  getMyEarnings(
    @Request() req: { user: { id: string } },
    @Query() query: QueryRiderEarningsDto,
  ) {
    return this.ridersService.getEarnings(req.user.id, query);
  }

  @Get('me/earnings/summary')
  @Roles(Role.RIDER)
  @ApiOperation({
    summary: 'Rider: Get my earnings summary',
    description: 'Today / week / month / lifetime earnings, pending payout and withdrawable balance.',
  })
  @ApiStandardResponse({
    description: 'Rider earnings summary retrieved successfully',
  })
  getMyEarningsSummary(@Request() req: { user: { id: string } }) {
    return this.ridersService.getEarningsSummary(req.user.id);
  }
}
