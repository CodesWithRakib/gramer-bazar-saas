import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity.js';
import { DisputeMessage } from './entities/dispute-message.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { CreateDisputeDto } from './dto/create-dispute.dto.js';
import { AddDisputeMessageDto } from './dto/add-dispute-message.dto.js';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto.js';
import { DisputeStatus } from './enums/dispute-status.enum.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeMessage)
    private readonly disputeMessageRepository: Repository<DisputeMessage>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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

    return this.disputeRepository.save(dispute);
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
      relations: ['order', 'customer', 'seller'],
    });
  }

  async getDisputeDetails(id: string, userId: string, role: string) {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['order', 'customer', 'seller', 'messages', 'messages.sender'],
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
    dispute.messages = dispute.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return dispute;
  }

  async addMessage(disputeId: string, senderId: string, role: string, dto: AddDisputeMessageDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (role === 'customer' && dispute.customerId !== senderId) throw new BadRequestException('Unauthorized');
    if (role === 'seller' && dispute.sellerId !== senderId) throw new BadRequestException('Unauthorized');

    const message = this.disputeMessageRepository.create({
      disputeId,
      senderId,
      senderRole: role.toUpperCase(),
      message: dto.message,
      attachment: dto.attachment,
    });

    await this.disputeMessageRepository.save(message);

    // If a new message is added, change status back to UNDER_REVIEW if it was OPEN
    if (dispute.status === DisputeStatus.OPEN) {
      dispute.status = DisputeStatus.UNDER_REVIEW;
      await this.disputeRepository.save(dispute);
    }

    return message;
  }

  async resolveDispute(disputeId: string, dto: ResolveDisputeDto) {
    const dispute = await this.disputeRepository.findOne({ where: { id: disputeId } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.status = dto.status;
    if (dto.adminDecision) {
      dispute.adminDecision = dto.adminDecision;
    }

    // If RESOLVED_REFUNDED, the actual refund logic (wallet transfer) would happen here
    // For now, we update the status. Real implementation would update the Order status to REFUNDED as well.

    return this.disputeRepository.save(dispute);
  }
}
