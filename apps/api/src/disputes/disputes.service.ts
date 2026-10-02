import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Dispute } from './entities/dispute.entity.js';
import { DisputeMessage } from './entities/dispute-message.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { CreateDisputeDto } from './dto/create-dispute.dto.js';
import { AddDisputeMessageDto } from './dto/add-dispute-message.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { RejectDisputeDto } from './dto/reject-dispute.dto.js';
import { AddInternalNoteDto } from './dto/add-internal-note.dto.js';
import { DisputeStatus } from './enums/dispute-status.enum.js';
import { DisputeResolutionType } from './enums/dispute-resolution-type.enum.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { WalletsService } from '../wallets/wallets.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType, NotificationPriority } from '../notifications/entities/notification.entity.js';
import { DisputeInternalNote } from './entities/dispute-internal-note.entity.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeMessage)
    private readonly disputeMessageRepository: Repository<DisputeMessage>,
    @InjectRepository(DisputeInternalNote)
    private readonly disputeInternalNoteRepository: Repository<DisputeInternalNote>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly walletsService: WalletsService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createDispute(customerId: string, createDisputeDto: CreateDisputeDto) {
    const order = await this.orderRepository.findOne({
      where: { id: createDisputeDto.orderId, userId: customerId },
      relations: ['items', 'items.sellerProduct', 'items.sellerProduct.shop', 'statusHistory'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Can only dispute delivered orders');
    }

    // Check time limit (e.g., 7 days)
    const deliveryHistory = order.statusHistory?.find((h) => h.status === OrderStatus.DELIVERED);
    const deliveredAt = deliveryHistory ? deliveryHistory.createdAt : order.updatedAt;

    if (new Date().getTime() - new Date(deliveredAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Dispute window (7 days) has expired');
    }

    const existingDispute = await this.disputeRepository.findOne({ where: { orderId: order.id } });
    if (existingDispute) {
      throw new BadRequestException('A dispute already exists for this order');
    }

    const sellerId = order.items?.[0]?.sellerProduct?.shop?.sellerId;
    if (!sellerId) {
      throw new BadRequestException('Could not determine seller for this order');
    }

    const dispute = this.disputeRepository.create({
      ...createDisputeDto,
      customerId,
      sellerId,
      status: DisputeStatus.OPEN,
    });

    const savedDispute = await this.disputeRepository.save(dispute);
    
    // Audit Log
    void this.auditLogsService?.record?.({
      actorId: customerId,
      action: 'DISPUTE_CREATED',
      targetType: 'Dispute',
      targetId: savedDispute.id,
      details: JSON.stringify({ orderId: order.id, reason: savedDispute.reason }),
    });

    // Real-time Event
    this.eventEmitter.emit('dispute.created', {
      disputeId: savedDispute.id,
      orderId: order.id,
      customerId,
      sellerId,
      reason: savedDispute.reason,
      status: savedDispute.status,
      createdAt: savedDispute.createdAt ? savedDispute.createdAt.toISOString() : new Date().toISOString(),
    });

    // Notify Seller
    void this.notificationsService?.notifyUser?.(sellerId, {
      type: NotificationType.DISPUTE_OPENED,
      title: 'New Dispute Opened',
      message: `A new dispute has been opened for order #${order.id.slice(0, 8).toUpperCase()}.`,
      titleKey: 'notifications.dispute_opened.title',
      messageKey: 'notifications.dispute_opened.message',
      priority: NotificationPriority.HIGH,
      data: { disputeId: savedDispute.id, orderId: order.id },
    });

    return savedDispute;
  }

  async getCustomerDisputes(customerId: string) {
    return this.disputeRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      relations: ['order', 'seller'],
    });
  }

  async getSellerDisputes(sellerId: string) {
    return this.disputeRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      relations: ['order', 'customer'],
    });
  }

  async getAdminDisputes() {
    return this.disputeRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['order', 'customer', 'seller', 'internalNotes'],
    });
  }

  async getDisputeDetails(id: string, userId: string, role: string) {
    const relations = ['order', 'customer', 'seller', 'messages', 'messages.sender'];
    if (role === 'admin') {
      relations.push('internalNotes', 'internalNotes.createdBy');
    }

    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations,
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (role === 'customer' && dispute.customerId !== userId) {
      throw new BadRequestException('Not authorized to view this dispute');
    }
    if (role === 'seller' && dispute.sellerId !== userId) {
      throw new BadRequestException('Not authorized to view this dispute');
    }

    // Sort messages by creation date
    dispute.messages = dispute.messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    return dispute;
  }

  async addMessage(disputeId: string, senderId: string, role: string, dto: AddDisputeMessageDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (role === 'customer' && dispute.customerId !== senderId)
      throw new BadRequestException('Unauthorized');
    if (role === 'seller' && dispute.sellerId !== senderId)
      throw new BadRequestException('Unauthorized');

    const message = this.disputeMessageRepository.create({
      disputeId,
      senderId,
      senderRole: role.toUpperCase(),
      message: dto.message,
      attachment: dto.attachment,
    });

    const savedMessage = await this.disputeMessageRepository.save(message);

    // If a new message is added, change status back to UNDER_REVIEW if it was OPEN
    if (dispute.status === DisputeStatus.OPEN) {
      dispute.status = DisputeStatus.UNDER_REVIEW;
      await this.disputeRepository.save(dispute);
      this.eventEmitter.emit('dispute.status.updated', {
        disputeId: dispute.id,
        orderId: dispute.orderId,
        customerId: dispute.customerId,
        sellerId: dispute.sellerId,
        status: dispute.status,
        updatedAt: new Date().toISOString(),
      });
    }

    // Real-time Event for new message
    this.eventEmitter.emit('dispute.message.created', {
      disputeId: dispute.id,
      messageId: savedMessage.id,
      senderId,
      senderRole: role.toUpperCase(),
      customerId: dispute.customerId,
      sellerId: dispute.sellerId,
      message: savedMessage.message,
      createdAt: savedMessage.createdAt ? savedMessage.createdAt.toISOString() : new Date().toISOString(),
    });

    // Audit log if admin message
    if (role === 'admin') {
      void this.auditLogsService?.record?.({
        actorId: senderId,
        action: 'DISPUTE_ADMIN_MESSAGE',
        targetType: 'Dispute',
        targetId: dispute.id,
        details: JSON.stringify({ messageId: savedMessage.id }),
      });
    }

    // Notify the other party
    const targetUserId = role === 'customer' ? dispute.sellerId : (role === 'seller' ? dispute.customerId : null);
    if (targetUserId) {
      void this.notificationsService?.notifyUser?.(targetUserId, {
        type: NotificationType.DISPUTE_MESSAGE,
        title: 'New Dispute Message',
        message: `You have a new message regarding dispute #${dispute.id.slice(0, 8).toUpperCase()}.`,
        titleKey: 'notifications.dispute_message.title',
        messageKey: 'notifications.dispute_message.message',
        priority: NotificationPriority.NORMAL,
        data: { disputeId: dispute.id },
      });
    } else if (role === 'admin') {
      // Notify both customer and seller
      void this.notificationsService?.notifyUsers?.([dispute.customerId, dispute.sellerId], {
        type: NotificationType.DISPUTE_MESSAGE,
        title: 'New Dispute Message from Admin',
        message: `Admin has replied to dispute #${dispute.id.slice(0, 8).toUpperCase()}.`,
        titleKey: 'notifications.dispute_admin_message.title',
        messageKey: 'notifications.dispute_admin_message.message',
        priority: NotificationPriority.HIGH,
        data: { disputeId: dispute.id },
      });
    }

    return savedMessage;
  }

  async addInternalNote(disputeId: string, adminId: string, dto: AddInternalNoteDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const note = this.disputeInternalNoteRepository.create({
      disputeId,
      createdById: adminId,
      note: dto.note,
    });

    const savedNote = await this.disputeInternalNoteRepository.save(note);

    void this.auditLogsService?.record?.({
      actorId: adminId,
      action: 'DISPUTE_INTERNAL_NOTE_ADDED',
      targetType: 'Dispute',
      targetId: disputeId,
      details: JSON.stringify({ noteId: savedNote.id }),
    });

    return savedNote;
  }

  async resolveDispute(disputeId: string, adminId: string, dto: ResolveDisputeDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId }, relations: ['order'] });
    if (!dispute) throw new NotFoundException('Dispute not found');

    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolutionType = dto.resolutionType;
    if (dto.adminDecision) dispute.adminDecision = dto.adminDecision;
    if (dto.refundAmount) dispute.refundAmount = dto.refundAmount;

    // Refund Logic
    if (dto.resolutionType === DisputeResolutionType.FULL_REFUND || dto.resolutionType === DisputeResolutionType.PARTIAL_REFUND) {
      const amount = dto.refundAmount || Number(dispute.order.total);
      
      // Debit seller, credit customer
      await this.walletsService.requestPayoutDebit(dispute.sellerId, amount);
      await this.walletsService.approvePayout(dispute.sellerId, amount, `Dispute Refund: ${dispute.id}`);
      
      await this.walletsService.creditEarnings(
        dispute.customerId, 
        amount, 
        `Dispute Refund: ${dispute.id}`, 
        dispute.id
      );
    }

    if (dto.internalNote) {
      await this.addInternalNote(disputeId, adminId, { note: dto.internalNote });
    }

    const savedDispute = await this.disputeRepository.save(dispute);

    // Audit Log
    void this.auditLogsService?.record?.({
      actorId: adminId,
      action: 'DISPUTE_RESOLVED',
      targetType: 'Dispute',
      targetId: dispute.id,
      details: JSON.stringify({
        resolutionType: dto.resolutionType,
        refundAmount: dispute.refundAmount,
        adminDecision: dto.adminDecision,
      }),
    });

    // Real-time Event
    this.eventEmitter.emit('dispute.status.updated', {
      disputeId: dispute.id,
      orderId: dispute.orderId,
      customerId: dispute.customerId,
      sellerId: dispute.sellerId,
      status: DisputeStatus.RESOLVED,
      resolutionType: dto.resolutionType,
      refundAmount: dispute.refundAmount,
      adminDecision: dto.adminDecision,
      updatedAt: new Date().toISOString(),
    });

    // Notify users
    void this.notificationsService?.notifyUsers?.([dispute.customerId, dispute.sellerId], {
      type: NotificationType.DISPUTE_RESOLVED,
      title: 'Dispute Resolved',
      message: `Dispute #${dispute.id.slice(0, 8).toUpperCase()} has been resolved.`,
      titleKey: 'notifications.dispute_resolved.title',
      messageKey: 'notifications.dispute_resolved.message',
      priority: NotificationPriority.HIGH,
      data: { disputeId: dispute.id, resolutionType: dto.resolutionType },
    });

    return savedDispute;
  }

  async rejectDispute(disputeId: string, adminId: string, dto: RejectDisputeDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    dispute.status = DisputeStatus.REJECTED;
    dispute.adminDecision = dto.reason;
    dispute.resolutionType = DisputeResolutionType.REJECTED;

    if (dto.internalNote) {
      await this.addInternalNote(disputeId, adminId, { note: dto.internalNote });
    }

    const savedDispute = await this.disputeRepository.save(dispute);

    // Audit Log
    void this.auditLogsService?.record?.({
      actorId: adminId,
      action: 'DISPUTE_REJECTED',
      targetType: 'Dispute',
      targetId: dispute.id,
      details: JSON.stringify({ reason: dto.reason }),
    });

    // Real-time Event
    this.eventEmitter.emit('dispute.status.updated', {
      disputeId: dispute.id,
      orderId: dispute.orderId,
      customerId: dispute.customerId,
      sellerId: dispute.sellerId,
      status: DisputeStatus.REJECTED,
      resolutionType: DisputeResolutionType.REJECTED,
      adminDecision: dto.reason,
      updatedAt: new Date().toISOString(),
    });

    // Notify users
    void this.notificationsService?.notifyUsers?.([dispute.customerId, dispute.sellerId], {
      type: NotificationType.DISPUTE_RESOLVED,
      title: 'Dispute Rejected',
      message: `Dispute #${dispute.id.slice(0, 8).toUpperCase()} has been rejected.`,
      titleKey: 'notifications.dispute_rejected.title',
      messageKey: 'notifications.dispute_rejected.message',
      priority: NotificationPriority.HIGH,
      data: { disputeId: dispute.id },
    });

    return savedDispute;
  }
}
