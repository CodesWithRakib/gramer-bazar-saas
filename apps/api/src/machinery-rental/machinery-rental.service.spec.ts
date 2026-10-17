import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MachineryRentalService } from './machinery-rental.service.js';
import {
  BookingStatus,
  FuelOption,
  InspectionType,
  MachineryCategory,
  MachineryPaymentStatus,
  MachineryStatus,
  OperatorOption,
  PricingBasis,
} from './enums/machinery.enum.js';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('MachineryRentalService', () => {
  let service: MachineryRentalService;
  let mockItemRepo: any;
  let mockBookingRepo: any;
  let mockInspectionRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockItemRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'item-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'item-uuid-1', ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockBookingRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'booking-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'booking-uuid-1', ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockInspectionRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'inspection-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'inspection-uuid-1', ...entity })),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    service = new MachineryRentalService(
      mockItemRepo,
      mockBookingRepo,
      mockInspectionRepo,
      mockUserRepo,
    );
  });

  describe('createItem', () => {
    it('should create a machinery item successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'owner-uuid-1', firstName: 'Rahim' });

      const dto = {
        titleEn: 'Kubota Combined Harvester DC-70',
        titleBn: 'কুবাটো কম্বাইন্ড হারভেস্টার ডিসি-৭০',
        category: MachineryCategory.COMBINE_HARVESTER,
        pricingBasis: PricingBasis.PER_BIGHA,
        baseRate: 1500,
        securityDeposit: 2000,
        fuelOption: FuelOption.FUEL_INCLUDED,
        operatorOption: OperatorOption.OPERATOR_INCLUDED,
        division: 'Rangpur',
        district: 'Dinajpur',
        upazila: 'Birganj',
      };

      const result = await service.createItem('owner-uuid-1', dto as any);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 'owner-uuid-1' } });
      expect(result.status).toBe(MachineryStatus.AVAILABLE);
      expect(result.baseRate).toBe(1500);
      expect(result.neighborClusterDiscountPct).toBe(10.0);
    });

    it('should throw NotFoundException if owner is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createItem('invalid-owner', {} as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItem', () => {
    it('should allow owner to update their machinery item', async () => {
      mockItemRepo.findOne.mockResolvedValue({
        id: 'item-uuid-1',
        ownerId: 'owner-uuid-1',
        baseRate: 1200,
      });

      const result = await service.updateItem('item-uuid-1', 'owner-uuid-1', { baseRate: 1400 });
      expect(result.baseRate).toBe(1400);
    });

    it('should reject update if user is not the owner and not admin', async () => {
      mockItemRepo.findOne.mockResolvedValue({
        id: 'item-uuid-1',
        ownerId: 'owner-uuid-1',
      });

      await expect(
        service.updateItem('item-uuid-1', 'other-user', { baseRate: 1400 }, false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('calculateQuote', () => {
    it('should calculate rental fee and apply neighbor cluster discount when plots are grouped', async () => {
      mockItemRepo.findOne.mockResolvedValue({
        id: 'item-uuid-1',
        titleEn: 'Power Tiller 16HP',
        baseRate: 1000,
        securityDeposit: 1500,
        fuelOption: FuelOption.FUEL_INCLUDED,
        operatorOption: OperatorOption.OPERATOR_INCLUDED,
        operatorDailyAllowance: 400,
        neighborClusterDiscountPct: 10.0,
      });

      mockBookingRepo.find.mockResolvedValue([
        { id: 'existing-booking-1', plotUpazila: 'Birganj' },
      ]);

      const quote = await service.calculateQuote({
        machineryId: 'item-uuid-1',
        plotSizeValue: 3, // 3 Bighas
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        plotDistrict: 'Dinajpur',
        plotUpazila: 'Birganj',
        plotUnion: 'Shatgram',
        operatorOption: OperatorOption.OPERATOR_INCLUDED,
      });

      expect(quote.totalRentalFee).toBe(3000); // 1000 * 3
      expect(quote.operatorFee).toBe(400);
      expect(quote.isClusterDiscountApplied).toBe(true);
      expect(quote.clusterDiscountAmount).toBe(300); // 10% of 3000
      expect(quote.securityDeposit).toBe(1500);
      // 3000 + 0 + 400 - 300 + 1500 = 4600
      expect(quote.grandTotal).toBe(4600);
    });
  });

  describe('createBooking', () => {
    it('should create booking with MRENT reference and escrow hold', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'renter-uuid-1' });
      mockItemRepo.findOne.mockResolvedValue({
        id: 'item-uuid-1',
        baseRate: 1200,
        securityDeposit: 1000,
        fuelOption: FuelOption.FUEL_INCLUDED,
        operatorOption: OperatorOption.OPERATOR_INCLUDED,
        neighborClusterDiscountPct: 10,
      });
      mockBookingRepo.find.mockResolvedValue([]);

      const booking = await service.createBooking('renter-uuid-1', {
        machineryId: 'item-uuid-1',
        renterName: 'Karim Mollah',
        renterPhone: '01711223344',
        plotAddress: 'North Village Plot 4',
        plotDistrict: 'Bogura',
        plotUpazila: 'Sherpur',
        plotSizeValue: 2,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      });

      expect(booking.bookingReference).toMatch(/^MRENT-\d{4}-[A-Z0-9]{4}$/);
      expect(booking.paymentStatus).toBe(MachineryPaymentStatus.ESCROW_HOLD);
      expect(booking.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  describe('submitInspection', () => {
    it('should complete booking and release deposit if post-return inspection has zero damage', async () => {
      mockBookingRepo.findOne.mockResolvedValue({
        id: 'booking-uuid-1',
        machineryId: 'item-uuid-1',
        status: BookingStatus.IN_PROGRESS,
        paymentStatus: MachineryPaymentStatus.ESCROW_HOLD,
      });

      const inspection = await service.submitInspection('booking-uuid-1', 'owner-1', {
        inspectionType: InspectionType.POST_RETURN,
        meterHours: 124.5,
        fuelLevelPct: 80,
        isEngineOperational: true,
        isOperational: true,
        claimDamageDeduction: 0,
      });

      expect(mockBookingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BookingStatus.COMPLETED,
          paymentStatus: MachineryPaymentStatus.PAID,
        }),
      );
      expect(inspection.claimDamageDeduction).toBe(0);
    });

    it('should flag booking as DISPUTED if post-return inspection claims damage deduction', async () => {
      mockBookingRepo.findOne.mockResolvedValue({
        id: 'booking-uuid-1',
        machineryId: 'item-uuid-1',
        status: BookingStatus.IN_PROGRESS,
        paymentStatus: MachineryPaymentStatus.ESCROW_HOLD,
      });

      await service.submitInspection('booking-uuid-1', 'owner-1', {
        inspectionType: InspectionType.POST_RETURN,
        meterHours: 126.0,
        fuelLevelPct: 40,
        isEngineOperational: true,
        isOperational: false,
        damageNotes: 'Tillage tine bent and hydraulic oil leak',
        claimDamageDeduction: 800,
      });

      expect(mockBookingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BookingStatus.DISPUTED,
        }),
      );
    });
  });

  describe('resolveDeposit', () => {
    it('should resolve dispute and settle deposit allocation', async () => {
      mockBookingRepo.findOne.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.DISPUTED,
        paymentStatus: MachineryPaymentStatus.ESCROW_HOLD,
        notes: 'Initial booking notes',
      });

      const resolved = await service.resolveDeposit('booking-uuid-1', {
        refundDepositAmount: 1200,
        deductDamageAmount: 800,
        adminNotes: 'Settled by cooperative arbitrator',
      });

      expect(resolved.status).toBe(BookingStatus.COMPLETED);
      expect(resolved.paymentStatus).toBe(MachineryPaymentStatus.PARTIAL_RELEASE);
      expect(resolved.notes).toContain('[Dispute Resolved]');
    });
  });
});
