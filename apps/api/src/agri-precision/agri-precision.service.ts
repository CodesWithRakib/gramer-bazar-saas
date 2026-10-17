import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';
import { AgriInputRegistryItem } from './entities/agri-input-registry.entity.js';
import { AgriInputCounterfeitReport } from './entities/agri-input-counterfeit-report.entity.js';
import { DroneSprayingUnit } from './entities/drone-spraying-unit.entity.js';
import { DroneSprayingBooking } from './entities/drone-spraying-booking.entity.js';
import { SoilHealthCardRecord } from './entities/soil-health-card.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  CropTargetNutrient,
  DroneBookingStatus,
  InputCategory,
  InputVerificationStatus,
  SoilTextureType,
} from './enums/agri-precision.enum.js';
import {
  BookDroneSprayingDto,
  CreateAgriInputDto,
  GenerateSoilHealthCardDto,
  QueryDroneUnitsDto,
  RegisterDroneUnitDto,
  ReportCounterfeitInputDto,
  UpdateDroneBookingStatusDto,
} from './dto/agri-precision.dto.js';

@Injectable()
export class AgriPrecisionService {
  constructor(
    @InjectRepository(AgriInputRegistryItem)
    private readonly inputRepo: Repository<AgriInputRegistryItem>,
    @InjectRepository(AgriInputCounterfeitReport)
    private readonly reportRepo: Repository<AgriInputCounterfeitReport>,
    @InjectRepository(DroneSprayingUnit)
    private readonly droneUnitRepo: Repository<DroneSprayingUnit>,
    @InjectRepository(DroneSprayingBooking)
    private readonly droneBookingRepo: Repository<DroneSprayingBooking>,
    @InjectRepository(SoilHealthCardRecord)
    private readonly soilCardRepo: Repository<SoilHealthCardRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // --- 1. Agri-Input Anti-Counterfeit Verification Engine ---

  async verifyInput(code: string): Promise<{
    isAuthentic: boolean;
    status: InputVerificationStatus;
    item?: AgriInputRegistryItem;
    messageEn: string;
    messageBn: string;
  }> {
    const trimmed = code.trim();
    let item = await this.inputRepo.findOne({
      where: [{ barcodeOrQrCode: trimmed }, { batchNumber: trimmed }],
    });

    if (!item) {
      // Check if DB is empty; if so, seed baseline inputs
      const count = await this.inputRepo.count();
      if (count === 0) {
        await this.seedBaselineInputs();
        item = await this.inputRepo.findOne({
          where: [{ barcodeOrQrCode: trimmed }, { batchNumber: trimmed }],
        });
      }
    }

    if (!item) {
      return {
        isAuthentic: false,
        status: InputVerificationStatus.SUSPICIOUS_COUNTERFEIT,
        messageEn:
          'UNVERIFIED CODE: This serial or barcode is NOT in the DAE registry. High risk of counterfeit or substandard pesticide/seed.',
        messageBn:
          'অননুমোদিত কোড: এই বারকোডটি সরকারি ডিএই বা প্রস্তুতকারকের ডাটাবেজে পাওয়া যায়নি। ভেজাল বা নকল রাসায়নিকের উচ্চ ঝুঁকি রয়েছে!',
      };
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(item.expiryDate);
    if (expiry < now) {
      return {
        isAuthentic: false,
        status: InputVerificationStatus.EXPIRED,
        item,
        messageEn: `EXPIRED PRODUCT: This chemical batch expired on ${item.expiryDate}. Chemical efficacy is compromised.`,
        messageBn: `মেয়াদোত্তীর্ণ পণ্য: এই ব্যাচের কার্যকারিতার মেয়াদ ${item.expiryDate} তারিখে শেষ হয়েছে। জমিতে ব্যবহারে ফলন ক্ষতির ঝুঁকি রয়েছে।`,
      };
    }

    if (item.status === InputVerificationStatus.RECALLED) {
      return {
        isAuthentic: false,
        status: InputVerificationStatus.RECALLED,
        item,
        messageEn: 'RECALLED BATCH: This product batch has been officially recalled by the manufacturer.',
        messageBn: 'প্রত্যাহারকৃত ব্যাচ: প্রস্তুতকারক কোম্পানি এই ব্যাচের সকল পণ্য বাজার থেকে প্রত্যাহার করেছে।',
      };
    }

    return {
      isAuthentic: true,
      status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
      item,
      messageEn: `VERIFIED AUTHENTIC: Genuine ${item.brandName} produced by ${item.manufacturerName}. DAE License: ${item.daeRegistrationNo}.`,
      messageBn: `শতভাগ আসল ও সার্টিফাইড: ${item.manufacturerName} কর্তৃক প্রস্তুতকৃত অনুমোদিত ${item.brandName}। সরকারি লাইসেন্স: ${item.daeRegistrationNo}।`,
    };
  }

  async createInputItem(dto: CreateAgriInputDto): Promise<AgriInputRegistryItem> {
    const existing = await this.inputRepo.findOne({ where: { barcodeOrQrCode: dto.barcodeOrQrCode } });
    if (existing) {
      throw new BadRequestException('An input item with this barcode or QR code is already registered');
    }

    const item = this.inputRepo.create({
      ...dto,
      manufactureDate: new Date(dto.manufactureDate),
      expiryDate: new Date(dto.expiryDate),
      standardPurityPct: Number(dto.standardPurityPct || 99.0),
      mrpPriceBdt: Number(dto.mrpPriceBdt),
    });

    return await this.inputRepo.save(item);
  }

  async reportCounterfeit(
    reporterUserId: string | null,
    dto: ReportCounterfeitInputDto,
  ): Promise<AgriInputCounterfeitReport> {
    const reportTicketNo = `RPT-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const report = this.reportRepo.create({
      ...dto,
      reporterUserId,
      reportTicketNo,
      evidencePhotos: dto.evidencePhotos || [],
      isEscalatedToDae: false,
      daeInvestigationStatus: 'SUBMITTED',
    });

    const saved = await this.reportRepo.save(report);

    // If matching barcode exists in registry, increment counterfeit report counter
    const matched = await this.inputRepo.findOne({ where: { barcodeOrQrCode: dto.suspectedItemBarcode } });
    if (matched) {
      matched.counterfeitReportsCount = (matched.counterfeitReportsCount || 0) + 1;
      if (matched.counterfeitReportsCount >= 3) {
        matched.status = InputVerificationStatus.SUSPICIOUS_COUNTERFEIT;
      }
      await this.inputRepo.save(matched);
    }

    return saved;
  }

  async getCounterfeitReports(): Promise<AgriInputCounterfeitReport[]> {
    return await this.reportRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async escalateReportToDae(reportId: string): Promise<AgriInputCounterfeitReport> {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report ticket not found');
    }

    report.isEscalatedToDae = true;
    report.daeInvestigationStatus = 'UNDER_INSPECTION';
    return await this.reportRepo.save(report);
  }

  // --- 2. Precision Agricultural Drone Spraying Fleet ---

  async registerDroneUnit(pilotId: string, dto: RegisterDroneUnitDto): Promise<DroneSprayingUnit> {
    const pilot = await this.userRepo.findOne({ where: { id: pilotId } });
    if (!pilot) {
      throw new NotFoundException('Pilot account not found');
    }

    const droneCode = dto.droneCode || `DRN-${dto.baseDistrict.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const unit = this.droneUnitRepo.create({
      ...dto,
      pilotId,
      droneCode,
      tankCapacityLiters: Number(dto.tankCapacityLiters || 40.0),
      serviceRatePerBigha: Number(dto.serviceRatePerBigha),
      coverageRadiusKm: dto.coverageRadiusKm || 30,
      totalAcresSprayed: 0,
      waterSavedLitersEstimated: 0,
      isAvailable: true,
    });

    return await this.droneUnitRepo.save(unit);
  }

  async findAllDroneUnits(query: QueryDroneUnitsDto): Promise<{
    items: DroneSprayingUnit[];
    total: number;
  }> {
    const where: FindOptionsWhere<DroneSprayingUnit> = {};
    if (query.district && query.district !== 'ALL') {
      where.baseDistrict = query.district;
    }
    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }

    let [items, total] = await this.droneUnitRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['pilot'],
    });

    if (total === 0 && !query.district) {
      items = await this.seedDefaultDroneUnits();
      total = items.length;
    }

    return { items, total };
  }

  async bookDroneSpraying(farmerId: string, dto: BookDroneSprayingDto): Promise<DroneSprayingBooking> {
    const unit = await this.droneUnitRepo.findOne({ where: { id: dto.droneUnitId } });
    if (!unit) {
      throw new NotFoundException('Drone spraying unit not found');
    }

    const bighas = Number(dto.landAreaBighas);
    const rate = Number(unit.serviceRatePerBigha);
    const totalCost = Number((bighas * rate).toFixed(2));

    // Water savings: Traditional knapsack spray ~200L/bigha vs Drone ULV atomization ~16L/bigha (saves 184L/bigha)
    const waterSaved = Number((bighas * 184).toFixed(2));

    const bookingNumber = `DRN-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const booking = this.droneBookingRepo.create({
      ...dto,
      farmerId,
      bookingNumber,
      landAreaBighas: bighas,
      serviceRatePerBigha: rate,
      totalBookingCost: totalCost,
      waterSavedLiters: waterSaved,
      status: DroneBookingStatus.REQUESTED,
    });

    return await this.droneBookingRepo.save(booking);
  }

  async getFarmerDroneBookings(farmerId: string): Promise<DroneSprayingBooking[]> {
    return await this.droneBookingRepo.find({
      where: { farmerId },
      relations: ['droneUnit'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPilotDroneBookings(pilotId: string): Promise<DroneSprayingBooking[]> {
    return await this.droneBookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.droneUnit', 'droneUnit')
      .leftJoinAndSelect('b.farmer', 'farmer')
      .where('droneUnit.pilotId = :pilotId', { pilotId })
      .orderBy('b.createdAt', 'DESC')
      .getMany();
  }

  async updateDroneBookingStatus(
    bookingId: string,
    dto: UpdateDroneBookingStatusDto,
  ): Promise<DroneSprayingBooking> {
    const booking = await this.droneBookingRepo.findOne({
      where: { id: bookingId },
      relations: ['droneUnit'],
    });

    if (!booking) {
      throw new NotFoundException('Drone booking not found');
    }

    booking.status = dto.status;
    if (dto.flightDurationMinutes !== undefined) {
      booking.flightDurationMinutes = dto.flightDurationMinutes;
    }
    if (dto.waterSavedLiters !== undefined) {
      booking.waterSavedLiters = dto.waterSavedLiters;
    }
    if (dto.pilotMissionNotes) {
      booking.pilotMissionNotes = dto.pilotMissionNotes;
    }

    const saved = await this.droneBookingRepo.save(booking);

    // If completed, increment unit statistics
    if (dto.status === DroneBookingStatus.COMPLETED && booking.droneUnit) {
      const unit = booking.droneUnit;
      const acresAdded = Number((Number(booking.landAreaBighas) / 3).toFixed(2));
      unit.totalAcresSprayed = Number(unit.totalAcresSprayed) + acresAdded;
      unit.waterSavedLitersEstimated = Number(unit.waterSavedLitersEstimated) + Number(booking.waterSavedLiters);
      await this.droneUnitRepo.save(unit);
    }

    return saved;
  }

  // --- 3. Digital Soil Health Card & Fertilizer Recommendation Engine ---

  async generateSoilHealthCard(
    farmerId: string,
    dto: GenerateSoilHealthCardDto,
  ): Promise<SoilHealthCardRecord> {
    const soilCardNumber = `SOIL-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // --- SRDI (Soil Resource Development Institute) Algorithmic Dosage Matrix ---
    const crop = dto.targetCrop;
    const ph = Number(dto.phLevel);
    const n = Number(dto.nitrogenKgPerHa);
    const p = Number(dto.phosphorusPpm);
    const k = Number(dto.potassiumMeqPer100g);
    const om = Number(dto.organicMatterPct);
    const zn = dto.zincPpm !== undefined && dto.zincPpm !== null ? Number(dto.zincPpm) : 1.0;

    // 1. Urea calculation (kg/bigha, 1 bigha = 33 decimals)
    let ureaBase = 32.0; // standard boro
    if (crop === CropTargetNutrient.POTATO) ureaBase = 36.0;
    if (crop === CropTargetNutrient.HYBRID_MAIZE) ureaBase = 42.0;
    if (crop === CropTargetNutrient.MUSTARD) ureaBase = 24.0;
    if (crop === CropTargetNutrient.WINTER_VEGETABLES) ureaBase = 28.0;

    if (n < 130) ureaBase *= 1.15; // low nitrogen: +15%
    if (n > 250) ureaBase *= 0.85; // rich nitrogen: -15%
    if (om < 1.5) ureaBase *= 1.08; // poor organic matter: +8%

    // 2. TSP calculation (kg/bigha)
    let tsp = 18.0;
    if (crop === CropTargetNutrient.POTATO) tsp = 28.0;
    if (crop === CropTargetNutrient.HYBRID_MAIZE) tsp = 24.0;
    if (p < 10) tsp *= 1.35; // deficient phosphorus
    if (p > 25) tsp *= 0.7; // abundant phosphorus

    // 3. MOP (Potash) calculation (kg/bigha)
    let mop = 18.0;
    if (crop === CropTargetNutrient.POTATO) mop = 32.0; // potato is potassium-hungry
    if (crop === CropTargetNutrient.HYBRID_MAIZE) mop = 22.0;
    if (k < 0.15) mop *= 1.25;
    if (k > 0.3) mop *= 0.75;

    // 4. Gypsum (Sulfur) calculation (kg/bigha)
    let gypsum = 12.0;
    if (crop === CropTargetNutrient.MUSTARD) gypsum = 20.0; // oilseed sulfur requirement
    if (crop === CropTargetNutrient.ONION_GARLIC) gypsum = 16.0;

    // 5. Zinc Sulphate (kg/bigha)
    let zinc = 1.2;
    if (zn < 0.9) zinc = 2.0; // severe zinc deficiency prevention
    if (crop === CropTargetNutrient.BORO_RICE) zinc = Math.max(zinc, 1.5);

    // 6. Organic Vermicompost
    let compost = 150.0;
    if (om < 1.5) compost = 250.0;
    if (om < 1.0) compost = 350.0;

    // pH correction guidance
    let phAdvice: string | null = null;
    if (ph < 5.5) {
      phAdvice =
        'মাটি তীব্র অম্লীয় (Acidic soil, pH < 5.5)। গাছের সার গ্রহণের ক্ষমতা বাড়াতে জমি তৈরির ১৫ দিন আগে প্রতি বিঘায় ৪০ কেজি কৃষি ডলোমাইট চুন (Dolomite Lime) ভালোভাবে ছিটিয়ে দিন।';
    } else if (ph > 7.8) {
      phAdvice =
        'মাটি ক্ষারীয় (Alkaline soil, pH > 7.8)। অতিরিক্ত জৈব সার ও জিপসাম প্রয়োগ করে মাটির পিএইচ সমতায় আনুন।';
    }

    const applicationSchedule =
      crop === CropTargetNutrient.POTATO
        ? 'জমি তৈরিতে: সমস্ত টিএসপি, জিপসাম, জিংক, অর্ধেক পটাশ ও অর্ধেক ইউরিয়া। বাকি ইউরিয়া ও পটাশ রোপণের ৩০-৩৫ দিন পর মাটির ভেল তোলার সময় উপরিপ্রয়োগ।'
        : 'জমি তৈরিতে: সমস্ত টিএসপি, জিপসাম, জিংক ও ১/৩ ভাগ ইউরিয়া। চারা রোপণের ২০ দিন পর ১ম উপরিপ্রয়োগ (১/৩ ইউরিয়া) এবং কাইচ থোড় আসার ৫-৭ দিন আগে শেষ কিস্তি উপরিপ্রয়োগ।';

    const record = this.soilCardRepo.create({
      ...dto,
      farmerId,
      soilCardNumber,
      calculatedUreaKgPerBigha: Number(ureaBase.toFixed(1)),
      calculatedTspKgPerBigha: Number(tsp.toFixed(1)),
      calculatedMopKgPerBigha: Number(mop.toFixed(1)),
      calculatedGypsumKgPerBigha: Number(gypsum.toFixed(1)),
      calculatedZincKgPerBigha: Number(zinc.toFixed(1)),
      calculatedOrganicCompostKgPerBigha: Number(compost.toFixed(1)),
      fertilizerApplicationSchedule: applicationSchedule,
      phCorrectionAdvice: phAdvice,
    });

    return await this.soilCardRepo.save(record);
  }

  async getFarmerSoilCards(farmerId: string): Promise<SoilHealthCardRecord[]> {
    return await this.soilCardRepo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSoilCardById(id: string): Promise<SoilHealthCardRecord> {
    const card = await this.soilCardRepo.findOne({
      where: { id },
      relations: ['farmer'],
    });

    if (!card) {
      throw new NotFoundException('Soil Health Card record not found');
    }

    return card;
  }

  // --- Platform Analytics & Stats ---

  async getPrecisionStats(): Promise<{
    totalVerifiedInputs: number;
    totalCounterfeitReports: number;
    totalDroneUnits: number;
    totalAcresDroneSprayed: number;
    totalWaterSavedLiters: number;
    totalSoilCardsIssued: number;
  }> {
    const totalVerifiedInputs = await this.inputRepo.count();
    const totalCounterfeitReports = await this.reportRepo.count();
    const totalDroneUnits = await this.droneUnitRepo.count();
    const totalSoilCardsIssued = await this.soilCardRepo.count();

    const droneStats = await this.droneUnitRepo
      .createQueryBuilder('u')
      .select('SUM(u.totalAcresSprayed)', 'totalAcres')
      .addSelect('SUM(u.waterSavedLitersEstimated)', 'totalWater')
      .getRawOne();

    return {
      totalVerifiedInputs,
      totalCounterfeitReports,
      totalDroneUnits,
      totalAcresDroneSprayed: Number(Number(droneStats?.totalAcres || 0).toFixed(1)),
      totalWaterSavedLiters: Number(Number(droneStats?.totalWater || 0).toFixed(0)),
      totalSoilCardsIssued,
    };
  }

  // --- Initial Seed Providers ---

  private async seedBaselineInputs(): Promise<void> {
    const seeds: Partial<AgriInputRegistryItem>[] = [
      {
        barcodeOrQrCode: 'CHEM-SYN-VIRTAKO-40WG',
        batchNumber: 'B-2026-SYN01',
        brandName: 'Virtako 40WG (ভিরতাকো)',
        manufacturerName: 'Syngenta Bangladesh Ltd.',
        category: InputCategory.PESTICIDE,
        activeIngredients: 'Chlorantraniliprole 20% + Thiamethoxam 20% WDG',
        standardPurityPct: 99.6,
        daeRegistrationNo: 'DAE-AP-1428',
        manufactureDate: new Date('2026-01-10'),
        expiryDate: new Date('2028-01-09'),
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
        mrpPriceBdt: 450.0,
        standardDosageGuide: 'ধানের মাজরা ও বাদামি গাছফড়িং দমনে প্রতি ১০ লিটার পানিতে ১.৫ গ্রাম মিশিয়ে স্প্রে করুন।',
      },
      {
        barcodeOrQrCode: 'CHEM-SYN-AMISTARTOP-325',
        batchNumber: 'B-2026-SYN02',
        brandName: 'Amistar Top 325 SC (এমিটার টপ)',
        manufacturerName: 'Syngenta Bangladesh Ltd.',
        category: InputCategory.FUNGICIDE,
        activeIngredients: 'Azoxystrobin 200 g/L + Difenoconazole 125 g/L SC',
        standardPurityPct: 99.4,
        daeRegistrationNo: 'DAE-AP-2094',
        manufactureDate: new Date('2026-02-15'),
        expiryDate: new Date('2028-02-14'),
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
        mrpPriceBdt: 680.0,
        standardDosageGuide: 'ধানের ব্লাস্ট ও শীথ ব্লাইট দমনে প্রতি লিটার পানিতে ১ মিলি হারে স্প্রে করুন।',
      },
      {
        barcodeOrQrCode: 'FERT-BCIC-UREA-01',
        batchNumber: 'BCIC-2026-UREA-G',
        brandName: 'BCIC Granular Urea (দানাদার ইউরিয়া)',
        manufacturerName: 'Bangladesh Chemical Industries Corporation (BCIC)',
        category: InputCategory.FERTILIZER,
        activeIngredients: '46% Total Nitrogen (N)',
        standardPurityPct: 99.2,
        daeRegistrationNo: 'BCIC-GOV-REG-01',
        manufactureDate: new Date('2026-01-01'),
        expiryDate: new Date('2029-01-01'),
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
        mrpPriceBdt: 1350.0, // 50kg bag subsidized official price
        standardDosageGuide: 'মাটি পরীক্ষার নির্দেশিকা অনুযায়ী জমিতে ২-৩ কিস্তিতে উপরিপ্রয়োগ করুন।',
      },
      {
        barcodeOrQrCode: 'SEED-BADC-BRRI-28',
        batchNumber: 'BADC-F-2026-BR28',
        brandName: 'BADC Certified Seed (বিএডিসি বোরো বীজ ধান - ব্রি ২৮)',
        manufacturerName: 'Bangladesh Agricultural Development Corporation (BADC)',
        category: InputCategory.CERTIFIED_SEED,
        activeIngredients: '100% Certified Breeder Generation Paddy Seed (Germination > 90%)',
        standardPurityPct: 98.5,
        daeRegistrationNo: 'BADC-SEED-CERT-2026',
        manufactureDate: new Date('2026-03-01'),
        expiryDate: new Date('2027-03-01'),
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
        mrpPriceBdt: 380.0, // 10kg sealed packet
        standardDosageGuide: 'প্রতি বিঘা জমির জন্য ৩-৩.৫ কেজি বীজ বীজতলায় ফেলুন।',
      },
    ];

    const entities = this.inputRepo.create(seeds);
    await this.inputRepo.save(entities);
  }

  private async seedDefaultDroneUnits(): Promise<DroneSprayingUnit[]> {
    let pilot = await this.userRepo.findOne({ where: {} });
    if (!pilot) {
      return [];
    }

    const units: Partial<DroneSprayingUnit>[] = [
      {
        droneCode: 'DRN-BGR-T40-01',
        pilotId: pilot.id,
        pilotName: 'Engr. Tanvir Ahmed (Certified Agri Drone Pilot)',
        pilotPhone: '01719887766',
        pilotLicenseNo: 'CAAB-RPAS-2026-091',
        droneModel: 'DJI Agras T40 (40L Dual Atomization Spraying)',
        tankCapacityLiters: 40.0,
        serviceRatePerBigha: 180.0,
        baseDistrict: 'Bogura',
        baseUpazila: 'Shibganj',
        coverageRadiusKm: 35,
        totalAcresSprayed: 245.5,
        waterSavedLitersEstimated: 36800,
        isAvailable: true,
      },
      {
        droneCode: 'DRN-DNP-JOY16-02',
        pilotId: pilot.id,
        pilotName: 'Md. Kamrul Hasan (Precision Agronomist)',
        pilotPhone: '01822334455',
        pilotLicenseNo: 'CAAB-RPAS-2026-148',
        droneModel: 'Joyance JT16L Intelligent Drone',
        tankCapacityLiters: 16.0,
        serviceRatePerBigha: 160.0,
        baseDistrict: 'Dinajpur',
        baseUpazila: 'Birganj',
        coverageRadiusKm: 25,
        totalAcresSprayed: 110.0,
        waterSavedLitersEstimated: 16500,
        isAvailable: true,
      },
      {
        droneCode: 'DRN-JSR-T30-03',
        pilotId: pilot.id,
        pilotName: 'Ariful Islam (Agri-Aviation Specialist)',
        pilotPhone: '01911224488',
        pilotLicenseNo: 'CAAB-RPAS-2026-204',
        droneModel: 'DJI Agras T30 (30L Spherical Radar Spray)',
        tankCapacityLiters: 30.0,
        serviceRatePerBigha: 175.0,
        baseDistrict: 'Jashore',
        baseUpazila: 'Sharsha',
        coverageRadiusKm: 30,
        totalAcresSprayed: 180.0,
        waterSavedLitersEstimated: 27000,
        isAvailable: true,
      },
    ];

    const entities = this.droneUnitRepo.create(units);
    return await this.droneUnitRepo.save(entities);
  }
}
