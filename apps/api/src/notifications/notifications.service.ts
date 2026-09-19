import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;
  private defaultFromEmail: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.defaultFromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not configured. Emails will not be sent.');
    }
  }

  // --- In-App Notifications ---

  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { success: true };
  }

  // --- Email Notifications ---

  async sendOrderConfirmationEmail(to: string, orderDetails: any) {
    if (!this.resend) {
      this.logger.warn(`Skipping order confirmation email for ${to} because Resend is not configured.`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Gramer Bazar <${this.defaultFromEmail}>`,
        to: [to],
        subject: `Order Confirmation - #${orderDetails.id.substring(0, 8)}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Your order <strong>#${orderDetails.id.substring(0, 8)}</strong> has been successfully placed.</p>
          <p><strong>Total Amount:</strong> ৳${orderDetails.total}</p>
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
    if (!this.resend) return;

    try {
      await this.resend.emails.send({
        from: `Gramer Bazar <${this.defaultFromEmail}>`,
        to: [to],
        subject: `Welcome to Gramer Bazar!`,
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>We are excited to have you on board. Start shopping for authentic local products today.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${to}`, error);
    }
  }
}
