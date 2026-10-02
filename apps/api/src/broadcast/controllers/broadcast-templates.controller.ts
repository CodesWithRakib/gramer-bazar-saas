import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BroadcastTemplatesService } from '../services/broadcast-templates.service.js';
import {
  BroadcastTemplateResponseDto,
  CreateBroadcastTemplateDto,
  QueryBroadcastTemplatesDto,
  UpdateBroadcastTemplateDto,
  UpdateBroadcastTemplateStatusDto,
} from '../dto/template.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import {
  ApiCommonErrors,
  ApiStandardMessageResponse,
  ApiStandardPaginatedResponse,
  ApiStandardResponse,
} from '../../common/decorators/api-standard-response.decorator.js';

@ApiTags('Broadcast — Templates (Super Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('super-admin/broadcast/templates')
export class BroadcastTemplatesController {
  constructor(private readonly templatesService: BroadcastTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List broadcast templates' })
  @ApiStandardPaginatedResponse(BroadcastTemplateResponseDto)
  @ApiCommonErrors([401, 403])
  findAll(@Query() query: QueryBroadcastTemplatesDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a broadcast template' })
  @ApiStandardResponse({ type: BroadcastTemplateResponseDto })
  @ApiCommonErrors([401, 403, 404])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a broadcast template' })
  @ApiStandardResponse({ type: BroadcastTemplateResponseDto, status: HttpStatus.CREATED })
  @ApiCommonErrors([400, 401, 403])
  create(
    @Body() dto: CreateBroadcastTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a broadcast template' })
  @ApiStandardResponse({ type: BroadcastTemplateResponseDto })
  @ApiCommonErrors([400, 401, 403, 404])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBroadcastTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change a broadcast template status' })
  @ApiStandardResponse({ type: BroadcastTemplateResponseDto })
  @ApiCommonErrors([400, 401, 403, 404])
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBroadcastTemplateStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.updateStatus(id, dto.status, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a broadcast template' })
  @ApiStandardMessageResponse({ description: 'Template deleted' })
  @ApiCommonErrors([401, 403, 404])
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.templatesService.remove(id, userId);
  }
}
