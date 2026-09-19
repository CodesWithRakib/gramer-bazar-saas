import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRequest, PayoutStatus } from './entities/payout-request.entity.js';
import { CreatePayoutDto } from './dto/create-payout.dto.js';
import { ReviewPayoutDto } from './dto/review-payout.dto.js';
import { WalletsService } from '../wallets/wallets.service.js';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(PayoutRequest)
    private payoutsRepository: Repository<PayoutRequest>,
    private walletsService: WalletsService,
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

    return await this.payoutsRepository.save(request);
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
        request.id
      );
    } else if (reviewDto.status === PayoutStatus.REJECTED) {
      await this.walletsService.rejectPayout(request.sellerId, request.amount);
    }

    request.status = reviewDto.status;
    request.adminNote = reviewDto.adminNote || null;
    
    return await this.payoutsRepository.save(request);
  }
}
