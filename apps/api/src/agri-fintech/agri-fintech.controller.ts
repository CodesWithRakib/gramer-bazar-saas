import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AgriFintechService } from './agri-fintech.service.js';
import {
  ApplyMicroLoanDto,
  UpdateLoanStatusDto,
} from './dto/micro-loan.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { MicroLoanStatus } from './entities/micro-loan-application.entity.js';

@ApiTags('Agri Fintech & Rural Credit')
@Controller('agri-fintech')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgriFintechController {
  constructor(private readonly fintechService: AgriFintechService) {}

  @Get('credit-score')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get current seller algorithmic credit score and pre-approved loan limit' })
  getMyCreditScore(@CurrentUser('id') sellerId: string) {
    return this.fintechService.getFarmerCreditScore(sellerId);
  }

  @Post('loans/apply')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Apply for seasonal agricultural micro-capital loan' })
  applyForLoan(
    @CurrentUser('id') sellerId: string,
    @Body() dto: ApplyMicroLoanDto,
  ) {
    return this.fintechService.applyForMicroLoan(sellerId, dto);
  }

  @Get('loans/my-loans')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'List all micro-loan applications and EMI schedules for the seller' })
  getMyLoans(@CurrentUser('id') sellerId: string) {
    return this.fintechService.getMyLoans(sellerId);
  }

  @Get('admin/loans')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List micro-loan applications for administration and MFI disbursement' })
  @ApiQuery({ name: 'status', required: false, enum: MicroLoanStatus })
  getAllLoans(@Query('status') status?: MicroLoanStatus) {
    return this.fintechService.getAllLoans(status);
  }

  @Patch('admin/loans/:id/status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update micro-loan status (approve, disburse, reject, repay)' })
  updateLoanStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLoanStatusDto,
  ) {
    return this.fintechService.updateLoanStatus(id, dto);
  }
}
