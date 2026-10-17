import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { MachineryItem } from './entities/machinery-item.entity.js';
import { MachineryBooking } from './entities/machinery-booking.entity.js';
import { MachineryInspection } from './entities/machinery-inspection.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  BookingStatus,
  FuelOption,
  InspectionType,
  MachineryPaymentStatus,
  MachineryStatus,
  OperatorOption,
} from './enums/machinery.enum.js';
import {
  CreateMachineryBookingDto,
  CreateMachineryInspectionDto,
  CreateMachineryItemDto,
  QueryMachineryDto,
  QuoteMachineryBookingDto,
  ResolveDepositDto,
  UpdateBookingStatusDto,
  UpdateMachineryItemDto,
} from './dto/machinery.dto.js';

@Injectable()
export class MachineryRentalService {
  constructor(
    @InjectRepository(MachineryItem)
    private readonly itemRepo: Repository<MachineryItem>,
    @InjectRepository(MachineryBooking)
    private readonly bookingRepo: Repository<MachineryBooking>,
    @InjectRepository(MachineryInspection)
    private readonly inspectionRepo: Repository<MachineryInspection>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // --- Machinery Catalog Management ---

  async createItem(ownerId: string, dto: CreateMachineryItemDto): Promise<MachineryItem> {
    const owner = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner account not found');
    }

    const item = this.itemRepo.create({
      ...dto,
      ownerId,
      status: MachineryStatus.AVAILABLE,
      baseRate: Number(dto.baseRate),
      securityDeposit: Number(dto.securityDeposit || 0),
      operatorDailyAllowance: Number(dto.operatorDailyAllowance || 0),
      serviceRadiusKm: dto.serviceRadiusKm || 15,
      neighborClusterDiscountPct: dto.neighborClusterDiscountPct !== undefined ? Number(dto.neighborClusterDiscountPct) : 10.0,
      images: dto.images || [],
    });

    return await this.itemRepo.save(item);
  }

  async updateItem(
    id: string,
    userId: string,
    dto: UpdateMachineryItemDto,
    isAdmin = false,
  ): Promise<MachineryItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Machinery item not found');
    }

    if (!isAdmin && item.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this machinery item');
    }

    Object.assign(item, {
      ...dto,
      baseRate: dto.baseRate !== undefined ? Number(dto.baseRate) : item.baseRate,
      securityDeposit: dto.securityDeposit !== undefined ? Number(dto.securityDeposit) : item.securityDeposit,
      operatorDailyAllowance:
        dto.operatorDailyAllowance !== undefined
          ? Number(dto.operatorDailyAllowance)
          : item.operatorDailyAllowance,
      neighborClusterDiscountPct:
        dto.neighborClusterDiscountPct !== undefined
          ? Number(dto.neighborClusterDiscountPct)
          : item.neighborClusterDiscountPct,
    });

    return await this.itemRepo.save(item);
  }

  async getItems(query: QueryMachineryDto): Promise<{ items: MachineryItem[]; total: number; page: number; limit: number }> {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.owner', 'owner')
      .where('item.status = :status', { status: MachineryStatus.AVAILABLE });

    if (query.category) {
      qb.andWhere('item.category = :category', { category: query.category });
    }

    if (query.district) {
      qb.andWhere('LOWER(item.district) = LOWER(:district)', { district: query.district.trim() });
    }

    if (query.upazila) {
      qb.andWhere('LOWER(item.upazila) = LOWER(:upazila)', { upazila: query.upazila.trim() });
    }

    if (query.pricingBasis) {
      qb.andWhere('item.pricingBasis = :pricingBasis', { pricingBasis: query.pricingBasis });
    }

    if (query.minRate !== undefined) {
      qb.andWhere('item.baseRate >= :minRate', { minRate: query.minRate });
    }

    if (query.maxRate !== undefined) {
      qb.andWhere('item.baseRate <= :maxRate', { maxRate: query.maxRate });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(item.titleEn) LIKE LOWER(:search) OR LOWER(item.titleBn) LIKE LOWER(:search) OR LOWER(item.modelNumber) LIKE LOWER(:search))',
        { search: `%${query.search.trim()}%` },
      );
    }

    qb.orderBy('item.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getItemById(id: string): Promise<MachineryItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!item) {
      throw new NotFoundException('Machinery item not found');
    }
    return item;
  }

  async getOwnerItems(ownerId: string): Promise<MachineryItem[]> {
    return await this.itemRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  // --- Booking Quotation & Neighbor Cluster Routing ---

  async calculateQuote(dto: QuoteMachineryBookingDto): Promise<{
    item: MachineryItem;
    plotSizeValue: number;
    baseRate: number;
    totalRentalFee: number;
    fuelSurcharge: number;
    operatorFee: number;
    isClusterDiscountApplied: boolean;
    clusterDiscountAmount: number;
    securityDeposit: number;
    grandTotal: number;
    clusterTag: string | null;
  }> {
    const item = await this.getItemById(dto.machineryId);

    const plotSizeValue = Number(dto.plotSizeValue);
    if (plotSizeValue <= 0) {
      throw new BadRequestException('Plot size / hours must be greater than 0');
    }

    const baseRate = Number(item.baseRate);
    const totalRentalFee = Number((baseRate * plotSizeValue).toFixed(2));

    // Fuel calculation
    let fuelSurcharge = 0;
    if (dto.fuelOption === FuelOption.FUEL_INCLUDED && item.fuelOption === FuelOption.FUEL_EXCLUDED) {
      // Owner charges supplemental fuel rate (e.g. 150 BDT / unit)
      fuelSurcharge = Number((150 * plotSizeValue).toFixed(2));
    }

    // Operator calculation
    let operatorFee = 0;
    if (dto.operatorOption === OperatorOption.OPERATOR_INCLUDED) {
      operatorFee = Number(item.operatorDailyAllowance || 0);
    }

    // Neighbor Cluster Detection:
    // Check if there are other bookings scheduled within ±3 days in the same Upazila/Union
    const targetStart = new Date(dto.startDate);
    const windowStart = new Date(targetStart.getTime() - 3 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(targetStart.getTime() + 3 * 24 * 60 * 60 * 1000);

    const nearbyBookings = await this.bookingRepo.find({
      where: {
        machineryId: item.id,
        plotUpazila: dto.plotUpazila,
        status: Between(BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS),
        startDate: Between(windowStart, windowEnd),
      },
      take: 5,
    });

    let isClusterDiscountApplied = false;
    let clusterDiscountAmount = 0;
    let clusterTag: string | null = null;

    if (nearbyBookings.length > 0 || (dto.plotUnion && dto.plotUnion.length > 0)) {
      isClusterDiscountApplied = true;
      const discountPct = Number(item.neighborClusterDiscountPct || 10.0);
      clusterDiscountAmount = Number(((totalRentalFee * discountPct) / 100).toFixed(2));
      const formattedDate = targetStart.toISOString().split('T')[0]?.replace(/-/g, '') || 'DATE';
      clusterTag = `CLUSTER-${dto.plotDistrict.toUpperCase()}-${dto.plotUpazila.toUpperCase()}-${formattedDate}`;
    }

    const securityDeposit = Number(item.securityDeposit || 0);
    const grandTotal = Number(
      (totalRentalFee + fuelSurcharge + operatorFee - clusterDiscountAmount + securityDeposit).toFixed(2),
    );

    return {
      item,
      plotSizeValue,
      baseRate,
      totalRentalFee,
      fuelSurcharge,
      operatorFee,
      isClusterDiscountApplied,
      clusterDiscountAmount,
      securityDeposit,
      grandTotal,
      clusterTag,
    };
  }

  // --- Bookings Lifecycle ---

  async createBooking(renterId: string, dto: CreateMachineryBookingDto): Promise<MachineryBooking> {
    const renter = await this.userRepo.findOne({ where: { id: renterId } });
    if (!renter) {
      throw new NotFoundException('Renter account not found');
    }

    const quote = await this.calculateQuote(dto);

    // Generate unique booking reference: e.g. MRENT-2026-X8B9
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const currentYear = new Date().getFullYear();
    const bookingReference = `MRENT-${currentYear}-${randomSuffix}`;

    const booking = this.bookingRepo.create({
      bookingReference,
      machineryId: quote.item.id,
      renterId,
      renterName: dto.renterName,
      renterPhone: dto.renterPhone,
      plotAddress: dto.plotAddress,
      plotDistrict: dto.plotDistrict,
      plotUpazila: dto.plotUpazila,
      plotUnion: dto.plotUnion || null,
      plotVillage: dto.plotVillage || null,
      plotSizeValue: quote.plotSizeValue,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      baseRate: quote.baseRate,
      totalRentalFee: quote.totalRentalFee,
      fuelOption: dto.fuelOption || quote.item.fuelOption,
      fuelSurcharge: quote.fuelSurcharge,
      operatorOption: dto.operatorOption || quote.item.operatorOption,
      operatorFee: quote.operatorFee,
      isClusterDiscountApplied: quote.isClusterDiscountApplied,
      clusterDiscountAmount: quote.clusterDiscountAmount,
      securityDeposit: quote.securityDeposit,
      grandTotal: quote.grandTotal,
      status: BookingStatus.CONFIRMED,
      paymentStatus: MachineryPaymentStatus.ESCROW_HOLD,
      clusterTag: quote.clusterTag,
      notes: dto.notes || null,
    });

    return await this.bookingRepo.save(booking);
  }

  async getBookingById(id: string, userId?: string, isAdmin = false): Promise<MachineryBooking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['machinery', 'machinery.owner', 'renter', 'inspections'],
    });

    if (!booking) {
      throw new NotFoundException('Machinery booking not found');
    }

    if (
      userId &&
      !isAdmin &&
      booking.renterId !== userId &&
      booking.machinery?.ownerId !== userId
    ) {
      throw new ForbiddenException('Access to this booking is unauthorized');
    }

    return booking;
  }

  async getMyBookings(renterId: string): Promise<MachineryBooking[]> {
    return await this.bookingRepo.find({
      where: { renterId },
      relations: ['machinery', 'inspections'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOwnerBookings(ownerId: string): Promise<MachineryBooking[]> {
    return await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.machinery', 'machinery')
      .leftJoinAndSelect('booking.renter', 'renter')
      .leftJoinAndSelect('booking.inspections', 'inspections')
      .where('machinery.owner_id = :ownerId', { ownerId })
      .orderBy('booking.createdAt', 'DESC')
      .getMany();
  }

  async updateBookingStatus(
    id: string,
    userId: string,
    dto: UpdateBookingStatusDto,
    isAdmin = false,
  ): Promise<MachineryBooking> {
    const booking = await this.getBookingById(id);

    const isOwner = booking.machinery?.ownerId === userId;
    const isRenter = booking.renterId === userId;

    if (!isAdmin && !isOwner && !isRenter) {
      throw new ForbiddenException('You are not authorized to update this booking status');
    }

    // Status transitions
    if (dto.status === BookingStatus.CANCELLED) {
      if (booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a booking that is in progress or completed');
      }
      booking.status = BookingStatus.CANCELLED;
      booking.paymentStatus = MachineryPaymentStatus.REFUNDED;
      booking.cancellationReason = dto.cancellationReason || 'Cancelled by user';
    } else {
      booking.status = dto.status;
    }

    return await this.bookingRepo.save(booking);
  }

  // --- Pre-Dispatch & Post-Return Inspection Sign-off ---

  async submitInspection(
    bookingId: string,
    inspectorId: string,
    dto: CreateMachineryInspectionDto,
  ): Promise<MachineryInspection> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['machinery'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const inspection = this.inspectionRepo.create({
      bookingId: booking.id,
      machineryId: booking.machineryId,
      inspectorId,
      inspectionType: dto.inspectionType,
      meterHours: Number(dto.meterHours),
      fuelLevelPct: Number(dto.fuelLevelPct),
      isEngineOperational: dto.isEngineOperational,
      isOperational: dto.isOperational,
      damageNotes: dto.damageNotes || null,
      damagePhotos: dto.damagePhotos || [],
      claimDamageDeduction: dto.claimDamageDeduction ? Number(dto.claimDamageDeduction) : 0,
      isApprovedByRenter: false,
    });

    const savedInspection = await this.inspectionRepo.save(inspection);

    // If post-return inspection has damage claim, mark booking as DISPUTED
    if (dto.inspectionType === InspectionType.POST_RETURN) {
      if (dto.claimDamageDeduction && dto.claimDamageDeduction > 0) {
        booking.status = BookingStatus.DISPUTED;
      } else {
        booking.status = BookingStatus.COMPLETED;
        booking.paymentStatus = MachineryPaymentStatus.PAID; // Full deposit cleared
      }
      await this.bookingRepo.save(booking);
    } else if (dto.inspectionType === InspectionType.PRE_DISPATCH) {
      booking.status = BookingStatus.IN_PROGRESS;
      await this.bookingRepo.save(booking);
    }

    return savedInspection;
  }

  // --- Admin Dispute Resolution & Escrow Settlement ---

  async resolveDeposit(
    bookingId: string,
    dto: ResolveDepositDto,
  ): Promise<MachineryBooking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['machinery'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (dto.deductDamageAmount > 0) {
      booking.paymentStatus = MachineryPaymentStatus.PARTIAL_RELEASE;
    } else {
      booking.paymentStatus = MachineryPaymentStatus.REFUNDED;
    }

    booking.status = BookingStatus.COMPLETED;
    booking.notes = `${booking.notes ? booking.notes + ' | ' : ''}[Dispute Resolved]: Refunded: ৳${dto.refundDepositAmount}, Deducted: ৳${dto.deductDamageAmount}. Note: ${dto.adminNotes}`;

    return await this.bookingRepo.save(booking);
  }

  async getAllBookings(query?: { status?: BookingStatus }): Promise<MachineryBooking[]> {
    const qb = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.machinery', 'machinery')
      .leftJoinAndSelect('booking.machinery.owner', 'owner')
      .leftJoinAndSelect('booking.renter', 'renter')
      .leftJoinAndSelect('booking.inspections', 'inspections');

    if (query?.status) {
      qb.where('booking.status = :status', { status: query.status });
    }

    qb.orderBy('booking.createdAt', 'DESC');
    return await qb.getMany();
  }
}
