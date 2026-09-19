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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service.js';
import { CreatePayoutDto } from './dto/create-payout.dto.js';
import { ReviewPayoutDto } from './dto/review-payout.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { PayoutStatus } from './entities/payout-request.entity.js';

@ApiTags('Payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('request')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Request a new payout (Seller)' })
  create(@Request() req: any, @Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutsService.requestPayout(req.user.id, createPayoutDto);
  }

  @Get('my-requests')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get all payout requests for current seller' })
  getMyPayouts(@Request() req: any) {
    return this.payoutsService.getSellerPayouts(req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all payout requests (Admin)' })
  @ApiQuery({ name: 'status', enum: PayoutStatus, required: false })
  findAll(@Query('status') status?: PayoutStatus) {
    return this.payoutsService.getAllPayouts(status);
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve or reject a payout request (Admin)' })
  review(@Param('id') id: string, @Body() reviewPayoutDto: ReviewPayoutDto) {
    return this.payoutsService.reviewPayout(id, reviewPayoutDto);
  }
}
