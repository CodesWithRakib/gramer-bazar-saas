import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service.js';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  IngredientResponseDto,
} from '../dto/ingredient.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

@ApiTags('Catalog - Ingredients')
@Controller(['catalog/ingredients', 'ingredients'])
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('brands.create')
  @ApiOperation({ summary: 'Register an active ingredient (Admin only)' })
  @ApiStandardResponse({
    type: IngredientResponseDto,
    status: HttpStatus.CREATED,
    description: 'Ingredient created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List active pharmaceutical ingredients (optionally filtered by search)' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Paracetamol' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiStandardResponse({
    type: IngredientResponseDto,
    isArray: true,
    description: 'List of ingredients',
  })
  findAll(@Query('search') search?: string, @Query('isActive') isActive?: boolean) {
    return this.ingredientsService.findAll(search, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an ingredient by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiStandardResponse({
    type: IngredientResponseDto,
    description: 'Ingredient details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('brands.update')
  @ApiOperation({ summary: 'Update an ingredient (Admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiStandardResponse({
    type: IngredientResponseDto,
    description: 'Ingredient updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Permissions('brands.delete')
  @ApiOperation({ summary: 'Delete an ingredient (Admin only; blocked if in use)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiStandardMessageResponse({ description: 'Ingredient deleted successfully' })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ingredientsService.remove(id);
  }
}
