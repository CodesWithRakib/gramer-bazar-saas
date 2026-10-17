import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivestockListing } from './entities/livestock-listing.entity.js';
import { LivestockHealthPassport, VaccineRecord } from './entities/livestock-health-passport.entity.js';
import { ArtificialInseminationBooking } from './entities/artificial-insemination-booking.entity.js';
import { LivestockTransportBooking } from './entities/livestock-transport-booking.entity.js';
import {
  LivestockCategory,
  LivestockBreed,
  LivestockListingStatus,
  VeterinaryHealthStatus,
  VaccineType,
  AIServiceStatus,
  LivestockEscrowStatus,
  LivestockTransportStatus,
} from './enums/livestock.enum.js';
import {
  CreateLivestockListingDto,
  UpdateLivestockListingDto,
  LivestockQueryDto,
  CommitEscrowPurchaseDto,
  RecordHealthPassportDto,
  AddVaccineRecordDto,
  CreateAIBookingDto,
  UpdateAIBookingStatusDto,
  CreateLivestockTransportDto,
  UpdateTransportStatusDto,
} from './dto/livestock.dto.js';

@Injectable()
export class LivestockService implements OnModuleInit {
  private readonly logger = new Logger(LivestockService.name);

  constructor(
    @InjectRepository(LivestockListing)
    private readonly listingRepo: Repository<LivestockListing>,
    @InjectRepository(LivestockHealthPassport)
    private readonly passportRepo: Repository<LivestockHealthPassport>,
    @InjectRepository(ArtificialInseminationBooking)
    private readonly aiBookingRepo: Repository<ArtificialInseminationBooking>,
    @InjectRepository(LivestockTransportBooking)
    private readonly transportRepo: Repository<LivestockTransportBooking>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedBaselineData();
  }

  // --- Seed Data ---
  async seedBaselineData(): Promise<void> {
    const count = await this.listingRepo.count();
    if (count > 0) return;

    this.logger.log('Seeding baseline Livestock listings, DLS health passports, and AI bookings...');

    const sampleListings: Partial<LivestockListing>[] = [
      {
        sellerId: 'seller-faruk-bogr',
        sellerName: 'Al-Haj Faruk Dairy Farm',
        sellerPhone: '01712001122',
        sellerDistrict: 'Bogura',
        sellerUpazila: 'Sherpur',
        earTagNumber: 'BAN-LIV-892101',
        title: 'উচ্চ দুধ উৎপাদনশীল হলস্টাইন ফ্রিজিয়ান ক্রসব্রিড গাভী (১৮ লিটার/দিন)',
        description: 'সুস্থ ও দ্বিতীয় বিয়ানের উন্নত জাতের গাভী। প্রতিদিন গড়ে ১৮.৫ লিটার দুধ পাওয়া যায়। সরকারি ডিএলএস কানট্যাগ ও নিয়মিত টিকা সম্পন্ন।',
        category: LivestockCategory.DAIRY_COW,
        breed: LivestockBreed.HOLSTEIN_FRIESIAN_CROSS,
        gender: 'FEMALE',
        liveWeightKg: 440,
        teethCount: 4,
        ageMonths: 34,
        dailyMilkYieldLiters: 18.5,
        parity: 2,
        isPregnant: false,
        pregnancyMonths: null,
        colorPattern: 'Black & White Friesian Spotted',
        askingPrice: 215000,
        negotiable: true,
        qurbaniEligible: false,
        mediaUrls: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
        healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
        listingStatus: LivestockListingStatus.AVAILABLE,
        buyerId: null,
        buyerName: null,
        buyerPhone: null,
        escrowStatus: null,
        escrowAmount: null,
      },
      {
        sellerId: 'seller-kuddus-pabn',
        sellerName: 'Kuddus Agro & Cattle Farm',
        sellerPhone: '01719887766',
        sellerDistrict: 'Pabna',
        sellerUpazila: 'Santhia',
        earTagNumber: 'BAN-LIV-892102',
        title: 'কোরবানি উপযোগী লাল শাহীওয়াল ষাঁড় (৪ দাঁত, ৪৭০ কেজি)',
        description: 'সম্পূর্ণ প্রাকৃতিক দানাদার খাদ্য ও কাঁচা ঘাসে মোটাতাজাকরণ করা স্বাস্থ্যবান শাহীওয়াল ক্রস ষাঁড়। কোনো ক্ষতিকর ইনজেকশন মুক্ত।',
        category: LivestockCategory.BEEF_CATTLE,
        breed: LivestockBreed.SAHIWAL_CROSS,
        gender: 'MALE',
        liveWeightKg: 470,
        teethCount: 4,
        ageMonths: 32,
        dailyMilkYieldLiters: null,
        parity: null,
        isPregnant: false,
        pregnancyMonths: null,
        colorPattern: 'Deep Reddish Brown with White Tail Switch',
        askingPrice: 260000,
        negotiable: true,
        qurbaniEligible: true,
        mediaUrls: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80'],
        healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
        listingStatus: LivestockListingStatus.AVAILABLE,
        buyerId: null,
        buyerName: null,
        buyerPhone: null,
        escrowStatus: null,
        escrowAmount: null,
      },
      {
        sellerId: 'seller-jamal-chitt',
        sellerName: 'Karnaphuli Native Breeder',
        sellerPhone: '01815334455',
        sellerDistrict: 'Chattogram',
        sellerUpazila: 'Anwara',
        earTagNumber: 'BAN-LIV-892103',
        title: 'রেড চিটাগাং ক্যাটল (RCC) বিশুদ্ধ দেশি উন্নত জাতের বকনা বাছুর',
        description: 'রোগ প্রতিরোধ ক্ষমতা সম্পন্ন খাঁটি রেড চিটাগাং জাতের প্রথম গর্ভধারণ উপযোগী বকনা। চরম জলবায়ু সহনশীল।',
        category: LivestockCategory.BULL_CALF,
        breed: LivestockBreed.RED_CHITTAGONG_CATTLE_RCC,
        gender: 'FEMALE',
        liveWeightKg: 210,
        teethCount: 2,
        ageMonths: 18,
        dailyMilkYieldLiters: null,
        parity: 0,
        isPregnant: false,
        pregnancyMonths: null,
        colorPattern: 'Solid Copper Red',
        askingPrice: 95000,
        negotiable: false,
        qurbaniEligible: false,
        mediaUrls: ['https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80'],
        healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
        listingStatus: LivestockListingStatus.AVAILABLE,
        buyerId: null,
        buyerName: null,
        buyerPhone: null,
        escrowStatus: null,
        escrowAmount: null,
      },
      {
        sellerId: 'seller-salma-chuad',
        sellerName: 'Salma Black Bengal Goat Farm',
        sellerPhone: '01911443322',
        sellerDistrict: 'Chuadanga',
        sellerUpazila: 'Damurhuda',
        earTagNumber: 'BAN-LIV-892104',
        title: 'খাঁটি ব্ল্যাক বেঙ্গল খাসি (কোরবানি ও রসনাবিলাস উপযোগী)',
        description: 'চুয়াডাঙ্গার সুস্বাদু মাংসের খাঁটি ব্ল্যাক বেঙ্গল খাসি। ২ দাঁত সম্পন্ন এবং সম্পূর্ণ ত্রুটিহীন শরিয়তসম্মত কোরবানি পশু।',
        category: LivestockCategory.GOAT,
        breed: LivestockBreed.BLACK_BENGAL_GOAT,
        gender: 'MALE',
        liveWeightKg: 28.5,
        teethCount: 2,
        ageMonths: 16,
        dailyMilkYieldLiters: null,
        parity: null,
        isPregnant: false,
        pregnancyMonths: null,
        colorPattern: 'Jet Black Glossy',
        askingPrice: 24000,
        negotiable: true,
        qurbaniEligible: true,
        mediaUrls: ['https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80'],
        healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
        listingStatus: LivestockListingStatus.AVAILABLE,
        buyerId: null,
        buyerName: null,
        buyerPhone: null,
        escrowStatus: null,
        escrowAmount: null,
      },
    ];

    for (const item of sampleListings) {
      const listing = await this.listingRepo.save(this.listingRepo.create(item));

      // Create matching DLS Health Passport
      const defaultVaccines: VaccineRecord[] = [
        {
          vaccine: VaccineType.FOOT_AND_MOUTH_FMD,
          doseDate: '2026-08-10',
          nextDueDate: '2027-02-10',
          batchNo: 'LRI-FMD-2604',
          administeredBy: 'Dr. Md. Nazmul Huda, UVS',
        },
        {
          vaccine: VaccineType.ANTHRAX,
          doseDate: '2026-05-15',
          nextDueDate: '2027-05-15',
          batchNo: 'LRI-ANTH-8812',
          administeredBy: 'Dr. Md. Nazmul Huda, UVS',
        },
        {
          vaccine: VaccineType.LUMPY_SKIN_DISEASE_LSD,
          doseDate: '2026-07-02',
          nextDueDate: '2027-07-02',
          batchNo: 'HES-LSD-9011',
          administeredBy: 'Dr. Tanvir Ahmed, VS',
        },
      ];

      await this.passportRepo.save(
        this.passportRepo.create({
          earTagNumber: listing.earTagNumber,
          livestockId: listing.id,
          veterinaryOfficerName: 'Dr. Md. Nazmul Huda, Upazila Veterinary Surgeon (UVS)',
          veterinaryRegNumber: 'BVC-REG-10482',
          upazilaHospital: `${listing.sellerUpazila} Upazila Livestock Hospital, ${listing.sellerDistrict}`,
          healthCertification: VeterinaryHealthStatus.CERTIFIED_HEALTHY,
          bodyTemperatureCelsius: 38.6,
          dewormingDate: '2026-09-01 (Albendazole 10% bolus)',
          vaccinationLedger: defaultVaccines,
          healthRemarks: 'Normal rumen motility (3 cycles/2min), clear mucous membrane, sound hooves, no external parasites.',
          certificateQrCode: `https://gramerbazar.com/livestock/${listing.earTagNumber}`,
        }),
      );
    }

    // Seed sample AI booking
    await this.aiBookingRepo.save(
      this.aiBookingRepo.create({
        bookingNumber: 'AI-2026-9281',
        farmerId: 'farmer-anwar-bogr',
        farmerName: 'Anwar Hossain',
        farmerPhone: '01715998877',
        farmerDistrict: 'Bogura',
        farmerUpazila: 'Gabtali',
        targetDamEarTag: 'BAN-LIV-892101',
        targetDamBreed: LivestockBreed.HOLSTEIN_FRIESIAN_CROSS,
        desiredSireBreed: LivestockBreed.HOLSTEIN_FRIESIAN_CROSS,
        strawSource: 'Central Cattle Breeding & Dairy Farm (CCBDF), Savar',
        sireBullId: 'CCBDF-HF-100-SUPERIOR-12',
        heatObservationDate: '2026-10-17 06:30 AM',
        status: AIServiceStatus.TECHNICIAN_ASSIGNED,
        technicianName: 'Md. Shafiqul Islam (Certified DLS AI Technician)',
        technicianPhone: '01712445566',
        fee: 650,
        inseminationDate: '2026-10-17 05:00 PM',
        pregnancyCheckDate: '2026-12-17',
        notes: 'Observed standing heat at morning milking. Morning-Evening rule applied for 5:00 PM insemination.',
      }),
    );

    // Seed sample Transport Booking
    await this.transportRepo.save(
      this.transportRepo.create({
        bookingNumber: 'TRUCK-COW-4410',
        buyerId: 'buyer-karim-dhak',
        buyerName: 'Karimul Islam',
        buyerPhone: '01819776655',
        livestockId: 'mock-livestock-uuid',
        earTagNumber: 'BAN-LIV-892102',
        pickupDistrict: 'Pabna',
        pickupUpazila: 'Santhia',
        pickupAddress: 'Kuddus Agro Farm, Santhia Bazar Road',
        dropoffDistrict: 'Dhaka',
        dropoffUpazila: 'Mirpur',
        dropoffAddress: 'House 14, Road 5, Mirpur DOHS, Dhaka',
        vehicleType: 'Covered 1.5-Ton Pickup with Straw Bedding & Ramp',
        fareAmount: 8500,
        hasTransitInsurance: true,
        insuranceFee: 500,
        status: LivestockTransportStatus.SCHEDULED,
        driverName: 'Ratan Mia',
        driverPhone: '01718990011',
        vehiclePlateNumber: 'DHAKA-METRO-NA-11-2345',
        notes: 'Handled with organic rice straw bedding, water bucket, and ventilation side grates.',
      }),
    );

    this.logger.log('Seeded baseline livestock ecosystem successfully.');
  }

  // --- Calculations & Domain Logic ---

  /**
   * Calculates dressing percentage, estimated meat yield, and market value.
   */
  estimateMeatYield(liveWeightKg: number, category: LivestockCategory): {
    liveWeightKg: number;
    dressingPercentage: number;
    carcassWeightKg: number;
    bonelessMeatKg: number;
    edibleOffalKg: number;
    estimatedMeatValueBdt: number;
  } {
    let dressingPct = 54; // Default cattle
    let pricePerKg = 780; // BDT/kg beef

    switch (category) {
      case LivestockCategory.DAIRY_COW:
        dressingPct = 52;
        pricePerKg = 750;
        break;
      case LivestockCategory.BEEF_CATTLE:
        dressingPct = 56;
        pricePerKg = 800;
        break;
      case LivestockCategory.BULL_CALF:
        dressingPct = 51;
        pricePerKg = 780;
        break;
      case LivestockCategory.GOAT:
        dressingPct = 50;
        pricePerKg = 1150; // Chevon/Mutton
        break;
      case LivestockCategory.SHEEP:
        dressingPct = 48;
        pricePerKg = 950;
        break;
      case LivestockCategory.BUFFALO:
        dressingPct = 52;
        pricePerKg = 720;
        break;
    }

    const carcassWeightKg = Math.round((liveWeightKg * dressingPct) / 100);
    const bonelessMeatKg = Math.round(carcassWeightKg * 0.72);
    const edibleOffalKg = Math.round(liveWeightKg * 0.08); // liver, heart, brain, etc.
    const estimatedMeatValueBdt = Math.round(bonelessMeatKg * pricePerKg);

    return {
      liveWeightKg,
      dressingPercentage: dressingPct,
      carcassWeightKg,
      bonelessMeatKg,
      edibleOffalKg,
      estimatedMeatValueBdt,
    };
  }

  /**
   * Validates Qurbani Shariah eligibility for sacrifice.
   */
  validateQurbaniEligibility(listing: LivestockListing): {
    isCompliant: boolean;
    reasonsBn: string[];
    reasonsEn: string[];
  } {
    const reasonsBn: string[] = [];
    const reasonsEn: string[] = [];
    let isCompliant = true;

    // Age / teeth rules:
    const isCattle =
      listing.category === LivestockCategory.BEEF_CATTLE ||
      listing.category === LivestockCategory.DAIRY_COW ||
      listing.category === LivestockCategory.BULL_CALF ||
      listing.category === LivestockCategory.BUFFALO;

    if (isCattle) {
      if (listing.teethCount < 2 || listing.ageMonths < 24) {
        isCompliant = false;
        reasonsBn.push('গরু বা মহিষের বয়স ন্যূনতম ২ বছর এবং সামনের ২টি স্থায়ী দাঁত (দাঁতাল) থাকতে হবে।');
        reasonsEn.push('Cattle/Buffalo must be at least 2 years of age with 2 permanent incisor teeth.');
      }
    } else if (listing.category === LivestockCategory.GOAT || listing.category === LivestockCategory.SHEEP) {
      if (listing.ageMonths < 12) {
        isCompliant = false;
        reasonsBn.push('ছাগল বা ভেড়ার বয়স ন্যূনতম ১ বছর পূর্ণ হতে হবে।');
        reasonsEn.push('Goats/Sheep must have attained at least 1 full year of age.');
      }
    }

    // Health verification:
    if (listing.healthStatus !== VeterinaryHealthStatus.CERTIFIED_HEALTHY) {
      isCompliant = false;
      reasonsBn.push('পশুটি সরকারি পশু চিকিৎসক কর্তৃক সম্পূর্ণ সুস্থ ও ত্রুটিহীন প্রমাণিত হতে হবে।');
      reasonsEn.push('Animal must be certified completely healthy with no defect, blindness, or severe lameness.');
    }

    if (isCompliant) {
      reasonsBn.push('পশুটি দাঁত, বয়স ও স্বাস্থ্যগত দিক থেকে কোরবানি যোগ্য।');
      reasonsEn.push('Animal satisfies all Shariah requirements for Islamic sacrifice (Qurbani).');
    }

    return { isCompliant, reasonsBn, reasonsEn };
  }

  /**
   * Computes optimal AI insemination window based on the standard AM/PM rule.
   */
  calculateOptimalInseminationWindow(heatObservationDate: string): {
    heatObservedAt: string;
    windowStart: string;
    windowEnd: string;
    ruleDescriptionBn: string;
    ruleDescriptionEn: string;
  } {
    const obsTime = new Date(heatObservationDate);
    const validObs = isNaN(obsTime.getTime()) ? new Date() : obsTime;

    // AM/PM Rule: Inseminate 12 to 18 hours after onset of standing estrus
    const startMs = validObs.getTime() + 12 * 60 * 60 * 1000;
    const endMs = validObs.getTime() + 18 * 60 * 60 * 1000;

    const windowStart = new Date(startMs).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const windowEnd = new Date(endMs).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    return {
      heatObservedAt: validObs.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      windowStart,
      windowEnd,
      ruleDescriptionBn: 'সকালে গরম লক্ষণ প্রকাশ পেলে বিকেলে (১২-১৮ ঘণ্টা পর) এবং বিকেলে প্রকাশ পেলে পরের দিন সকালে প্রজনন করান।',
      ruleDescriptionEn: 'Morning-Evening rule: Inseminate 12-18 hours post-heat onset for highest conception rate (>75%).',
    };
  }

  // --- Livestock Listings Management ---

  async createListing(sellerId: string, dto: CreateLivestockListingDto): Promise<LivestockListing> {
    const existing = await this.listingRepo.findOne({ where: { earTagNumber: dto.earTagNumber } });
    if (existing) {
      throw new BadRequestException(`An animal with ear tag "${dto.earTagNumber}" already exists.`);
    }

    const listing = this.listingRepo.create({
      ...dto,
      sellerId,
      mediaUrls: dto.mediaUrls || [],
      healthStatus: VeterinaryHealthStatus.PENDING_INSPECTION,
      listingStatus: LivestockListingStatus.AVAILABLE,
      escrowStatus: null,
      escrowAmount: null,
      buyerId: null,
      buyerName: null,
      buyerPhone: null,
    });

    const saved = await this.listingRepo.save(listing);

    // Auto-create provisional health passport
    await this.passportRepo.save(
      this.passportRepo.create({
        earTagNumber: saved.earTagNumber,
        livestockId: saved.id,
        veterinaryOfficerName: 'Awaiting Upazila Veterinary Officer Inspection',
        veterinaryRegNumber: 'PENDING',
        upazilaHospital: `${saved.sellerUpazila} Upazila Livestock Office, ${saved.sellerDistrict}`,
        healthCertification: VeterinaryHealthStatus.PENDING_INSPECTION,
        bodyTemperatureCelsius: 38.5,
        dewormingDate: null,
        vaccinationLedger: [],
        healthRemarks: 'Newly registered by farmer. Physical inspection scheduled.',
        certificateQrCode: `https://gramerbazar.com/livestock/${saved.earTagNumber}`,
      }),
    );

    return saved;
  }

  async getListings(query?: LivestockQueryDto): Promise<LivestockListing[]> {
    const qb = this.listingRepo.createQueryBuilder('livestock');

    if (query?.category) {
      qb.andWhere('livestock.category = :cat', { cat: query.category });
    }
    if (query?.breed) {
      qb.andWhere('livestock.breed = :breed', { breed: query.breed });
    }
    if (query?.district) {
      qb.andWhere('LOWER(livestock.sellerDistrict) LIKE LOWER(:dist)', { dist: `%${query.district}%` });
    }
    if (query?.qurbaniOnly) {
      qb.andWhere('livestock.qurbaniEligible = true');
    }
    if (query?.minWeight) {
      qb.andWhere('livestock.liveWeightKg >= :minW', { minW: query.minWeight });
    }
    if (query?.maxPrice) {
      qb.andWhere('livestock.askingPrice <= :maxP', { maxP: query.maxPrice });
    }

    qb.orderBy('livestock.createdAt', 'DESC');
    return qb.getMany();
  }

  async getListingById(id: string): Promise<LivestockListing> {
    const item = await this.listingRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Livestock with ID ${id} not found.`);
    return item;
  }

  async getListingByEarTag(earTagNumber: string): Promise<LivestockListing> {
    const item = await this.listingRepo.findOne({ where: { earTagNumber } });
    if (!item) throw new NotFoundException(`Livestock with Ear Tag ${earTagNumber} not found.`);
    return item;
  }

  async getSellerListings(sellerId: string): Promise<LivestockListing[]> {
    return this.listingRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateListing(
    id: string,
    sellerId: string,
    dto: UpdateLivestockListingDto,
  ): Promise<LivestockListing> {
    const item = await this.getListingById(id);
    if (item.sellerId !== sellerId) {
      throw new BadRequestException('You are not authorized to update this livestock listing.');
    }

    Object.assign(item, dto);
    return this.listingRepo.save(item);
  }

  // --- Escrow & Direct Purchase Engine ---

  async commitEscrowPurchase(
    id: string,
    buyerId: string,
    dto: CommitEscrowPurchaseDto,
  ): Promise<LivestockListing> {
    const item = await this.getListingById(id);
    if (item.listingStatus !== LivestockListingStatus.AVAILABLE) {
      throw new BadRequestException(`Animal is currently ${item.listingStatus} and cannot be purchased.`);
    }

    item.buyerId = buyerId;
    item.buyerName = dto.buyerName;
    item.buyerPhone = dto.buyerPhone;
    item.escrowAmount = dto.escrowAmount || item.askingPrice;
    item.escrowStatus = LivestockEscrowStatus.HELD_IN_ESCROW;
    item.listingStatus = LivestockListingStatus.UNDER_ESCROW;

    this.logger.log(`Escrow committed for livestock ${item.earTagNumber} by buyer ${dto.buyerName} (৳${item.escrowAmount}).`);
    return this.listingRepo.save(item);
  }

  async releaseEscrowToSeller(id: string, buyerOrAdminId: string): Promise<LivestockListing> {
    const item = await this.getListingById(id);
    if (item.escrowStatus !== LivestockEscrowStatus.HELD_IN_ESCROW) {
      throw new BadRequestException('No funds are currently held in escrow for this animal.');
    }

    item.escrowStatus = LivestockEscrowStatus.RELEASED_TO_SELLER;
    item.listingStatus = LivestockListingStatus.SOLD;

    this.logger.log(`Escrow released for ${item.earTagNumber}: ৳${item.escrowAmount} disbursed to seller ${item.sellerName}.`);
    return this.listingRepo.save(item);
  }

  async refundEscrowToBuyer(id: string, adminId: string): Promise<LivestockListing> {
    const item = await this.getListingById(id);
    if (item.escrowStatus !== LivestockEscrowStatus.HELD_IN_ESCROW && item.escrowStatus !== LivestockEscrowStatus.DISPUTED) {
      throw new BadRequestException('Cannot refund escrow in current state.');
    }

    item.escrowStatus = LivestockEscrowStatus.REFUNDED_TO_BUYER;
    item.listingStatus = LivestockListingStatus.AVAILABLE;
    item.buyerId = null;
    item.buyerName = null;

    this.logger.log(`Escrow refunded by admin ${adminId} for ${item.earTagNumber}: ৳${item.escrowAmount} back to buyer.`);
    return this.listingRepo.save(item);
  }

  // --- Veterinary Health Passport Engine ---

  async getPassportByEarTag(earTagNumber: string): Promise<LivestockHealthPassport> {
    const passport = await this.passportRepo.findOne({ where: { earTagNumber } });
    if (!passport) {
      throw new NotFoundException(`No health passport found for ear tag ${earTagNumber}`);
    }
    return passport;
  }

  async recordHealthPassport(dto: RecordHealthPassportDto): Promise<LivestockHealthPassport> {
    let passport = await this.passportRepo.findOne({ where: { earTagNumber: dto.earTagNumber } });
    if (!passport) {
      passport = this.passportRepo.create({
        earTagNumber: dto.earTagNumber,
        livestockId: dto.livestockId,
        vaccinationLedger: [],
      });
    }

    passport.veterinaryOfficerName = dto.veterinaryOfficerName;
    passport.veterinaryRegNumber = dto.veterinaryRegNumber;
    passport.upazilaHospital = dto.upazilaHospital;
    passport.healthCertification = dto.healthCertification;
    passport.bodyTemperatureCelsius = dto.bodyTemperatureCelsius;
    if (dto.dewormingDate) passport.dewormingDate = dto.dewormingDate;
    if (dto.healthRemarks) passport.healthRemarks = dto.healthRemarks;
    passport.certifiedAt = new Date();

    const saved = await this.passportRepo.save(passport);

    // Sync listing health status
    await this.listingRepo.update(
      { earTagNumber: dto.earTagNumber },
      { healthStatus: dto.healthCertification },
    );

    return saved;
  }

  async addVaccineRecord(earTagNumber: string, dto: AddVaccineRecordDto): Promise<LivestockHealthPassport> {
    const passport = await this.getPassportByEarTag(earTagNumber);
    const ledger = passport.vaccinationLedger || [];
    ledger.push({
      vaccine: dto.vaccine,
      doseDate: dto.doseDate,
      nextDueDate: dto.nextDueDate,
      batchNo: dto.batchNo,
      administeredBy: dto.administeredBy,
    });

    passport.vaccinationLedger = ledger;
    return this.passportRepo.save(passport);
  }

  // --- Artificial Insemination (AI) Booking Engine ---

  async createAIBooking(farmerId: string, dto: CreateAIBookingDto): Promise<ArtificialInseminationBooking> {
    const bookingNumber = `AI-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const booking = this.aiBookingRepo.create({
      ...dto,
      farmerId,
      bookingNumber,
      status: AIServiceStatus.REQUESTED,
      fee: 650.0,
      strawSource: dto.strawSource || 'Central Cattle Breeding & Dairy Farm, Savar',
      technicianName: null,
      technicianPhone: null,
      inseminationDate: null,
      pregnancyCheckDate: null,
    });

    return this.aiBookingRepo.save(booking);
  }

  async getFarmerAIBookings(farmerId: string): Promise<ArtificialInseminationBooking[]> {
    return this.aiBookingRepo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllAIBookings(): Promise<ArtificialInseminationBooking[]> {
    return this.aiBookingRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateAIBookingStatus(
    id: string,
    dto: UpdateAIBookingStatusDto,
  ): Promise<ArtificialInseminationBooking> {
    const item = await this.aiBookingRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`AI Booking ${id} not found.`);

    Object.assign(item, dto);
    return this.aiBookingRepo.save(item);
  }

  // --- Livestock Specialized Transport Logistics ---

  async createTransportBooking(
    buyerId: string,
    dto: CreateLivestockTransportDto,
  ): Promise<LivestockTransportBooking> {
    const bookingNumber = `TRUCK-COW-${Date.now().toString().slice(-4)}`;

    const booking = this.transportRepo.create({
      ...dto,
      buyerId,
      bookingNumber,
      vehicleType: dto.vehicleType || 'Covered 1.5-Ton Pickup with Straw Bedding & Ramp',
      hasTransitInsurance: dto.hasTransitInsurance ?? true,
      insuranceFee: 500.0,
      status: LivestockTransportStatus.SCHEDULED,
      driverName: null,
      driverPhone: null,
      vehiclePlateNumber: null,
      notes: null,
    });

    return this.transportRepo.save(booking);
  }

  async getBuyerTransportBookings(buyerId: string): Promise<LivestockTransportBooking[]> {
    return this.transportRepo.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTransportBookings(): Promise<LivestockTransportBooking[]> {
    return this.transportRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateTransportStatus(
    id: string,
    dto: UpdateTransportStatusDto,
  ): Promise<LivestockTransportBooking> {
    const item = await this.transportRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Transport booking ${id} not found.`);

    Object.assign(item, dto);
    return this.transportRepo.save(item);
  }

  // --- Platform Analytics & Overview ---

  async getOverviewStats(): Promise<{
    totalListings: number;
    availableCattle: number;
    totalEscrowHeldBdt: number;
    dlsCertifiedPercentage: number;
    completedAIBreedings: number;
    activeTransports: number;
  }> {
    const totalListings = await this.listingRepo.count();
    const availableCattle = await this.listingRepo.count({
      where: { listingStatus: LivestockListingStatus.AVAILABLE },
    });

    const certifiedCount = await this.listingRepo.count({
      where: { healthStatus: VeterinaryHealthStatus.CERTIFIED_HEALTHY },
    });

    const dlsCertifiedPercentage =
      totalListings > 0 ? Math.round((certifiedCount / totalListings) * 100) : 100;

    const escrowListings = await this.listingRepo.find({
      where: { escrowStatus: LivestockEscrowStatus.HELD_IN_ESCROW },
    });
    const totalEscrowHeldBdt = escrowListings.reduce(
      (acc, curr) => acc + Number(curr.escrowAmount || 0),
      0,
    );

    const completedAIBreedings = await this.aiBookingRepo.count({
      where: { status: AIServiceStatus.INSEMINATION_COMPLETED },
    });

    const activeTransports = await this.transportRepo.count({
      where: { status: LivestockTransportStatus.IN_TRANSIT },
    });

    return {
      totalListings,
      availableCattle,
      totalEscrowHeldBdt,
      dlsCertifiedPercentage,
      completedAIBreedings,
      activeTransports,
    };
  }
}
