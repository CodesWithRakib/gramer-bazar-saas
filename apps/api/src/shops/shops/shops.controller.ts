import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service.js';
import { CreateShopDto } from '../dto/create-shop.dto.js';
import { UpdateShopDto } from '../dto/update-shop.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Shops (Seller Profiles)')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop' })
  create(@Body() createShopDto: CreateShopDto, @Request() req: any) {
    // If it's a seller, force the sellerId to their own ID.
    // If it's an admin, they can specify the sellerId.
    if (!req.user.roles?.includes(Role.ADMIN) && !req.user.roles?.includes(Role.SUPER_ADMIN)) {
      createShopDto.sellerId = req.user.id;
    }
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shop by ID' })
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a shop' })
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shop (Admin only)' })
  remove(@Param('id') id: string) {
    return this.shopsService.remove(id);
  }
}
