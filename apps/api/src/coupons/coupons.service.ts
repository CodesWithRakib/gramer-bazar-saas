import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon } from './entities/coupon.entity.js';
import { CouponUsage } from './entities/coupon-usage.entity.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { DiscountType } from './enums/discount-type.enum.js';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateCouponDto) {
    const existing = await this.couponRepository.findOne({ where: { code: createDto.code.toUpperCase() } });
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = this.couponRepository.create({
      ...createDto,
      code: createDto.code.toUpperCase(),
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(page?: number, limit?: number, search?: string) {
    if (!page || !limit) {
      return this.couponRepository.find({ order: { createdAt: 'DESC' } });
    }

    const query = this.couponRepository.createQueryBuilder('coupon').orderBy('coupon.createdAt', 'DESC');

    if (search) {
      query.andWhere('coupon.code ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, updateDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    if (updateDto.code) {
      updateDto.code = updateDto.code.toUpperCase();
      if (updateDto.code !== coupon.code) {
        const existing = await this.couponRepository.findOne({ where: { code: updateDto.code } });
        if (existing) throw new BadRequestException('Coupon code already exists');
      }
    }
    
    Object.assign(coupon, updateDto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
    return { success: true };
  }

  // Pure validation for the customer frontend to calculate before checkout
  async validateCoupon(code: string, userId: string, subtotal: number) {
    const coupon = await this.couponRepository.findOne({ where: { code: code.toUpperCase() } });
    
    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is currently inactive');
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      throw new BadRequestException('This coupon is not active yet');
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    if (subtotal < (coupon.minOrderAmount || 0)) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minOrderAmount} BDT is required to use this coupon`);
    }

    // Check user limits
    const userUsageCount = await this.couponUsageRepository.count({
      where: { couponId: coupon.id, userId },
    });

    if (userUsageCount >= coupon.customerUsageLimit) {
      throw new BadRequestException('You have reached the maximum usage limit for this coupon');
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === DiscountType.FIXED) {
      discount = Number(coupon.discountValue);
    } else if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = subtotal * (Number(coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    }

    // Ensure we don't discount more than the subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount: discount,
      subtotalAfterDiscount: subtotal - discount,
    };
  }
}
