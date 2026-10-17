import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { FarmStayListing } from './entities/farm-stay-listing.entity.js';
import { AgroExperiencePackage } from './entities/agro-experience-package.entity.js';
import { FarmStayBooking } from './entities/farm-stay-booking.entity.js';
import {
  StayType,
  ExperienceCategory,
  MealPlanOption,
  BookingEscrowStatus,
} from './enums/agro-tourism.enum.js';
import {
  CreateFarmStayListingDto,
  CreateAgroExperiencePackageDto,
  CalculateBookingPriceDto,
  CreateFarmStayBookingDto,
  VerifyCheckInDto,
  FarmStayFilterDto,
} from './dto/agro-tourism.dto.js';

@Injectable()
export class AgroTourismService implements OnModuleInit {
  private readonly logger = new Logger(AgroTourismService.name);

  constructor(
    @InjectRepository(FarmStayListing)
    private readonly farmStayRepo: Repository<FarmStayListing>,
    @InjectRepository(AgroExperiencePackage)
    private readonly experienceRepo: Repository<AgroExperiencePackage>,
    @InjectRepository(FarmStayBooking)
    private readonly bookingRepo: Repository<FarmStayBooking>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  /**
   * Seed authentic Bangladeshi Agro-Tourism Stays & Village Experiences
   */
  async seedBaselineData() {
    const existingStays = await this.farmStayRepo.count();
    if (existingStays > 0) return;

    this.logger.log('Seeding authentic Bangladeshi Agro-Tourism Farm Stays and Experiences...');

    // 1. Sreemangal Monipuri Tea Estate Eco-Cottage
    const stay1 = this.farmStayRepo.create({
      hostId: 'host-sreemangal-001',
      titleEn: 'Radhanagar Monipuri Organic Tea Estate Eco-Cottage',
      titleBn: 'রাধানগর মনিপুরী অর্গানিক চা বাগান ইকো-কটেজ',
      stayType: StayType.TEA_ESTATE_ECO_COTTAGE,
      district: 'Moulvibazar',
      upazila: 'Sreemangal',
      villageAddress: 'Radhanagar Tea Belt, Ward 3, Sreemangal',
      latitude: 24.3065,
      longitude: 91.7296,
      hostName: 'Subhasish Sharma (Monipuri Craft & Tea Host)',
      hostPhone: '01711234567',
      hostNidVerified: true,
      maxGuests: 6,
      bedroomCount: 2,
      bedCount: 3,
      hasAttachedBath: true,
      nightlyRateBdt: 3200,
      weekendRateBdt: 3800,
      allInclusiveMealCostPerPerson: 750,
      hasSolarElectricity: true,
      hasPureTubeWellWater: true,
      hasOrganicFarmHarvestAccess: true,
      hasClayStoveCooking: true,
      hasTraditionalBoatTour: false,
      isActive: true,
      description:
        'Stay nestled inside organic rain-fed tea slopes. Enjoy handcrafted green tea, authentic Monipuri vegetable curries, and serene bird songs.',
      photos: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      ],
    });
    await this.farmStayRepo.save(stay1);

    // 2. Jashore Mud House Baor Retreat
    const stay2 = this.farmStayRepo.create({
      hostId: 'host-jashore-002',
      titleEn: 'Kopotakkho Baor Heritage Mud House Retreat',
      titleBn: 'কপোতাক্ষ বাঁওড় ঐতিহ্যবাহী মাটির ঘর রিট্রিট',
      stayType: StayType.TRADITIONAL_MUD_HOUSE,
      district: 'Jashore',
      upazila: 'Chaugachha',
      villageAddress: 'Singhejulia Village, Baor Par, Chaugachha',
      latitude: 23.2625,
      longitude: 89.0256,
      hostName: 'Alhaj Mokhlesur Rahman (Fishery & Dairy Farmer)',
      hostPhone: '01819345678',
      hostNidVerified: true,
      maxGuests: 8,
      bedroomCount: 3,
      bedCount: 4,
      hasAttachedBath: true,
      nightlyRateBdt: 2800,
      weekendRateBdt: 3400,
      allInclusiveMealCostPerPerson: 650,
      hasSolarElectricity: true,
      hasPureTubeWellWater: true,
      hasOrganicFarmHarvestAccess: true,
      hasClayStoveCooking: true,
      hasTraditionalBoatTour: true,
      isActive: true,
      description:
        'Traditional cooling mud architecture with clay-plastered walls and straw thatch. Direct baor lake boat access, fresh date palm jaggery, and desi duck curry.',
      photos: [
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86',
        'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e',
      ],
    });
    await this.farmStayRepo.save(stay2);

    // 3. Dinajpur Litchi Orchard Camp
    const stay3 = this.farmStayRepo.create({
      hostId: 'host-dinajpur-003',
      titleEn: 'Madhabpur Bedena & China-3 Litchi Orchard Agro-Camp',
      titleBn: 'মাধবপুর বেদেনা ও চায়না-৩ লিচু বাগান অ্যাগ্রো-ক্যাম্প',
      stayType: StayType.MANGO_LITCHI_ORCHARD_CAMP,
      district: 'Dinajpur',
      upazila: 'Dinajpur Sadar',
      villageAddress: 'Madhabpur Horticultural Cluster, Dinajpur',
      latitude: 25.6217,
      longitude: 88.6355,
      hostName: 'Md. Tariqul Islam (Horticulture Specialist)',
      hostPhone: '01712456789',
      hostNidVerified: true,
      maxGuests: 10,
      bedroomCount: 4,
      bedCount: 6,
      hasAttachedBath: true,
      nightlyRateBdt: 2500,
      weekendRateBdt: 3000,
      allInclusiveMealCostPerPerson: 600,
      hasSolarElectricity: true,
      hasPureTubeWellWater: true,
      hasOrganicFarmHarvestAccess: true,
      hasClayStoveCooking: true,
      hasTraditionalBoatTour: false,
      isActive: true,
      description:
        'Camp under 100-year-old litchi canopies. Pick juicy sweet Bedena litchis straight from branches and enjoy Katari Bhog fragrant rice with mustard fish.',
      photos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      ],
    });
    await this.farmStayRepo.save(stay3);

    // 4. Sundarbans Mangrove Gher Cottage
    const stay4 = this.farmStayRepo.create({
      hostId: 'host-satkhira-004',
      titleEn: 'Sundarbans Border Munshiganj Mangrove Gher Cottage',
      titleBn: 'সুন্দরবন মোহনা মুন্সিগঞ্জ ম্যানগ্রোভ ঘের কটেজ',
      stayType: StayType.SUNDARBANS_MANGROVE_BORDER,
      district: 'Satkhira',
      upazila: 'Shyamnagar',
      villageAddress: 'Munshiganj Forest Gate, Shyamnagar, Satkhira',
      latitude: 22.2592,
      longitude: 89.1867,
      hostName: 'Bijoy Krishna Mondal (Mowal & Crab Culturist)',
      hostPhone: '01913567890',
      hostNidVerified: true,
      maxGuests: 6,
      bedroomCount: 2,
      bedCount: 3,
      hasAttachedBath: true,
      nightlyRateBdt: 3500,
      weekendRateBdt: 4200,
      allInclusiveMealCostPerPerson: 850,
      hasSolarElectricity: true,
      hasPureTubeWellWater: true,
      hasOrganicFarmHarvestAccess: true,
      hasClayStoveCooking: true,
      hasTraditionalBoatTour: true,
      isActive: true,
      description:
        'Eco-cottage on the edge of the world’s largest mangrove forest. Fresh mud crab feast, wild Khalisha honey tasting, and serene sundown canal cruising.',
      photos: [
        'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5',
      ],
    });
    await this.farmStayRepo.save(stay4);

    // Seed Agro-Experience Packages
    const exp1 = this.experienceRepo.create({
      farmStayId: stay1.id,
      titleEn: 'Artisanal Organic Tea Leaf Plucking & Hand-Rolling Workshop',
      titleBn: 'জৈব চা পাতা চয়ন ও হাতে রোলিং কর্মশালা',
      category: ExperienceCategory.ORGANIC_FARMING_HARVEST,
      durationHours: 3.0,
      pricePerPersonBdt: 450,
      minParticipants: 2,
      maxParticipants: 10,
      includesSafetyGear: true,
      includesFarmRefreshment: true,
      description:
        'Wear traditional bamboo basket, pluck two leaves and a bud with expert tea pickers, roast and roll your own bespoke whole-leaf tea to take home.',
      isActive: true,
    });

    const exp2 = this.experienceRepo.create({
      farmStayId: stay2.id,
      titleEn: 'Baor Wooden Dingi Boat Catch-and-Cook Fish Barbecue',
      titleBn: 'বাঁওড় ডিঙ্গি নৌকায় মাছ শিকার ও মাটির চুলার বারবিকিউ',
      category: ExperienceCategory.TRADITIONAL_FISHING_CATCH_COOK,
      durationHours: 4.0,
      pricePerPersonBdt: 600,
      minParticipants: 2,
      maxParticipants: 6,
      includesSafetyGear: true,
      includesFarmRefreshment: true,
      description:
        'Cast traditional nylon cast nets (খ্যাপলা জাল) with village fishermen in Kopotakkho Baor, harvest live Rui and Boal, and roast fresh with village spices.',
      isActive: true,
    });

    const exp3 = this.experienceRepo.create({
      farmStayId: stay3.id,
      titleEn: 'Orchard Tree-Top Litchi & Mango Harvest Tasting Tour',
      titleBn: 'গাছপাকা লিচু ও ফজলি আম পেড়ে খাওয়ার গ্রামীণ অভিজ্ঞতা',
      category: ExperienceCategory.FRUIT_HARVEST_TASTING,
      durationHours: 3.5,
      pricePerPersonBdt: 500,
      minParticipants: 2,
      maxParticipants: 12,
      includesSafetyGear: true,
      includesFarmRefreshment: true,
      description:
        'Climb orchard ladders, harvest mature China-3 litchis and Gobindobhog mangoes, and savor all-you-can-eat fresh fruit under shady trees.',
      isActive: true,
    });

    const exp4 = this.experienceRepo.create({
      farmStayId: stay4.id,
      titleEn: 'Sundarbans Mangrove Mud Crab Trapping & Wild Honey Extraction',
      titleBn: 'ম্যানগ্রোভ মোহনায় কাঁকড়া শিকার ও খাঁটি সুন্দরবনের মধু নিষ্কাশন',
      category: ExperienceCategory.ARTISANAL_HONEY_EXTRACTION,
      durationHours: 4.5,
      pricePerPersonBdt: 850,
      minParticipants: 2,
      maxParticipants: 8,
      includesSafetyGear: true,
      includesFarmRefreshment: true,
      description:
        'Set bamboo crab pots (দোনা) along tidal creeks with native Mowals, extract fresh honey from natural combs, and drink sweet green coconut water.',
      isActive: true,
    });

    await this.experienceRepo.save([exp1, exp2, exp3, exp4]);

    // Seed Sample Booking with Check-In Escrow PIN
    const sampleBooking = this.bookingRepo.create({
      bookingNumber: 'AGRO-2026-SR-1094',
      guestUserId: 'guest-usr-401',
      guestName: 'Tanvir Ahmed & Family',
      guestPhone: '01819998877',
      guestNidPassport: '19922610580004123',
      farmStayId: stay1.id,
      checkInDate: '2026-10-24',
      checkOutDate: '2026-10-26',
      nightsCount: 2,
      adultGuestsCount: 2,
      childGuestsCount: 1,
      mealPlan: MealPlanOption.ALL_INCLUSIVE_ORGANIC,
      selectedExperienceIds: [exp1.id],
      staySubtotalBdt: 7000,
      mealSubtotalBdt: 3750,
      experiencesSubtotalBdt: 900,
      serviceFeeBdt: 200,
      totalAmountBdt: 11850,
      escrowStatus: BookingEscrowStatus.ESCROW_CONFIRMED_RESERVED,
      checkInPinCode: '7482',
      specialRequests: 'Would love extra green tea tasting and vegetarian dishes for one guest.',
    });
    await this.bookingRepo.save(sampleBooking);

    this.logger.log('Agro-tourism seed complete: 4 Stays, 4 Experiences, 1 Escrow Booking.');
  }

  /**
   * High-Level Overview Metrics
   */
  async getOverviewStats(): Promise<{
    totalFarmStays: number;
    activeVerifiedHosts: number;
    totalActiveBookings: number;
    totalRuralTourismRevenueBdt: number;
    averageNightlyRateBdt: number;
  }> {
    const stays = await this.farmStayRepo.find({ where: { isActive: true } });
    const bookings = await this.bookingRepo.find();

    const totalStays = stays.length;
    const uniqueHosts = new Set(stays.map((s) => s.hostId)).size;
    const activeBookings = bookings.filter(
      (b) =>
        b.escrowStatus === BookingEscrowStatus.ESCROW_CONFIRMED_RESERVED ||
        b.escrowStatus === BookingEscrowStatus.CHECKED_IN_VERIFIED,
    ).length;

    const totalRevenue = bookings
      .filter((b) => b.escrowStatus !== BookingEscrowStatus.CANCELLED_REFUNDED)
      .reduce((sum, b) => sum + Number(b.totalAmountBdt), 0);

    const avgNightly =
      totalStays > 0
        ? Math.round(stays.reduce((sum, s) => sum + Number(s.nightlyRateBdt), 0) / totalStays)
        : 2800;

    return {
      totalFarmStays: totalStays,
      activeVerifiedHosts: uniqueHosts,
      totalActiveBookings: activeBookings,
      totalRuralTourismRevenueBdt: totalRevenue,
      averageNightlyRateBdt: avgNightly,
    };
  }

  /**
   * Search / Filter Farm Stays with Experiences
   */
  async findAllFarmStays(filters?: FarmStayFilterDto): Promise<FarmStayListing[]> {
    const query = this.farmStayRepo
      .createQueryBuilder('stay')
      .leftJoinAndSelect('stay.experiences', 'experiences', 'experiences.isActive = :expActive', {
        expActive: true,
      })
      .where('stay.isActive = :isActive', { isActive: true });

    if (filters?.district) {
      query.andWhere('LOWER(stay.district) LIKE LOWER(:district)', {
        district: `%${filters.district}%`,
      });
    }

    if (filters?.stayType) {
      query.andWhere('stay.stayType = :stayType', { stayType: filters.stayType });
    }

    if (filters?.guests) {
      query.andWhere('stay.maxGuests >= :guests', { guests: filters.guests });
    }

    if (filters?.maxNightlyRate) {
      query.andWhere('stay.nightlyRateBdt <= :maxPrice', { maxPrice: filters.maxNightlyRate });
    }

    query.orderBy('stay.createdAt', 'DESC');
    return query.getMany();
  }

  /**
   * Get Farm Stay Details
   */
  async findFarmStayById(id: string): Promise<FarmStayListing> {
    const stay = await this.farmStayRepo.findOne({
      where: { id },
      relations: ['experiences'],
    });

    if (!stay) {
      throw new NotFoundException(`Farm stay with ID ${id} not found.`);
    }

    return stay;
  }

  /**
   * Create New Farm Stay
   */
  async createFarmStay(hostId: string, dto: CreateFarmStayListingDto): Promise<FarmStayListing> {
    const stay = this.farmStayRepo.create({
      ...dto,
      hostId,
      hostNidVerified: true,
      isActive: true,
    });
    return this.farmStayRepo.save(stay);
  }

  /**
   * Host's Own Listings
   */
  async findMyListings(hostId: string): Promise<FarmStayListing[]> {
    return this.farmStayRepo.find({
      where: { hostId },
      relations: ['experiences'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update Listing
   */
  async updateFarmStay(
    id: string,
    hostId: string,
    dto: Partial<CreateFarmStayListingDto>,
  ): Promise<FarmStayListing> {
    const stay = await this.findFarmStayById(id);
    if (stay.hostId !== hostId) {
      throw new BadRequestException('Unauthorized to modify this farm stay.');
    }

    Object.assign(stay, dto);
    return this.farmStayRepo.save(stay);
  }

  /**
   * Get Experiences
   */
  async findAllExperiences(farmStayId?: string): Promise<AgroExperiencePackage[]> {
    if (farmStayId) {
      return this.experienceRepo.find({
        where: { farmStayId, isActive: true },
        order: { createdAt: 'DESC' },
      });
    }
    return this.experienceRepo.find({
      where: { isActive: true },
      relations: ['farmStay'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create Experience Package
   */
  async createExperience(dto: CreateAgroExperiencePackageDto): Promise<AgroExperiencePackage> {
    const stay = await this.findFarmStayById(dto.farmStayId);
    if (!stay) {
      throw new NotFoundException(`Farm stay with ID ${dto.farmStayId} not found.`);
    }

    const exp = this.experienceRepo.create({
      ...dto,
      isActive: true,
    });
    return this.experienceRepo.save(exp);
  }

  /**
   * Price Calculation Engine for Bookings
   */
  async calculateBookingPrice(dto: CalculateBookingPriceDto): Promise<{
    nightsCount: number;
    staySubtotalBdt: number;
    mealSubtotalBdt: number;
    experiencesSubtotalBdt: number;
    serviceFeeBdt: number;
    totalAmountBdt: number;
    mealPlanDescriptionBn: string;
  }> {
    const stay = await this.findFarmStayById(dto.farmStayId);

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nightsCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate stay subtotal (differentiate regular vs weekend night rates)
    let staySubtotalBdt = 0;
    const curr = new Date(checkIn);
    for (let i = 0; i < nightsCount; i++) {
      const day = curr.getDay(); // 5 = Friday, 6 = Saturday in Bangladesh weekend
      const isWeekend = day === 5 || day === 6;
      staySubtotalBdt += Number(isWeekend ? stay.weekendRateBdt : stay.nightlyRateBdt);
      curr.setDate(curr.getDate() + 1);
    }

    // Meal calculation
    let mealSubtotalBdt = 0;
    let mealPlanDescriptionBn = 'কোনো খাবার অন্তর্ভুক্ত নয়';
    const totalEffectiveGuests = Number(dto.adultGuestsCount) + Number(dto.childGuestsCount || 0) * 0.5;

    if (dto.mealPlan === MealPlanOption.ALL_INCLUSIVE_ORGANIC) {
      const mealRate = Number(stay.allInclusiveMealCostPerPerson) || 650;
      mealSubtotalBdt = nightsCount * totalEffectiveGuests * mealRate;
      mealPlanDescriptionBn = `৩ বেলা খাঁটি গ্রামীণ খাবার (দেশি হাঁস/মুরগি, তাজা মাছ, শাকসবজি ও পিঠাপুলি) — ৳${mealRate}/জন/দিন`;
    } else if (dto.mealPlan === MealPlanOption.BREAKFAST_ONLY) {
      const mealRate = 180;
      mealSubtotalBdt = nightsCount * totalEffectiveGuests * mealRate;
      mealPlanDescriptionBn = `সকালের খাঁটি নাস্তা (হাতে বানানো লাল আটার রুটি, খাঁটি ঘি, ডিম ও গুড়ের চা) — ৳${mealRate}/জন/দিন`;
    } else if (dto.mealPlan === MealPlanOption.SELF_COOKING_FARM_INGREDIENTS) {
      mealSubtotalBdt = nightsCount * 350; // Wood stove fuel and organic spices fee
      mealPlanDescriptionBn = 'মাটির চুলা, রান্নার কাঠ ও বাগান থেকে তাজা মসলা উপাদান ব্যবহারের সুবিধা (৳৩৫০/রাত)';
    }

    // Experiences calculation
    let experiencesSubtotalBdt = 0;
    if (dto.selectedExperienceIds && dto.selectedExperienceIds.length > 0) {
      const exps = await this.experienceRepo.findBy({
        id: In(dto.selectedExperienceIds),
      });

      for (const exp of exps) {
        experiencesSubtotalBdt += Number(exp.pricePerPersonBdt) * Number(dto.adultGuestsCount);
      }
    }

    const serviceFeeBdt = 200; // Platform insurance & safety coordination fee
    const totalAmountBdt =
      staySubtotalBdt + mealSubtotalBdt + experiencesSubtotalBdt + serviceFeeBdt;

    return {
      nightsCount,
      staySubtotalBdt,
      mealSubtotalBdt,
      experiencesSubtotalBdt,
      serviceFeeBdt,
      totalAmountBdt,
      mealPlanDescriptionBn,
    };
  }

  /**
   * Create Escrow-Guaranteed Farm Stay Booking
   */
  async createBooking(guestUserId: string, dto: CreateFarmStayBookingDto): Promise<FarmStayBooking> {
    const price = await this.calculateBookingPrice(dto);

    // Generate random 4-digit check-in PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingNumber = `AGRO-${new Date().getFullYear()}-${randomSuffix}`;

    const booking = this.bookingRepo.create({
      bookingNumber,
      guestUserId,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      guestNidPassport: dto.guestNidPassport || null,
      farmStayId: dto.farmStayId,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      nightsCount: price.nightsCount,
      adultGuestsCount: Number(dto.adultGuestsCount),
      childGuestsCount: Number(dto.childGuestsCount || 0),
      mealPlan: dto.mealPlan,
      selectedExperienceIds: dto.selectedExperienceIds || null,
      staySubtotalBdt: price.staySubtotalBdt,
      mealSubtotalBdt: price.mealSubtotalBdt,
      experiencesSubtotalBdt: price.experiencesSubtotalBdt,
      serviceFeeBdt: price.serviceFeeBdt,
      totalAmountBdt: price.totalAmountBdt,
      escrowStatus: BookingEscrowStatus.ESCROW_CONFIRMED_RESERVED,
      checkInPinCode: pin,
      specialRequests: dto.specialRequests || null,
    });

    return this.bookingRepo.save(booking);
  }

  /**
   * Customer's Bookings
   */
  async findMyBookings(guestUserId: string): Promise<FarmStayBooking[]> {
    return this.bookingRepo.find({
      where: { guestUserId },
      relations: ['farmStay'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Host's Incoming Bookings
   */
  async findHostBookings(hostId: string): Promise<FarmStayBooking[]> {
    const stays = await this.farmStayRepo.find({ where: { hostId } });
    const stayIds = stays.map((s) => s.id);
    if (stayIds.length === 0) return [];

    return this.bookingRepo.find({
      where: { farmStayId: In(stayIds) },
      relations: ['farmStay'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Host Verifies Guest Check-In via PIN Code (Releases Escrow)
   */
  async verifyCheckIn(dto: VerifyCheckInDto, hostId?: string): Promise<FarmStayBooking> {
    const booking = await this.bookingRepo.findOne({
      where: { bookingNumber: dto.bookingNumber },
      relations: ['farmStay'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking #${dto.bookingNumber} not found.`);
    }

    if (hostId && booking.farmStay.hostId !== hostId) {
      throw new BadRequestException('Unauthorized: You are not the host of this farm stay.');
    }

    if (booking.checkInPinCode !== dto.checkInPinCode.trim()) {
      throw new BadRequestException('Invalid check-in PIN code. Please confirm with the guest.');
    }

    booking.escrowStatus = BookingEscrowStatus.CHECKED_IN_VERIFIED;
    booking.checkedInAt = new Date();
    return this.bookingRepo.save(booking);
  }

  /**
   * Release Escrow Payout to Host
   */
  async releasePayout(bookingId: string): Promise<FarmStayBooking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['farmStay'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }

    booking.escrowStatus = BookingEscrowStatus.COMPLETED_PAYOUT_RELEASED;
    booking.payoutReleasedAt = new Date();
    return this.bookingRepo.save(booking);
  }

  /**
   * Admin: All Nationwide Bookings
   */
  async getAllBookingsAdmin(): Promise<FarmStayBooking[]> {
    return this.bookingRepo.find({
      relations: ['farmStay'],
      order: { createdAt: 'DESC' },
    });
  }
}
