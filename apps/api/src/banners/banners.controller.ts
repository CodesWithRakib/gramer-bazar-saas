import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BannersService } from './banners.service.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardResponse, ApiStandardMessageResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { BannerResponseDto } from './dto/banner-response.dto.js';

@ApiTags('Banners (CMS)')
@Controller('banners')
@ApiCommonErrors()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new banner (Admin)', description: 'Creates a homepage or promotional hero banner.' })
  @ApiStandardResponse({ type: BannerResponseDto, status: 201, description: 'Banner created successfully' })
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banners (Admin)', description: 'Lists all banners including inactive ones for CMS administration.' })
  @ApiStandardResponse({ type: BannerResponseDto, isArray: true, description: 'List of all banners' })
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all active banners (Public)', description: 'Returns sorted list of active banners for the public storefront slider.' })
  @ApiStandardResponse({ type: BannerResponseDto, isArray: true, description: 'List of active storefront banners' })
  findActiveBanners() {
    return this.bannersService.findActiveBanners();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a banner by ID (Admin)', description: 'Retrieves single banner CMS details.' })
  @ApiParam({ name: 'id', description: 'Banner UUID' })
  @ApiStandardResponse({ type: BannerResponseDto, description: 'Banner details' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a banner (Admin)', description: 'Updates banner images, link targets, order, or active state.' })
  @ApiParam({ name: 'id', description: 'Banner UUID' })
  @ApiStandardResponse({ type: BannerResponseDto, description: 'Banner updated successfully' })
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a banner (Admin)', description: 'Permanently removes a banner from CMS.' })
  @ApiParam({ name: 'id', description: 'Banner UUID' })
  @ApiStandardMessageResponse({ description: 'Banner removed successfully' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
