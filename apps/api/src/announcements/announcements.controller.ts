import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { CreateAnnouncementTemplateDto, UpdateAnnouncementTemplateDto } from './dto/announcement-template.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new announcement or draft (Super Admin only)' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @CurrentUser('id') userId: string) {
    return this.announcementsService.create(createAnnouncementDto, userId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a draft or scheduled announcement immediately' })
  send(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.send(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements (history)' })
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all announcement templates' })
  findAllTemplates() {
    return this.announcementsService.findAllTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a specific announcement template' })
  findOneTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.findOneTemplate(id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a new announcement template' })
  createTemplate(@Body() createTemplateDto: CreateAnnouncementTemplateDto) {
    return this.announcementsService.createTemplate(createTemplateDto);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update an announcement template' })
  updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateAnnouncementTemplateDto,
  ) {
    return this.announcementsService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete an announcement template' })
  removeTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.removeTemplate(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific announcement' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft or scheduled announcement' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a scheduled announcement' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.cancelScheduled(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.remove(id);
  }
}
