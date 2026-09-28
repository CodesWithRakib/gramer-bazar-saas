import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRequest, PayoutStatus } from './entities/payout-request.entity.js';
import { CreatePayoutDto } from './dto/create-payout.dto.js';
import { ReviewPayoutDto } from './dto/review-payout.dto.js';
import { WalletsService } from '../wallets/wallets.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  NotificationType,
  NotificationPriority,
} from '../notifications/entities/notification.entity.js';
import { Role } from '../roles/enums/role.enum.js';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(PayoutRequest)
    private payoutsRepository: Repository<PayoutRequest>,
    private walletsService: WalletsService,
    private notificationsService: NotificationsService,
  ) {}

  async requestPayout(sellerId: string, createPayoutDto: CreatePayoutDto) {
    // 1. Freeze balance via WalletsService
    await this.walletsService.requestPayoutDebit(sellerId, createPayoutDto.amount);

    // 2. Create the Payout Request record
    const request = this.payoutsRepository.create({
      sellerId,
      ...createPayoutDto,
      status: PayoutStatus.PENDING,
    });

    const saved = await this.payoutsRepository.save(request);

    // 3. Notify Admins
    void this.notificationsService.notifyRole(Role.ADMIN, {
      type: NotificationType.PAYOUT_REQUESTED,
      title: 'New Payout Request',
      message: `Seller requested payout of ৳${createPayoutDto.amount} via ${createPayoutDto.method}.`,
      titleKey: 'notifications.payout_requested_admin.title',
      messageKey: 'notifications.payout_requested_admin.message',
      priority: NotificationPriority.NORMAL,
      data: {
        payoutId: saved.id,
        amount: createPayoutDto.amount,
        method: createPayoutDto.method,
        sellerId,
      },
    });

    return saved;
  }

  async getSellerPayouts(sellerId: string) {
    return await this.payoutsRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayouts(status?: PayoutStatus) {
    const where = status ? { status } : {};
    return await this.payoutsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['seller'],
    });
  }

  async reviewPayout(id: string, reviewDto: ReviewPayoutDto) {
    const request = await this.payoutsRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException('Payout request not found');
    }

    if (request.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('This request has already been processed');
    }

    if (reviewDto.status === PayoutStatus.APPROVED) {
      await this.walletsService.approvePayout(
        request.sellerId,
        request.amount,
        `Payout via ${request.method}`,
        request.id,
      );
    } else if (reviewDto.status === PayoutStatus.REJECTED) {
      await this.walletsService.rejectPayout(request.sellerId, request.amount);
    }

    request.status = reviewDto.status;
    request.adminNote = reviewDto.adminNote || null;

    const saved = await this.payoutsRepository.save(request);

    // Notify seller
    if (reviewDto.status === PayoutStatus.APPROVED) {
      void this.notificationsService.notifyUser(request.sellerId, {
        type: NotificationType.PAYOUT_PROCESSED,
        title: 'Payout Approved',
        message: `Your payout request of ৳${request.amount} has been approved.`,
        titleKey: 'notifications.payout_approved.title',
        messageKey: 'notifications.payout_approved.message',
        priority: NotificationPriority.HIGH,
        data: { payoutId: request.id, amount: request.amount },
      });
    } else if (reviewDto.status === PayoutStatus.REJECTED) {
      void this.notificationsService.notifyUser(request.sellerId, {
        type: NotificationType.PAYOUT_REJECTED,
        title: 'Payout Rejected',
        message: `Your payout request of ৳${request.amount} was not approved.`,
        titleKey: 'notifications.payout_rejected.title',
        messageKey: 'notifications.payout_rejected.message',
        priority: NotificationPriority.HIGH,
        data: { payoutId: request.id, amount: request.amount, reason: reviewDto.adminNote },
      });
    }

    return saved;
  }
}
