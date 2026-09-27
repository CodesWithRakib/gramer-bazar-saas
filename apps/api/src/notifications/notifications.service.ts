import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Resend } from 'resend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './entities/notification.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { CreateNotificationDto, NotifyRoleOptions } from './dto/create-notification.dto.js';
import { QueryNotificationsDto } from './dto/notification-response.dto.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private defaultFromEmail: string;
  private fromName: string;

  constructor(
    private configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.defaultFromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    this.fromName = this.configService.get<string>('RESEND_FROM_NAME') || 'Gramer Bazar';

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not configured. Emails will not be sent.');
    }
  }

  // --- In-App Notifications ---

  /**
   * Persists a notification to the database and emits real-time event.
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const entity = this.notificationRepo.create({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        titleKey: dto.titleKey || null,
        messageKey: dto.messageKey || null,
        priority: dto.priority || NotificationPriority.NORMAL,
        data: dto.data || null,
      });

      const saved = await this.notificationRepo.save(entity);

      this.eventEmitter.emit('notification.created', {
        id: saved.id,
        userId: saved.userId,
        type: saved.type,
        title: saved.title,
        message: saved.message,
        titleKey: saved.titleKey,
        messageKey: saved.messageKey,
        priority: saved.priority,
        data: saved.data,
        createdAt: saved.createdAt ? saved.createdAt.toISOString() : new Date().toISOString(),
      });

      return saved;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`Failed to create notification for user ${dto.userId}: ${error.message}`, error.stack);
      throw err;
    }
  }

  /**
   * Batch creates notifications for multiple recipients.
   */
  async createMany(dtos: CreateNotificationDto[]): Promise<Notification[]> {
    if (!dtos || dtos.length === 0) return [];

    try {
      const entities = dtos.map((dto) =>
        this.notificationRepo.create({
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          titleKey: dto.titleKey || null,
          messageKey: dto.messageKey || null,
          priority: dto.priority || NotificationPriority.NORMAL,
          data: dto.data || null,
        }),
      );

      const saved = await this.notificationRepo.save(entities);

      for (const item of saved) {
        this.eventEmitter.emit('notification.created', {
          id: item.id,
          userId: item.userId,
          type: item.type,
          title: item.title,
          message: item.message,
          titleKey: item.titleKey,
          messageKey: item.messageKey,
          priority: item.priority,
          data: item.data,
          createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
        });
      }

      return saved;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`Failed to batch create notifications: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Helper to notify a single user safely (does not throw if notification fails).
   */
  async notifyUser(
    userId: string,
    options: {
      type: NotificationType;
      title: string;
      message: string;
      titleKey?: string | null;
      messageKey?: string | null;
      priority?: NotificationPriority;
      data?: Record<string, unknown> | null;
    },
  ): Promise<Notification | null> {
    try {
      return await this.create({
        userId,
        ...options,
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Safe notification delivery failed for user ${userId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Helper to notify multiple users safely.
   */
  async notifyUsers(
    userIds: string[],
    options: {
      type: NotificationType;
      title: string;
      message: string;
      titleKey?: string | null;
      messageKey?: string | null;
      priority?: NotificationPriority;
      data?: Record<string, unknown> | null;
    },
  ): Promise<Notification[]> {
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    if (uniqueIds.length === 0) return [];

    const dtos: CreateNotificationDto[] = uniqueIds.map((userId) => ({
      userId,
      ...options,
    }));

    return this.createMany(dtos);
  }

  /**
   * Notifies all active users holding a specific role (e.g. ADMIN or SUPER_ADMIN).
   */
  async notifyRole(role: Role, options: NotifyRoleOptions): Promise<Notification[]> {
    try {
      const users = await this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role')
        .where('role.name = :roleName', { roleName: role })
        .getMany();

      if (!users || users.length === 0) return [];

      const userIds = users.map((u) => u.id);
      return await this.notifyUsers(userIds, options);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(`Failed to notify role ${role}: ${error.message}`);
      return [];
    }
  }

  /**
   * Retrieves notifications for a user, ordered newest first with optional pagination/filtering.
   */
  async getUserNotifications(userId: string, query?: QueryNotificationsDto): Promise<Notification[]> {
    const limit = query?.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 50;
    const page = query?.page ? Math.max(Number(query.page), 1) : 1;
    const skip = (page - 1) * limit;

    const qb = this.notificationRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    if (query?.unreadOnly) {
      qb.andWhere('n.isRead = :isRead', { isRead: false });
    }

    return qb.getMany();
  }

  /**
   * Fast unread count query utilizing (userId, isRead, createdAt) index.
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  /**
   * Marks a single notification as read and emits real-time sync event.
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepo.save(notification);

      this.eventEmitter.emit('notification.read', {
        id: notification.id,
        userId: notification.userId,
      });
    }

    return notification;
  }

  /**
   * Marks all unread notifications of user as read and emits sync event.
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    this.eventEmitter.emit('notification.all_read', { userId });
    return { success: true };
  }

  // --- Email Notifications ---

  async sendOrderConfirmationEmail(to: string, orderDetails: { id: string; total?: number | string }) {
    if (!this.resend) {
      this.logger.warn(`Skipping order confirmation email for ${to} because Resend is not configured.`);
      return false;
    }

    try {
      const orderShortId = orderDetails.id.substring(0, 8);
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.defaultFromEmail}>`,
        to: [to],
        subject: `Order Confirmation - #${orderShortId}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Your order <strong>#${orderShortId}</strong> has been successfully placed.</p>
          <p><strong>Total Amount:</strong> ৳${orderDetails.total ?? 0}</p>
          <p>We will notify you once it ships.</p>
          <br/>
          <p>Regards,<br/>Gramer Bazar Team</p>
        `,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}`, error);
        return false;
      }

      this.logger.log(`Order confirmation email sent to ${to}, ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    if (!this.resend) return false;

    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.defaultFromEmail}>`,
        to: [to],
        subject: `Welcome to Gramer Bazar!`,
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>We are excited to have you on board. Start shopping for authentic local products today.</p>
        `,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${to}`, error);
      return false;
    }
  }
}
