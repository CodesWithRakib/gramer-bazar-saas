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
import { ApplicationsService } from './applications.service.js';
import {
  CreatePartnerInquiryDto,
  UpdatePartnerInquiryStatusDto,
} from './dto/partner-inquiry.dto.js';
import { PartnerInquiryStatus } from './entities/partner-inquiry.entity.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';

@ApiTags('Partner Inquiries (B2B / Agro Cooperatives)')
@Controller('partner-inquiries')
@ApiCommonErrors()
export class PartnerInquiriesController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a new institutional partner inquiry (Public)',
    description:
      'Public endpoint for cooperatives, institutional buyers, supermarkets and fleet partners to request partnerships.',
  })
  create(@Body() dto: CreatePartnerInquiryDto) {
    return this.applicationsService.submitPartnerInquiry(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List partner inquiries (Admin/Super Admin)' })
  @ApiQuery({ name: 'status', required: false, enum: PartnerInquiryStatus })
  findAll(@Query('status') status?: PartnerInquiryStatus) {
    return this.applicationsService.findAllPartnerInquiries(status);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inquiry review status (Admin/Super Admin)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerInquiryStatusDto,
  ) {
    return this.applicationsService.updatePartnerInquiryStatus(id, dto);
  }
}
