import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Announcement, AnnouncementStatus, AudienceType, AnnouncementPriority } from './entities/announcement.entity.js';
import { AnnouncementTemplate } from './entities/announcement-template.entity.js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto.js';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto.js';
import { CreateAnnouncementTemplateDto, UpdateAnnouncementTemplateDto } from './dto/announcement-template.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { User } from '../users/entities/user.entity.js';
import { NotificationType, NotificationPriority } from '../notifications/entities/notification.entity.js';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(AnnouncementTemplate)
    private readonly templateRepo: Repository<AnnouncementTemplate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string) {
    const announcement = this.announcementRepo.create({
      ...createAnnouncementDto,
      createdByUserId: userId,
    });
    
    // If it's sent now, we should process it. 
    // The controller decides whether to call send() or just save.
    return await this.announcementRepo.save(announcement);
  }

  async send(id: string) {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    if (announcement.status === AnnouncementStatus.SENT) {
      throw new BadRequestException('Announcement is already sent');
    }

    announcement.status = AnnouncementStatus.PROCESSING;
    await this.announcementRepo.save(announcement);

    try {
      const recipientIds = await this.resolveRecipients(announcement);
      
      announcement.totalRecipients = recipientIds.length;
      await this.announcementRepo.save(announcement);

      // Deduplication is handled by Set in resolveRecipients
      // Chunking for performance
      const chunkSize = 500;
      let delivered = 0;
      let failed = 0;

      for (let i = 0; i < recipientIds.length; i += chunkSize) {
        const chunk = recipientIds.slice(i, i + chunkSize);
        
        let notifPriority = NotificationPriority.NORMAL;
        if (announcement.priority === AnnouncementPriority.IMPORTANT) notifPriority = NotificationPriority.HIGH;
        if (announcement.priority === AnnouncementPriority.URGENT) notifPriority = NotificationPriority.CRITICAL;

        try {
          await this.notificationsService.notifyUsers(chunk, {
            type: NotificationType.ADMIN_ANNOUNCEMENT,
            title: announcement.title,
            message: announcement.message,
            priority: notifPriority,
            data: {
              announcementId: announcement.id,
              titleBn: announcement.titleBn,
              messageBn: announcement.messageBn,
              image: announcement.image,
              ctaText: announcement.ctaText,
              ctaLink: announcement.ctaLink,
            },
          });
          delivered += chunk.length;
        } catch (error) {
          this.logger.error(`Failed to send chunk for announcement ${id}`, error);
          failed += chunk.length;
        }
      }

      announcement.totalDelivered = delivered;
      announcement.totalFailed = failed;
      announcement.status = AnnouncementStatus.SENT;
      announcement.sentAt = new Date();
      await this.announcementRepo.save(announcement);
      
      return announcement;
    } catch (error) {
      announcement.status = AnnouncementStatus.FAILED;
      await this.announcementRepo.save(announcement);
      throw error;
    }
  }

  private async resolveRecipients(announcement: Announcement): Promise<string[]> {
    const userIds = new Set<string>();
    const activeUsersQuery = this.userRepo.createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    if (announcement.audienceType === AudienceType.EVERYONE) {
      const users = await activeUsersQuery.select('user.id').getMany();
      users.forEach(u => userIds.add(u.id));
    } 
    else if (announcement.audienceType === AudienceType.ROLE || announcement.audienceType === AudienceType.MULTIPLE_ROLES) {
      if (announcement.targetRoles && announcement.targetRoles.length > 0) {
        const users = await activeUsersQuery
          .innerJoin('user.roles', 'role')
          .andWhere('role.name IN (:...roles)', { roles: announcement.targetRoles })
          .select('user.id')
          .getMany();
        users.forEach(u => userIds.add(u.id));
      }
    }

    // Add explicitly selected users, regardless of audienceType
    if (announcement.targetUsers && announcement.targetUsers.length > 0) {
      announcement.targetUsers.forEach(id => userIds.add(id));
    }

    return Array.from(userIds);
  }

  async findAll() {
    return this.announcementRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    const announcement = await this.findOne(id);
    if (announcement.status !== AnnouncementStatus.DRAFT && announcement.status !== AnnouncementStatus.SCHEDULED) {
      throw new BadRequestException('Cannot update an announcement that is already processing or sent');
    }
    
    Object.assign(announcement, updateAnnouncementDto);
    return this.announcementRepo.save(announcement);
  }

  async remove(id: string) {
    const announcement = await this.findOne(id);
    return this.announcementRepo.remove(announcement);
  }

  async cancelScheduled(id: string) {
    const announcement = await this.findOne(id);
    if (announcement.status !== AnnouncementStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled announcements can be cancelled');
    }
    announcement.status = AnnouncementStatus.CANCELLED;
    return this.announcementRepo.save(announcement);
  }

  // Cron / Scheduler method
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledAnnouncements() {
    const announcements = await this.announcementRepo.find({
      where: {
        status: AnnouncementStatus.SCHEDULED,
        scheduledAt: LessThanOrEqual(new Date())
      }
    });

    for (const announcement of announcements) {
      try {
        await this.send(announcement.id);
      } catch (error) {
        this.logger.error(`Failed to process scheduled announcement ${announcement.id}`, error);
      }
    }
  }

  // --- Templates ---
  async createTemplate(createTemplateDto: CreateAnnouncementTemplateDto) {
    const template = this.templateRepo.create(createTemplateDto);
    return this.templateRepo.save(template);
  }

  async findAllTemplates() {
    return this.templateRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOneTemplate(id: string) {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateTemplate(id: string, updateTemplateDto: UpdateAnnouncementTemplateDto) {
    const template = await this.findOneTemplate(id);
    Object.assign(template, updateTemplateDto);
    return this.templateRepo.save(template);
  }

  async removeTemplate(id: string) {
    const template = await this.findOneTemplate(id);
    return this.templateRepo.remove(template);
  }
}
