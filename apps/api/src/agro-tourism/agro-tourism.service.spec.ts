import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgroTourismService } from './agro-tourism.service.js';
import {
  StayType,
  ExperienceCategory,
  MealPlanOption,
  BookingEscrowStatus,
} from './enums/agro-tourism.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AgroTourismService', () => {
  let service: AgroTourismService;
  let mockFarmStayRepo: any;
  let mockExperienceRepo: any;
  let mockBookingRepo: any;

  const mockStay = {
    id: 'stay-uuid-1',
    hostId: 'host-123',
    titleEn: 'Sreemangal Monipuri Tea Estate Eco-Cottage',
    titleBn: 'রাধানগর মনিপুরী অর্গানিক চা বাগান ইকো-কটেজ',
    stayType: StayType.TEA_ESTATE_ECO_COTTAGE,
    district: 'Moulvibazar',
    upazila: 'Sreemangal',
    villageAddress: 'Radhanagar, Sreemangal',
    nightlyRateBdt: 3000,
    weekendRateBdt: 3600,
    allInclusiveMealCostPerPerson: 700,
    maxGuests: 6,
    isActive: true,
    experiences: [],
  };

  const mockExp = {
    id: 'exp-uuid-1',
    farmStayId: 'stay-uuid-1',
    titleEn: 'Organic Tea Plucking Workshop',
    category: ExperienceCategory.ORGANIC_FARMING_HARVEST,
    pricePerPersonBdt: 400,
    isActive: true,
  };

  beforeEach(() => {
    mockFarmStayRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([mockStay]),
      findOne: vi.fn().mockImplementation(({ where: { id } }) => {
        if (id === mockStay.id) return Promise.resolve(mockStay);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((dto) => ({ id: 'stay-new-id', ...dto })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
      createQueryBuilder: vi.fn().mockReturnValue({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([mockStay]),
      }),
    };

    mockExperienceRepo = {
      find: vi.fn().mockResolvedValue([mockExp]),
      findBy: vi.fn().mockImplementation(({ id }) => {
        return Promise.resolve([mockExp]);
      }),
      create: vi.fn().mockImplementation((dto) => ({ id: 'exp-new-id', ...dto })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    mockBookingRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((dto) => ({ id: 'booking-new-id', ...dto })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    service = new AgroTourismService(
      mockFarmStayRepo,
      mockExperienceRepo,
      mockBookingRepo,
    );
  });

  describe('calculateBookingPrice', () => {
    it('should calculate correct nights, stay subtotal, meals, experiences, and service fee', async () => {
      // Monday to Wednesday = 2 weekday nights
      const priceDto = {
        farmStayId: 'stay-uuid-1',
        checkInDate: '2026-11-02', // Monday
        checkOutDate: '2026-11-04', // Wednesday
        adultGuestsCount: 2,
        childGuestsCount: 0,
        mealPlan: MealPlanOption.ALL_INCLUSIVE_ORGANIC,
        selectedExperienceIds: ['exp-uuid-1'],
      };

      const result = await service.calculateBookingPrice(priceDto);

      expect(result.nightsCount).toBe(2);
      expect(result.staySubtotalBdt).toBe(6000); // 2 * 3000
      expect(result.mealSubtotalBdt).toBe(2800); // 2 nights * 2 adults * 700
      expect(result.experiencesSubtotalBdt).toBe(800); // 2 adults * 400
      expect(result.serviceFeeBdt).toBe(200);
      expect(result.totalAmountBdt).toBe(6000 + 2800 + 800 + 200); // 9800
      expect(result.mealPlanDescriptionBn).toContain('৩ বেলা খাঁটি গ্রামীণ খাবার');
    });

    it('should handle breakfast-only meal plan correctly', async () => {
      const priceDto = {
        farmStayId: 'stay-uuid-1',
        checkInDate: '2026-11-02',
        checkOutDate: '2026-11-03', // 1 night
        adultGuestsCount: 3,
        childGuestsCount: 0,
        mealPlan: MealPlanOption.BREAKFAST_ONLY,
      };

      const result = await service.calculateBookingPrice(priceDto);

      expect(result.nightsCount).toBe(1);
      expect(result.staySubtotalBdt).toBe(3000);
      expect(result.mealSubtotalBdt).toBe(1 * 3 * 180); // 540
      expect(result.serviceFeeBdt).toBe(200);
      expect(result.totalAmountBdt).toBe(3740);
    });
  });

  describe('createBooking', () => {
    it('should create booking with unique code, 4-digit PIN, and ESCROW_CONFIRMED_RESERVED status', async () => {
      const bookingDto = {
        farmStayId: 'stay-uuid-1',
        checkInDate: '2026-11-02',
        checkOutDate: '2026-11-04',
        adultGuestsCount: 2,
        childGuestsCount: 1,
        mealPlan: MealPlanOption.ALL_INCLUSIVE_ORGANIC,
        guestName: 'Rashid Khan',
        guestPhone: '01719876543',
        specialRequests: 'Near lake view if available',
      };

      const booking = await service.createBooking('guest-usr-999', bookingDto);

      expect(booking.bookingNumber).toMatch(/^AGRO-2026-\d{4}$/);
      expect(booking.checkInPinCode).toHaveLength(4);
      expect(booking.escrowStatus).toBe(BookingEscrowStatus.ESCROW_CONFIRMED_RESERVED);
      expect(booking.guestUserId).toBe('guest-usr-999');
      expect(mockBookingRepo.save).toHaveBeenCalled();
    });
  });

  describe('verifyCheckIn', () => {
    it('should verify check-in PIN and transition status to CHECKED_IN_VERIFIED', async () => {
      const existingBooking = {
        id: 'b-100',
        bookingNumber: 'AGRO-2026-1049',
        checkInPinCode: '4829',
        escrowStatus: BookingEscrowStatus.ESCROW_CONFIRMED_RESERVED,
        farmStay: { hostId: 'host-123' },
        checkedInAt: null,
      };

      mockBookingRepo.findOne.mockResolvedValue(existingBooking);

      const result = await service.verifyCheckIn(
        { bookingNumber: 'AGRO-2026-1049', checkInPinCode: '4829' },
        'host-123',
      );

      expect(result.escrowStatus).toBe(BookingEscrowStatus.CHECKED_IN_VERIFIED);
      expect(result.checkedInAt).toBeDefined();
    });

    it('should reject invalid PIN with BadRequestException', async () => {
      const existingBooking = {
        id: 'b-100',
        bookingNumber: 'AGRO-2026-1049',
        checkInPinCode: '4829',
        farmStay: { hostId: 'host-123' },
      };

      mockBookingRepo.findOne.mockResolvedValue(existingBooking);

      await expect(
        service.verifyCheckIn(
          { bookingNumber: 'AGRO-2026-1049', checkInPinCode: '0000' },
          'host-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('releasePayout', () => {
    it('should mark booking as COMPLETED_PAYOUT_RELEASED and record timestamp', async () => {
      const existingBooking = {
        id: 'b-200',
        escrowStatus: BookingEscrowStatus.CHECKED_IN_VERIFIED,
        payoutReleasedAt: null,
      };

      mockBookingRepo.findOne.mockResolvedValue(existingBooking);

      const result = await service.releasePayout('b-200');

      expect(result.escrowStatus).toBe(BookingEscrowStatus.COMPLETED_PAYOUT_RELEASED);
      expect(result.payoutReleasedAt).toBeDefined();
    });
  });
});
