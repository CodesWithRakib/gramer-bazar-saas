import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service.js';
import { CreatePayoutDto } from './dto/create-payout.dto.js';
import { ReviewPayoutDto } from './dto/review-payout.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { PayoutStatus } from './entities/payout-request.entity.js';
import { ApiStandardResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { PayoutResponseDto } from './dto/payout-response.dto.js';

@ApiTags('Payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('request')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Request a new payout (Seller)', description: 'Submits a withdrawal request from seller available wallet balance.' })
  @ApiStandardResponse({ type: PayoutResponseDto, status: 201, description: 'Payout request created successfully' })
  create(@Request() req: any, @Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutsService.requestPayout(req.user.id, createPayoutDto);
  }

  @Get('my-requests')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get all payout requests for current seller', description: 'Lists all historical withdrawal requests and statuses for the seller.' })
  @ApiStandardResponse({ type: PayoutResponseDto, isArray: true, description: 'List of seller payout requests' })
  getMyPayouts(@Request() req: any) {
    return this.payoutsService.getSellerPayouts(req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all payout requests (Admin)', description: 'Lists all vendor withdrawal requests with optional status filter.' })
  @ApiQuery({ name: 'status', enum: PayoutStatus, required: false })
  @ApiStandardResponse({ type: PayoutResponseDto, isArray: true, description: 'List of all payout requests' })
  findAll(@Query('status') status?: PayoutStatus) {
    return this.payoutsService.getAllPayouts(status);
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve or reject a payout request (Admin)', description: 'Updates status of payout to APPROVED (disbursing funds) or REJECTED.' })
  @ApiParam({ name: 'id', description: 'Payout request UUID' })
  @ApiStandardResponse({ type: PayoutResponseDto, description: 'Payout review decision applied' })
  review(@Param('id') id: string, @Body() reviewPayoutDto: ReviewPayoutDto) {
    return this.payoutsService.reviewPayout(id, reviewPayoutDto);
  }
}
