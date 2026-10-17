import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HatcheryBatch } from './entities/hatchery-batch.entity.js';
import { PondIotTelemetry } from './entities/pond-iot-telemetry.entity.js';
import { FeedFcrLog } from './entities/feed-fcr-log.entity.js';
import { LiveFishTransportBooking } from './entities/live-fish-transport-booking.entity.js';
import {
  AquacultureCategory,
  SpeciesName,
  HatcheryStage,
  PCRTestStatus,
  PondWaterQualityStatus,
  LiveFishTransportStatus,
} from './enums/aquaculture.enum.js';
import {
  CreateHatcheryBatchDto,
  QueryHatcheryBatchesDto,
  UpdateHatcheryBatchDto,
  IngestPondTelemetryDto,
  RecordFeedFcrDto,
  BookLiveFishTankerDto,
  UpdateTankerStatusDto,
} from './dto/aquaculture.dto.js';

@Injectable()
export class AquacultureService implements OnModuleInit {
  private readonly logger = new Logger(AquacultureService.name);

  constructor(
    @InjectRepository(HatcheryBatch)
    private readonly batchRepo: Repository<HatcheryBatch>,
    @InjectRepository(PondIotTelemetry)
    private readonly telemetryRepo: Repository<PondIotTelemetry>,
    @InjectRepository(FeedFcrLog)
    private readonly fcrRepo: Repository<FeedFcrLog>,
    @InjectRepository(LiveFishTransportBooking)
    private readonly tankerRepo: Repository<LiveFishTransportBooking>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedBaselineData();
  }

  // --- Baseline Seed Data ---
  async seedBaselineData(): Promise<void> {
    const count = await this.batchRepo.count();
    if (count > 0) return;

    this.logger.log('Seeding baseline Aquaculture hatchery batches, IoT telemetry, FCR logs and live tankers...');

    const sampleBatches: Partial<HatcheryBatch>[] = [
      {
        hatcheryOwnerId: 'seller-hatchery-satk',
        hatcheryName: 'Sundarban Coastal Shrimp Hatchery',
        hatcheryPhone: '01711223344',
        hatcheryDistrict: 'Satkhira',
        hatcheryUpazila: 'Debhata',
        batchNumber: 'BATCH-SPF-BAGDA-9941',
        category: AquacultureCategory.SHRIMP_BLACK_TIGER,
        species: SpeciesName.BAGDA_SHRIMP,
        stage: HatcheryStage.FINGERLING_DHANI,
        pcrTestReportNumber: 'PCR-DOF-SAT-2601',
        pcrTestStatus: PCRTestStatus.PCR_TESTED_NEGATIVE_SPF,
        testingLab: 'Department of Fisheries (DoF) QC & PCR Diagnostic Lab, Khulna',
        fingerlingCount: 250000,
        averageLengthCm: 1.6,
        unitPriceBdt: 0.85, // ৳850 per thousand PL
        minOrderQuantity: 10000,
        oxygenPackingIncluded: true,
        isAvailable: true,
        description: 'শতভাগ এসপিএফ (Specific Pathogen Free) ব্রুডস্টক থেকে উৎপাদিত বাগদা পিএল-১৫। পিসিআর টেস্টে ডব্লিউএসএসভি (হোয়াইট স্পট ভাইরাস) ও ইএইচপি মুক্ত প্রমাণিত।',
      },
      {
        hatcheryOwnerId: 'seller-hatchery-bage',
        hatcheryName: 'Rupsha River Prawn Breeding Centre',
        hatcheryPhone: '01712998877',
        hatcheryDistrict: 'Bagerhat',
        hatcheryUpazila: 'Fakirhat',
        batchNumber: 'BATCH-GALDA-FAK-8820',
        category: AquacultureCategory.PRAWN_GALDA,
        species: SpeciesName.GALDA_PRAWN,
        stage: HatcheryStage.JUVENILE_CHALA,
        pcrTestReportNumber: 'PCR-DOF-BAG-1104',
        pcrTestStatus: PCRTestStatus.PCR_TESTED_NEGATIVE_SPF,
        testingLab: 'BFRI Freshwater Sub-Station, Paikgachha',
        fingerlingCount: 80000,
        averageLengthCm: 2.8,
        unitPriceBdt: 3.2,
        minOrderQuantity: 2000,
        oxygenPackingIncluded: true,
        isAvailable: true,
        description: 'উন্নত মানের বড় সাইজের খাঁটি গলদা জুভেনাইল। পুকুর ও ঘেরে ছাড়ার সাথে সাথে দ্রুত বর্ধনশীল।',
      },
      {
        hatcheryOwnerId: 'seller-hatchery-myme',
        hatcheryName: 'Brahmaputra Aqua Genetics & Hatchery',
        hatcheryPhone: '01911554433',
        hatcheryDistrict: 'Mymensingh',
        hatcheryUpazila: 'Trishal',
        batchNumber: 'BATCH-TILAPIA-TRIS-4411',
        category: AquacultureCategory.TILAPIA_PANGAS,
        species: SpeciesName.MONOSEX_TILAPIA,
        stage: HatcheryStage.FINGERLING_DHANI,
        pcrTestReportNumber: 'BFRI-TIL-2026-9',
        pcrTestStatus: PCRTestStatus.PCR_TESTED_NEGATIVE_SPF,
        testingLab: 'Bangladesh Fisheries Research Institute (BFRI), Mymensingh',
        fingerlingCount: 500000,
        averageLengthCm: 2.2,
        unitPriceBdt: 1.1,
        minOrderQuantity: 5000,
        oxygenPackingIncluded: true,
        isAvailable: true,
        description: '৯৯% খাঁটি মনোসেক্স মেল তেলাপিয়া পোনা। হরমোন ট্রিটমেন্ট সঠিকভাবে সম্পন্ন। দ্রুত ওজন বাড়ে।',
      },
    ];

    for (const b of sampleBatches) {
      await this.batchRepo.save(this.batchRepo.create(b));
    }

    // Seed sample Pond Telemetry
    await this.telemetryRepo.save(
      this.telemetryRepo.create({
        farmerId: 'farmer-motiur-satk',
        pondId: 'pond-satk-gher-03',
        pondName: 'Satkhira Gher Pond 03 (Bagda SPF)',
        dissolvedOxygenMgL: 3.4, // Hypoxia threshold
        waterTemperatureCelsius: 29.5,
        waterPh: 7.8,
        ammoniaNh3Ppm: 0.02,
        salinityPpt: 13.5,
        waterQualityStatus: PondWaterQualityStatus.HYPOXIA_CRITICAL,
        aeratorsActive: true,
        alertMessage: 'মারাত্মক অক্সিজেন ঘাটতি (৩.৪ mg/L)! স্বয়ংক্রিয়ভাবে প্যাডেল-হুইল এয়ারেটর চালু করা হয়েছে।',
        recordedAt: new Date(),
      }),
    );

    // Seed sample FCR Log
    await this.fcrRepo.save(
      this.fcrRepo.create({
        farmerId: 'farmer-salim-myme',
        pondId: 'pond-tris-tilapia-01',
        species: SpeciesName.MONOSEX_TILAPIA,
        stockingDate: '2026-07-15',
        feedBrand: 'Mega Feed Floating Grower 28% Protein',
        cumulativeFeedKg: 1450,
        estimatedBiomassKg: 1130,
        calculatedFcr: 1.28,
        averageBodyWeightGrams: 280,
        survivalRatePercentage: 89,
        notes: 'আদর্শ এফসিআর (১.২৮)। মাছের স্বাস্থ্য উজ্জ্বল এবং পানির অ্যামোনিয়া নিয়ন্ত্রণে।',
        recordedDate: '2026-10-17',
      }),
    );

    // Seed sample Live Fish Tanker Booking
    await this.tankerRepo.save(
      this.tankerRepo.create({
        bookingNumber: 'LIVE-TANKER-5512',
        buyerId: 'buyer-aratdar-dhak',
        farmerId: 'farmer-salim-myme',
        pickupDistrict: 'Mymensingh',
        pickupUpazila: 'Trishal',
        pickupGherAddress: 'Salim Aqua Farm, Trishal-Balipara Road',
        dropoffMarket: 'Karwan Bazar Live Fish Wholesale Arat, Dhaka',
        vehicleType: 'Specialized 3-Ton Aerated Water Tanker with O2 Diffusers',
        species: SpeciesName.RUI_ROHU,
        approximateFishKg: 1500,
        estimatedLivePriceBdt: 540000, // ৳360/kg live
        transportFareBdt: 14000,
        waterTankerStatus: LiveFishTransportStatus.AERATION_PREPPED,
        driverName: 'Alamgir Hossain',
        driverPhone: '01719001122',
        departureTime: '2026-10-17 10:00 PM',
        notes: 'রাত ১০টায় ট্রাকে লোডিং হবে। অক্সিজেন ডিফিউজার প্রেশার ৩.৫ বার সেট করা হয়েছে।',
      }),
    );

    this.logger.log('Seeded baseline aquaculture ecosystem successfully.');
  }

  // --- Core Algorithms & Domain Logic ---

  /**
   * Evaluates pond water parameters against DoF standards.
   * Hypoxia trigger (< 4.0 mg/L) automatically turns on aerators.
   */
  evaluateWaterQuality(dto: IngestPondTelemetryDto): {
    status: PondWaterQualityStatus;
    aeratorsActive: boolean;
    alertMessageBn: string;
    alertMessageEn: string;
    actionProtocolBn: string[];
  } {
    let status: PondWaterQualityStatus = PondWaterQualityStatus.OPTIMAL;
    let aeratorsActive = false;
    let alertMessageBn = 'পানির সকল প্যারামিটার অনুকূল রয়েছে।';
    let alertMessageEn = 'All water parameters are within optimal aquaculture thresholds.';
    const actionProtocolBn: string[] = [];

    // 1. Dissolved Oxygen (DO)
    if (dto.dissolvedOxygenMgL < 4.0) {
      status = PondWaterQualityStatus.HYPOXIA_CRITICAL;
      aeratorsActive = true;
      alertMessageBn = `মারাত্মক অক্সিজেন ঘাটতি (${dto.dissolvedOxygenMgL} mg/L)! মাছের শ্বাসকষ্ট ও মড়ক রোধে অবিলম্বে এয়ারেটর চালু করুন।`;
      alertMessageEn = `Critical hypoxia detected (${dto.dissolvedOxygenMgL} mg/L). Paddle-wheel aerators activated automatically.`;
      actionProtocolBn.push('অবিলম্বে সবকটি প্যাডেল-হুইল বা স্পাইরাল এয়ারেটর চালু করুন।');
      actionProtocolBn.push('পুকুরে খাদ্য প্রয়োগ সাময়িকভাবে সম্পূর্ণ বন্ধ রাখুন।');
    } else if (dto.dissolvedOxygenMgL < 5.0) {
      status = PondWaterQualityStatus.MILD_STRESS;
      alertMessageBn = `অক্সিজেন কিছুটা কম (${dto.dissolvedOxygenMgL} mg/L)। মধ্যরাতের পর নজরদারি বাড়ান।`;
      alertMessageEn = `Sub-optimal oxygen level (${dto.dissolvedOxygenMgL} mg/L). Monitor closely.`;
    }

    // 2. Toxic Ammonia (NH3)
    if (dto.ammoniaNh3Ppm > 0.05) {
      status = PondWaterQualityStatus.TOXIC_AMMONIA_SPIKE;
      alertMessageBn = `বিষাক্ত অ্যামোনিয়া বিপজ্জনক মাত্রায় (${dto.ammoniaNh3Ppm} ppm)! ফুলকা ক্ষতি ও বিষক্রিয়া হতে পারে।`;
      alertMessageEn = `Toxic unionized ammonia spike (${dto.ammoniaNh3Ppm} ppm).`;
      actionProtocolBn.push('পুকুরের তলদেশের ২০-৩০% বিষাক্ত পানি বের করে নতুন পানি প্রবেশ করান।');
      actionProtocolBn.push('প্রতি শতাংশে ২০০ গ্রাম চিটাগুড় (Molasses) ও প্রোবায়োটিক প্রয়োগ করুন।');
    }

    // 3. pH checks
    if (dto.waterPh < 6.5) {
      actionProtocolBn.push('পানি অতিরিক্ত অম্লীয়। প্রতি শতাংশে ১ কেজি কৃষি চুন প্রয়োগ করুন।');
    } else if (dto.waterPh > 8.5) {
      actionProtocolBn.push('পানি অতিরিক্ত ক্ষারীয়। হালকা তেঁতুল বা চুন মুক্ত পানি যোগ করুন।');
    }

    if (actionProtocolBn.length === 0) {
      actionProtocolBn.push('নিয়মিত খাদ্য ও প্রাকৃতিক প্ল্যাঙ্কটন পর্যবেক্ষণ বজায় রাখুন।');
    }

    return {
      status,
      aeratorsActive,
      alertMessageBn,
      alertMessageEn,
      actionProtocolBn,
    };
  }

  /**
   * Calculates Feed Conversion Ratio (FCR) and financial feed efficiency.
   */
  calculateFcrAndEfficiency(
    cumulativeFeedKg: number,
    estimatedBiomassKg: number,
    species: SpeciesName,
  ): {
    calculatedFcr: number;
    rating: 'EXCELLENT' | 'STANDARD' | 'POOR_FEED_WASTE';
    benchmarkFcr: number;
    ratingDescriptionBn: string;
    feedSavingsBdt: number;
  } {
    if (estimatedBiomassKg <= 0) {
      throw new BadRequestException('Estimated biomass must be greater than zero.');
    }

    const calculatedFcr = Number((cumulativeFeedKg / estimatedBiomassKg).toFixed(2));

    let benchmarkFcr = 1.4; // Default Tilapia
    if (
      species === SpeciesName.RUI_ROHU ||
      species === SpeciesName.KATLA ||
      species === SpeciesName.MRIGEL
    ) {
      benchmarkFcr = 1.7;
    } else if (species === SpeciesName.BAGDA_SHRIMP || species === SpeciesName.GALDA_PRAWN) {
      benchmarkFcr = 1.3;
    } else if (species === SpeciesName.PANGASIUS) {
      benchmarkFcr = 1.5;
    }

    let rating: 'EXCELLENT' | 'STANDARD' | 'POOR_FEED_WASTE' = 'STANDARD';
    let ratingDescriptionBn = 'এফসিআর স্বাভাবিক মাত্রায় রয়েছে।';

    if (calculatedFcr <= benchmarkFcr - 0.1) {
      rating = 'EXCELLENT';
      ratingDescriptionBn = 'অসাধারণ খাদ্য রূপান্তর দক্ষতা! খাদ্যের অপচয় নেই এবং মাছের পুষ্টি শোষণ সর্বোচ্চ।';
    } else if (calculatedFcr > benchmarkFcr + 0.25) {
      rating = 'POOR_FEED_WASTE';
      ratingDescriptionBn = 'উচ্চ এফসিআর! পুকুরের তলদেশে অতিরিক্ত খাদ্য জমা হয়ে পঁচে যাচ্ছে। খাবারের পরিমাণ কমান।';
    }

    const diffKg = Math.max(0, (benchmarkFcr - calculatedFcr) * estimatedBiomassKg);
    const feedSavingsBdt = Math.round(diffKg * 68); // ~৳68 per kg aqua feed

    return {
      calculatedFcr,
      rating,
      benchmarkFcr,
      ratingDescriptionBn,
      feedSavingsBdt,
    };
  }

  /**
   * Calculates live fish price premium vs. dead iced fish in wholesale markets.
   */
  calculateLiveFishMarketArbitrage(
    species: SpeciesName,
    weightKg: number,
  ): {
    species: SpeciesName;
    weightKg: number;
    livePricePerKgBdt: number;
    deadIcedPricePerKgBdt: number;
    premiumPercentage: number;
    grossLiveRevenueBdt: number;
    grossIcedRevenueBdt: number;
    netPremiumAdvantageBdt: number;
  } {
    let liveRate = 360;
    let icedRate = 265;

    switch (species) {
      case SpeciesName.RUI_ROHU:
      case SpeciesName.KATLA:
        liveRate = 380;
        icedRate = 270;
        break;
      case SpeciesName.MONOSEX_TILAPIA:
        liveRate = 240;
        icedRate = 180;
        break;
      case SpeciesName.SHING:
      case SpeciesName.GULSHA_TENGRA:
        liveRate = 680;
        icedRate = 420;
        break;
      case SpeciesName.BAGDA_SHRIMP:
        liveRate = 1150;
        icedRate = 880;
        break;
      case SpeciesName.GALDA_PRAWN:
        liveRate = 1250;
        icedRate = 950;
        break;
      case SpeciesName.PANGASIUS:
        liveRate = 190;
        icedRate = 145;
        break;
    }

    const premiumPercentage = Number((((liveRate - icedRate) / icedRate) * 100).toFixed(1));
    const grossLiveRevenueBdt = liveRate * weightKg;
    const grossIcedRevenueBdt = icedRate * weightKg;
    const netPremiumAdvantageBdt = grossLiveRevenueBdt - grossIcedRevenueBdt;

    return {
      species,
      weightKg,
      livePricePerKgBdt: liveRate,
      deadIcedPricePerKgBdt: icedRate,
      premiumPercentage,
      grossLiveRevenueBdt,
      grossIcedRevenueBdt,
      netPremiumAdvantageBdt,
    };
  }

  // --- Hatchery Batches ---

  async createHatcheryBatch(
    ownerId: string,
    dto: CreateHatcheryBatchDto,
  ): Promise<HatcheryBatch> {
    const existing = await this.batchRepo.findOne({ where: { batchNumber: dto.batchNumber } });
    if (existing) {
      throw new BadRequestException(`Batch with number "${dto.batchNumber}" already exists.`);
    }

    const batch = this.batchRepo.create({
      ...dto,
      hatcheryOwnerId: ownerId,
      pcrTestStatus: dto.pcrTestStatus || PCRTestStatus.PCR_PENDING,
      isAvailable: true,
    });

    return this.batchRepo.save(batch);
  }

  async getHatcheryBatches(query?: QueryHatcheryBatchesDto): Promise<HatcheryBatch[]> {
    const qb = this.batchRepo.createQueryBuilder('batch');

    if (query?.category) {
      qb.andWhere('batch.category = :cat', { cat: query.category });
    }
    if (query?.species) {
      qb.andWhere('batch.species = :species', { species: query.species });
    }
    if (query?.district) {
      qb.andWhere('LOWER(batch.hatcheryDistrict) LIKE LOWER(:dist)', { dist: `%${query.district}%` });
    }
    if (query?.spfOnly) {
      qb.andWhere('batch.pcrTestStatus = :spf', { spf: PCRTestStatus.PCR_TESTED_NEGATIVE_SPF });
    }

    qb.orderBy('batch.createdAt', 'DESC');
    return qb.getMany();
  }

  async getHatcheryBatchById(id: string): Promise<HatcheryBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException(`Hatchery batch with ID ${id} not found.`);
    return batch;
  }

  async getHatcheryBatchesByOwner(ownerId: string): Promise<HatcheryBatch[]> {
    return this.batchRepo.find({
      where: { hatcheryOwnerId: ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateHatcheryBatch(
    id: string,
    dto: UpdateHatcheryBatchDto,
  ): Promise<HatcheryBatch> {
    const batch = await this.getHatcheryBatchById(id);
    Object.assign(batch, dto);
    return this.batchRepo.save(batch);
  }

  // --- Pond Water Quality Telemetry ---

  async ingestPondTelemetry(
    farmerId: string,
    dto: IngestPondTelemetryDto,
  ): Promise<PondIotTelemetry> {
    const evaluation = this.evaluateWaterQuality(dto);

    const record = this.telemetryRepo.create({
      ...dto,
      farmerId,
      salinityPpt: dto.salinityPpt ?? 0.0,
      waterQualityStatus: evaluation.status,
      aeratorsActive: evaluation.aeratorsActive,
      alertMessage: evaluation.alertMessageBn,
      recordedAt: new Date(),
    });

    return this.telemetryRepo.save(record);
  }

  async getPondTelemetry(pondId: string): Promise<PondIotTelemetry[]> {
    return this.telemetryRepo.find({
      where: { pondId },
      order: { recordedAt: 'DESC' },
      take: 50,
    });
  }

  async getFarmerLatestTelemetry(farmerId: string): Promise<PondIotTelemetry[]> {
    return this.telemetryRepo.find({
      where: { farmerId },
      order: { recordedAt: 'DESC' },
      take: 20,
    });
  }

  // --- Feed & FCR Tracking ---

  async recordFeedFcr(farmerId: string, dto: RecordFeedFcrDto): Promise<FeedFcrLog> {
    const fcrCalc = this.calculateFcrAndEfficiency(
      dto.cumulativeFeedKg,
      dto.estimatedBiomassKg,
      dto.species,
    );

    const log = this.fcrRepo.create({
      ...dto,
      farmerId,
      calculatedFcr: fcrCalc.calculatedFcr,
      survivalRatePercentage: dto.survivalRatePercentage ?? 85.0,
    });

    return this.fcrRepo.save(log);
  }

  async getPondFcrLogs(pondId: string): Promise<FeedFcrLog[]> {
    return this.fcrRepo.find({
      where: { pondId },
      order: { createdAt: 'DESC' },
    });
  }

  async getFarmerFcrLogs(farmerId: string): Promise<FeedFcrLog[]> {
    return this.fcrRepo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  // --- Live Fish Aerated Tanker Logistics ---

  async bookLiveFishTanker(
    buyerId: string,
    dto: BookLiveFishTankerDto,
  ): Promise<LiveFishTransportBooking> {
    const bookingNumber = `LIVE-TANKER-${Date.now().toString().slice(-4)}`;

    const arbitrage = this.calculateLiveFishMarketArbitrage(
      dto.species,
      dto.approximateFishKg,
    );

    const booking = this.tankerRepo.create({
      ...dto,
      buyerId,
      bookingNumber,
      estimatedLivePriceBdt: arbitrage.grossLiveRevenueBdt,
      vehicleType: dto.vehicleType || 'Specialized 3-Ton Aerated Water Tanker with O2 Diffusers',
      waterTankerStatus: LiveFishTransportStatus.REQUESTED,
      driverName: null,
      driverPhone: null,
      vehiclePlateNumber: null,
      departureTime: dto.departureTime || null,
      notes: dto.notes || null,
    });

    return this.tankerRepo.save(booking);
  }

  async getBuyerTankerBookings(buyerId: string): Promise<LiveFishTransportBooking[]> {
    return this.tankerRepo.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTankerBookings(): Promise<LiveFishTransportBooking[]> {
    return this.tankerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateTankerStatus(
    id: string,
    dto: UpdateTankerStatusDto,
  ): Promise<LiveFishTransportBooking> {
    const booking = await this.tankerRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException(`Tanker booking with ID ${id} not found.`);

    Object.assign(booking, dto);
    return this.tankerRepo.save(booking);
  }

  // --- Overview Platform Stats ---

  async getAquacultureOverviewStats(): Promise<{
    totalFingerlingsAvailable: number;
    spfCertifiedPercentage: number;
    activeMonitoredPonds: number;
    averagePondDoMgL: number;
    activeLiveFishTankers: number;
    totalLiveFishKgTransported: number;
  }> {
    const batches = await this.batchRepo.find();
    const totalFingerlingsAvailable = batches.reduce(
      (sum, b) => sum + (b.isAvailable ? b.fingerlingCount : 0),
      0,
    );

    const spfCount = batches.filter(
      (b) => b.pcrTestStatus === PCRTestStatus.PCR_TESTED_NEGATIVE_SPF,
    ).length;
    const spfCertifiedPercentage =
      batches.length > 0 ? Math.round((spfCount / batches.length) * 100) : 100;

    const telemetry = await this.telemetryRepo.find({ take: 100 });
    const activeMonitoredPonds = new Set(telemetry.map((t) => t.pondId)).size;
    const averagePondDoMgL =
      telemetry.length > 0
        ? Number(
            (
              telemetry.reduce((sum, t) => sum + Number(t.dissolvedOxygenMgL), 0) /
              telemetry.length
            ).toFixed(1),
          )
        : 6.2;

    const tankers = await this.tankerRepo.find();
    const activeLiveFishTankers = tankers.filter(
      (t) => t.waterTankerStatus === LiveFishTransportStatus.IN_TRANSIT_LIVE,
    ).length;
    const totalLiveFishKgTransported = tankers.reduce(
      (sum, t) => sum + Number(t.approximateFishKg),
      0,
    );

    return {
      totalFingerlingsAvailable,
      spfCertifiedPercentage,
      activeMonitoredPonds,
      averagePondDoMgL,
      activeLiveFishTankers,
      totalLiveFishKgTransported,
    };
  }
}
