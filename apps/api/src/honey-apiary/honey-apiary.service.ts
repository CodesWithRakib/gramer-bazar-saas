import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoneyHarvestLot } from './entities/honey-harvest-lot.entity.js';
import { ApiaryColonyBox } from './entities/apiary-colony-box.entity.js';
import { RoyalJellySuperfoodBatch } from './entities/royal-jelly-superfood-batch.entity.js';
import {
  HoneyFloralSource,
  HoneyHarvestType,
  PurityLabGrade,
  BeeSpecies,
  ApiaryBoxHealthStatus,
  SuperfoodProductType,
} from './enums/honey-apiary.enum.js';
import {
  CalculateHoneyPurityDto,
  CalculateApiaryMigrationYieldDto,
  CreateHoneyHarvestLotDto,
  RegisterApiaryBoxDto,
  UpdateApiaryBoxHealthDto,
  CreateRoyalJellyBatchDto,
} from './dto/honey-apiary.dto.js';

@Injectable()
export class HoneyApiaryService implements OnModuleInit {
  private readonly logger = new Logger(HoneyApiaryService.name);

  constructor(
    @InjectRepository(HoneyHarvestLot)
    private readonly lotRepo: Repository<HoneyHarvestLot>,
    @InjectRepository(ApiaryColonyBox)
    private readonly boxRepo: Repository<ApiaryColonyBox>,
    @InjectRepository(RoyalJellySuperfoodBatch)
    private readonly superfoodRepo: Repository<RoyalJellySuperfoodBatch>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  private async seedBaselineData() {
    const lotCount = await this.lotRepo.count();
    if (lotCount === 0) {
      const seedLots: Partial<HoneyHarvestLot>[] = [
        {
          lotNumber: 'HNY-SUN-KHL-01',
          beekeeperId: 'mouwal-satkhira-01',
          beekeeperName: 'করিম মৌয়াল দল (সুন্দরবন পশ্চিম রেঞ্জ)',
          beekeeperPhone: '01711998811',
          district: 'সাতক্ষীরা',
          harvestType: HoneyHarvestType.WILD_FOREST_MOUWAL_HARVEST,
          floralSource: HoneyFloralSource.SUNDARBANS_KHALISHA_WILD,
          beeSpecies: BeeSpecies.APIS_DORSATA,
          harvestDate: '2026-04-15',
          grossVolumeKg: 850,
          moisturePercentage: 17.8,
          c4SugarIsotopeRatioPermil: -26.8,
          hmfFreshnessMgPerKg: 12.0,
          purityGrade: PurityLabGrade.GRADE_A_RAW_UNPROCESSED,
          labCertificateNo: 'BCSIR-HNY-2026-901',
          forestDeptPermitNo: 'FD-SAT-WEST-8812',
          wholesalePricePerKgBdt: 1450,
          stockQuantityKg: 620,
          isForestCertifiedWild: true,
        },
        {
          lotNumber: 'HNY-TNG-MST-02',
          beekeeperId: 'beekeeper-tng-02',
          beekeeperName: 'সিরাজুল ইসলাম মৌ-খামার',
          beekeeperPhone: '01722334455',
          district: 'টাঙ্গাইল',
          harvestType: HoneyHarvestType.MIGRATORY_BOX_APIARY,
          floralSource: HoneyFloralSource.MUSTARD_BLOSSOM_CREAM,
          beeSpecies: BeeSpecies.APIS_MELLIFERA,
          harvestDate: '2026-01-20',
          grossVolumeKg: 2400,
          moisturePercentage: 18.2,
          c4SugarIsotopeRatioPermil: -25.9,
          hmfFreshnessMgPerKg: 14.5,
          purityGrade: PurityLabGrade.GRADE_A_RAW_UNPROCESSED,
          labCertificateNo: 'BSTI-TNG-2026-441',
          forestDeptPermitNo: null,
          wholesalePricePerKgBdt: 650,
          stockQuantityKg: 1800,
          isForestCertifiedWild: false,
        },
        {
          lotNumber: 'HNY-DIN-LTC-03',
          beekeeperId: 'beekeeper-din-03',
          beekeeperName: 'উত্তরবঙ্গ লিচু পুষ্প মৌচাষ সমিতি',
          beekeeperPhone: '01733445566',
          district: 'দিনাজপুর',
          harvestType: HoneyHarvestType.MIGRATORY_BOX_APIARY,
          floralSource: HoneyFloralSource.LITCHI_ORCHARD_BLOSSOM,
          beeSpecies: BeeSpecies.APIS_MELLIFERA,
          harvestDate: '2026-05-10',
          grossVolumeKg: 1200,
          moisturePercentage: 19.1,
          c4SugarIsotopeRatioPermil: -25.4,
          hmfFreshnessMgPerKg: 18.0,
          purityGrade: PurityLabGrade.GRADE_B_DOMESTIC_STANDARD,
          labCertificateNo: 'BSTI-DIN-2026-102',
          forestDeptPermitNo: null,
          wholesalePricePerKgBdt: 850,
          stockQuantityKg: 750,
          isForestCertifiedWild: false,
        },
        {
          lotNumber: 'HNY-SUN-GRN-04',
          beekeeperId: 'mouwal-bag-04',
          beekeeperName: 'শরণখোলা বুনো মৌয়াল কো-অপারেটিভ',
          beekeeperPhone: '01744556677',
          district: 'বাগেরহাট',
          harvestType: HoneyHarvestType.WILD_FOREST_MOUWAL_HARVEST,
          floralSource: HoneyFloralSource.SUNDARBANS_GORAN_GEWA,
          beeSpecies: BeeSpecies.APIS_DORSATA,
          harvestDate: '2026-04-28',
          grossVolumeKg: 620,
          moisturePercentage: 19.5,
          c4SugarIsotopeRatioPermil: -26.1,
          hmfFreshnessMgPerKg: 22.0,
          purityGrade: PurityLabGrade.GRADE_B_DOMESTIC_STANDARD,
          labCertificateNo: 'BCSIR-HNY-2026-782',
          forestDeptPermitNo: 'FD-BAGER-SHARAN-4109',
          wholesalePricePerKgBdt: 1150,
          stockQuantityKg: 410,
          isForestCertifiedWild: true,
        },
      ];

      for (const lot of seedLots) {
        await this.lotRepo.save(this.lotRepo.create(lot));
      }
      this.logger.log('Seeded 4 baseline Honey Harvest Lots.');
    }

    const boxCount = await this.boxRepo.count();
    if (boxCount === 0) {
      const seedBoxes: Partial<ApiaryColonyBox>[] = [
        {
          boxCode: 'BOX-MELL-TNG-101',
          beekeeperId: 'beekeeper-tng-02',
          beekeeperName: 'সিরাজুল ইসলাম মৌ-খামার',
          beeSpecies: BeeSpecies.APIS_MELLIFERA,
          currentDistrict: 'টাঙ্গাইল',
          currentUpazila: 'মির্জাপুর',
          gpsLatitude: 24.3120,
          gpsLongitude: 89.9850,
          activeFloralCrop: 'সরিষা ফুল ক্ষেত - ফতেহপুর',
          framesCount: 8,
          queenAgeMonths: 5,
          healthStatus: ApiaryBoxHealthStatus.HEALTHY_BROOD_ACTIVE,
          estimatedHoneyYieldKg: 16.5,
          lastInspectedAt: new Date().toISOString(),
          notes: 'রানী মৌমাছি সক্রিয় ডিম দিচ্ছে। ব্রুড চেম্বার রোগমুক্ত।',
        },
        {
          boxCode: 'BOX-MELL-TNG-102',
          beekeeperId: 'beekeeper-tng-02',
          beekeeperName: 'সিরাজুল ইসলাম মৌ-খামার',
          beeSpecies: BeeSpecies.APIS_MELLIFERA,
          currentDistrict: 'টাঙ্গাইল',
          currentUpazila: 'নাগরপুর',
          gpsLatitude: 24.0530,
          gpsLongitude: 89.8780,
          activeFloralCrop: 'সরিষা ফুল ক্ষেত - সলিমাবাদ',
          framesCount: 10,
          queenAgeMonths: 7,
          healthStatus: ApiaryBoxHealthStatus.HONEY_SUPER_FULL_READY_TO_EXTRACT,
          estimatedHoneyYieldKg: 19.0,
          lastInspectedAt: new Date().toISOString(),
          notes: 'হানি সুপার ক্যাপড ও সিল করা হয়েছে। আগামী ৩ দিনের মধ্যে নিষ্কাশন করতে হবে।',
        },
        {
          boxCode: 'BOX-MELL-DIN-201',
          beekeeperId: 'beekeeper-din-03',
          beekeeperName: 'উত্তরবঙ্গ লিচু পুষ্প মৌচাষ সমিতি',
          beeSpecies: BeeSpecies.APIS_MELLIFERA,
          currentDistrict: 'দিনাজপুর',
          currentUpazila: 'বোচাগঞ্জ',
          gpsLatitude: 25.8010,
          gpsLongitude: 88.4610,
          activeFloralCrop: 'বেদানা লিচু বাগান - মুশিদহাট',
          framesCount: 8,
          queenAgeMonths: 4,
          healthStatus: ApiaryBoxHealthStatus.HEALTHY_BROOD_ACTIVE,
          estimatedHoneyYieldKg: 14.0,
          lastInspectedAt: new Date().toISOString(),
          notes: 'লিচু মুকুলের প্রথম পুষ্পায়নে চমৎকার নেকটার সংগ্রহ চলছে।',
        },
        {
          boxCode: 'BOX-MELL-SRY-301',
          beekeeperId: 'beekeeper-sry-04',
          beekeeperName: 'পদ্মা তীরবর্তী কালোজিরা মৌ-পল্লী',
          beeSpecies: BeeSpecies.APIS_MELLIFERA,
          currentDistrict: 'শরীয়তপুর',
          currentUpazila: 'জাজিরা',
          gpsLatitude: 23.3510,
          gpsLongitude: 90.3120,
          activeFloralCrop: 'কালোজিরা ফসল মাঠ - নাওডোবা',
          framesCount: 8,
          queenAgeMonths: 6,
          healthStatus: ApiaryBoxHealthStatus.HEALTHY_BROOD_ACTIVE,
          estimatedHoneyYieldKg: 12.5,
          lastInspectedAt: new Date().toISOString(),
          notes: 'কালোজিরা নেকটার ঘন ও গাঢ়। প্রাকৃতিক ঔষধি গুণাগুণ সমৃদ্ধ।',
        },
      ];

      for (const box of seedBoxes) {
        await this.boxRepo.save(this.boxRepo.create(box));
      }
      this.logger.log('Seeded 4 baseline Apiary Colony Boxes.');
    }

    const superCount = await this.superfoodRepo.count();
    if (superCount === 0) {
      const seedSuperfoods: Partial<RoyalJellySuperfoodBatch>[] = [
        {
          batchNumber: 'RJ-SUPER-2026-01',
          productType: SuperfoodProductType.FRESH_FROZEN_ROYAL_JELLY,
          producerName: 'সুন্দরবন এপিয়ারি অ্যান্ড বায়োফার্মাসিউটিক্যালস',
          harvestLocation: 'সুন্দরবন পশ্চিম বন বিভাগ রেঞ্জ',
          weightGrams: 100,
          tenHdaPercentage: 1.9,
          storageTemperatureCelsius: -18.0,
          coldChainStatus: 'SUB_ZERO_DEEP_FROZEN_SECURE',
          priceBdt: 2800,
          availableStockCount: 25,
        },
        {
          batchNumber: 'POL-SUPER-2026-02',
          productType: SuperfoodProductType.RAW_BEE_POLLEN_GRANULES,
          producerName: 'টাঙ্গাইল মৌচাষী সমবায় ফেডারেশন',
          harvestLocation: 'মির্জাপুর সরিষা উপত্যকা',
          weightGrams: 250,
          tenHdaPercentage: 0.0,
          storageTemperatureCelsius: 4.0,
          coldChainStatus: 'CHILLED_HERMETIC_SEALED',
          priceBdt: 850,
          availableStockCount: 40,
        },
        {
          batchNumber: 'PROP-SUPER-2026-03',
          productType: SuperfoodProductType.BEE_PROPOLIS_RESIN,
          producerName: 'সুন্দরবন প্রাকৃতিক বায়ো-প্রোপোলিস ল্যাব',
          harvestLocation: 'শরণখোলা ও মংলা সুন্দরবন বর্ডার',
          weightGrams: 50,
          tenHdaPercentage: 0.0,
          storageTemperatureCelsius: 20.0,
          coldChainStatus: 'DARK_AMBER_VIAL_STORED',
          priceBdt: 1200,
          availableStockCount: 30,
        },
      ];

      for (const sf of seedSuperfoods) {
        await this.superfoodRepo.save(this.superfoodRepo.create(sf));
      }
      this.logger.log('Seeded 3 baseline Royal Jelly & Bee Superfood Batches.');
    }
  }

  // --- Overview Dashboard Statistics ---
  async getOverviewStats() {
    const lots = await this.lotRepo.find();
    const boxes = await this.boxRepo.find();
    const superfoods = await this.superfoodRepo.find();

    const totalHarvestedVolumeKg = lots.reduce((acc, l) => acc + Number(l.grossVolumeKg), 0);
    const totalForestWildHoneyKg = lots
      .filter((l) => l.harvestType === HoneyHarvestType.WILD_FOREST_MOUWAL_HARVEST)
      .reduce((acc, l) => acc + Number(l.grossVolumeKg), 0);

    const avgMoisture =
      lots.length > 0
        ? Number((lots.reduce((acc, l) => acc + Number(l.moisturePercentage), 0) / lots.length).toFixed(1))
        : 18.5;

    const rjBatches = superfoods.filter(
      (sf) => sf.productType === SuperfoodProductType.FRESH_FROZEN_ROYAL_JELLY,
    );
    const avg10Hda =
      rjBatches.length > 0
        ? Number((rjBatches.reduce((acc, sf) => acc + Number(sf.tenHdaPercentage), 0) / rjBatches.length).toFixed(2))
        : 1.8;

    const totalSuperfoodStockCount = superfoods.reduce((acc, sf) => acc + sf.availableStockCount, 0);

    return {
      activeHarvestLotsCount: lots.length,
      totalHarvestedVolumeKg,
      totalForestWildHoneyKg,
      averageMoisturePercentage: avgMoisture,
      activeApiaryBoxesCount: boxes.length,
      averageTenHdaPercentage: avg10Hda,
      totalSuperfoodStockCount,
    };
  }

  // --- Honey Purity & Adulteration Testing Engine ---
  calculateHoneyPurity(dto: CalculateHoneyPurityDto) {
    const moisture = dto.moisturePercentage;
    const c4Delta = dto.c4SugarIsotopeRatioPermil;
    const hmf = dto.hmfFreshnessMgPerKg;

    // Rules:
    // C4 Sugar δ13C threshold: Authentic honey is typically -25‰ to -28‰.
    // An isotope ratio > -23.5‰ indicates commercial C4 cane sugar or corn syrup (HFCS) adulteration.
    const isC4Adulterated = c4Delta > -23.5;

    // Moisture standards:
    // <= 18.5%: Export Grade A (zero yeast fermentation risk).
    // 18.6% - 20.0%: National Grade B standard.
    // > 20.0%: Substandard / High moisture (yeast fermentation & gas bubbling risk).
    const isFermentationRisk = moisture > 20.0;

    let purityGrade: PurityLabGrade;
    let bstiCompliance = true;
    let adulterationWarning: string | null = null;
    let recommendedRetailPriceBdt = 850;

    if (isC4Adulterated) {
      purityGrade = PurityLabGrade.ADULTERATED_HFCS_OR_C4_POSITIVE;
      bstiCompliance = false;
      adulterationWarning = `সতর্কতা: C4 কার্বন আইসোটোপ অনুপাত (${c4Delta}‰) প্রমাণ করে যে এতে কৃত্রিম কর্ন সিরাপ বা চিনি মিশ্রিত করা হয়েছে (স্বাভাবিক মান <-২৩.৫‰)।`;
      recommendedRetailPriceBdt = 0;
    } else if (isFermentationRisk) {
      purityGrade = PurityLabGrade.SUBSTANDARD_HIGH_MOISTURE;
      bstiCompliance = false;
      adulterationWarning = `সতর্কতা: আর্দ্রতা (${moisture}%) ২০% এর অধিক। প্রাকৃতিকভাবে ঈস্ট গাঁজন (Fermentation) ও গ্যাস তৈরি হওয়ার উচ্চ ঝুঁকি রয়েছে।`;
      recommendedRetailPriceBdt = 500;
    } else if (moisture <= 18.5 && hmf < 20.0) {
      purityGrade = PurityLabGrade.GRADE_A_RAW_UNPROCESSED;
      recommendedRetailPriceBdt = 1200;
    } else {
      purityGrade = PurityLabGrade.GRADE_B_DOMESTIC_STANDARD;
      recommendedRetailPriceBdt = 800;
    }

    return {
      moisturePercentage: moisture,
      c4SugarIsotopeRatioPermil: c4Delta,
      hmfFreshnessMgPerKg: hmf,
      purityGrade,
      bstiCompliance,
      adulterationWarning,
      isC4Adulterated,
      isFermentationRisk,
      recommendedRetailPriceBdt,
      purityScoreOutOf100: isC4Adulterated
        ? 20
        : isFermentationRisk
        ? 60
        : purityGrade === PurityLabGrade.GRADE_A_RAW_UNPROCESSED
        ? 98
        : 85,
      auditExplanation: isC4Adulterated
        ? 'পরীক্ষায় ভুট্টার মিষ্টি সিরাপ (HFCS) বা আখের চিনির সংযোজন শনাক্ত হয়েছে।'
        : isFermentationRisk
        ? 'পানি বা কাঁচা মধুর আধিক্যের কারণে আর্দ্রতা বেশি। মৃদু ডিহাইড্রেটর প্রসেসিং প্রয়োজন।'
        : '১০০% খাঁটি প্রাকৃতিক মৌচাক মধু। কোনো উত্তাপ বা ক্ষতিকর রাসায়নিক প্রক্রিয়া ব্যতীত সংরক্ষিত।',
    };
  }

  // --- Apiary Migration Yield & Cross-Pollination Engine ---
  calculateApiaryMigrationYield(dto: CalculateApiaryMigrationYieldDto) {
    const boxes = dto.beeBoxesCount;
    const days = dto.daysInBloom;
    const floralSource = dto.floralSource;

    // Yield rates per box per 30-day bloom cycle
    let yieldPerBoxCycleKg = 15.0;
    let wholesaleRateBdt = 650;
    let hostFarmerCropBoostPercent = 18; // Mustard & litchi cross-pollination boost

    switch (floralSource) {
      case HoneyFloralSource.SUNDARBANS_KHALISHA_WILD:
        yieldPerBoxCycleKg = 12.0;
        wholesaleRateBdt = 1450;
        hostFarmerCropBoostPercent = 0;
        break;
      case HoneyFloralSource.MUSTARD_BLOSSOM_CREAM:
        yieldPerBoxCycleKg = 18.0;
        wholesaleRateBdt = 650;
        hostFarmerCropBoostPercent = 22; // Excellent mustard oilseed pod filling
        break;
      case HoneyFloralSource.LITCHI_ORCHARD_BLOSSOM:
        yieldPerBoxCycleKg = 16.0;
        wholesaleRateBdt = 850;
        hostFarmerCropBoostPercent = 25; // Massive litchi fruit set increase
        break;
      case HoneyFloralSource.BLACK_CUMIN_KALOJEERA:
        yieldPerBoxCycleKg = 12.0;
        wholesaleRateBdt = 1100;
        hostFarmerCropBoostPercent = 15;
        break;
      default:
        yieldPerBoxCycleKg = 14.0;
        wholesaleRateBdt = 750;
        hostFarmerCropBoostPercent = 15;
    }

    const estimatedYieldKg = Number(((boxes * yieldPerBoxCycleKg * (days / 30))).toFixed(1));
    const estimatedGrossRevenueBdt = Number((estimatedYieldKg * wholesaleRateBdt).toFixed(0));
    const estimatedRelocationCostBdt = Number((boxes * 180 + 3500).toFixed(0)); // Pickup truck hire + box loading
    const netProfitBdt = estimatedGrossRevenueBdt - estimatedRelocationCostBdt;

    return {
      beeBoxesCount: boxes,
      floralSource,
      daysInBloom: days,
      estimatedYieldKg,
      wholesaleRatePerKgBdt: wholesaleRateBdt,
      estimatedGrossRevenueBdt,
      estimatedRelocationCostBdt,
      netProfitBdt,
      hostFarmerCropBoostPercent,
      pollinationEcosystemValueNote: `মৌমাছির প্রাকৃতিক পরাগায়নে স্থানীয় কৃষকের সরিষা/লিচু ফসলের ফলন প্রায় +${hostFarmerCropBoostPercent}% বৃদ্ধি পাবে।`,
    };
  }

  // --- Honey Harvest Lots CRUD ---
  async getAllLots() {
    return this.lotRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getLotById(id: string) {
    const lot = await this.lotRepo.findOne({ where: { id } });
    if (!lot) {
      throw new NotFoundException(`Honey harvest lot with ID ${id} not found.`);
    }
    return lot;
  }

  async createHarvestLot(beekeeperId: string, dto: CreateHoneyHarvestLotDto) {
    const purityCalc = this.calculateHoneyPurity({
      moisturePercentage: dto.moisturePercentage,
      c4SugarIsotopeRatioPermil: dto.c4SugarIsotopeRatioPermil,
      hmfFreshnessMgPerKg: dto.hmfFreshnessMgPerKg,
      floralSource: dto.floralSource,
    });

    const lotNumber = `HNY-${dto.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const lot = this.lotRepo.create({
      lotNumber,
      beekeeperId,
      beekeeperName: dto.beekeeperName,
      beekeeperPhone: dto.beekeeperPhone,
      district: dto.district,
      harvestType: dto.harvestType,
      floralSource: dto.floralSource,
      beeSpecies: dto.beeSpecies,
      harvestDate: dto.harvestDate,
      grossVolumeKg: dto.grossVolumeKg,
      moisturePercentage: dto.moisturePercentage,
      c4SugarIsotopeRatioPermil: dto.c4SugarIsotopeRatioPermil,
      hmfFreshnessMgPerKg: dto.hmfFreshnessMgPerKg,
      purityGrade: purityCalc.purityGrade,
      labCertificateNo: dto.labCertificateNo || null,
      forestDeptPermitNo: dto.forestDeptPermitNo || null,
      wholesalePricePerKgBdt: dto.wholesalePricePerKgBdt,
      stockQuantityKg: dto.grossVolumeKg,
      isForestCertifiedWild: dto.isForestCertifiedWild ?? false,
    });

    const saved = await this.lotRepo.save(lot);
    this.logger.log(`Created Honey Harvest Lot ${saved.lotNumber} (${saved.grossVolumeKg} kg)`);
    return saved;
  }

  // --- Apiary Colony Boxes CRUD ---
  async getAllApiaryBoxes() {
    return this.boxRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getApiaryBoxById(id: string) {
    const box = await this.boxRepo.findOne({ where: { id } });
    if (!box) {
      throw new NotFoundException(`Apiary colony box with ID ${id} not found.`);
    }
    return box;
  }

  async registerApiaryBox(beekeeperId: string, dto: RegisterApiaryBoxDto) {
    const box = this.boxRepo.create({
      boxCode: dto.boxCode,
      beekeeperId,
      beekeeperName: dto.beekeeperName,
      beeSpecies: dto.beeSpecies,
      currentDistrict: dto.currentDistrict,
      currentUpazila: dto.currentUpazila,
      gpsLatitude: dto.gpsLatitude,
      gpsLongitude: dto.gpsLongitude,
      activeFloralCrop: dto.activeFloralCrop,
      framesCount: dto.framesCount ?? 8,
      queenAgeMonths: dto.queenAgeMonths ?? 6,
      healthStatus: dto.healthStatus ?? ApiaryBoxHealthStatus.HEALTHY_BROOD_ACTIVE,
      estimatedHoneyYieldKg: dto.estimatedHoneyYieldKg ?? 15.0,
      lastInspectedAt: new Date().toISOString(),
      notes: dto.notes || null,
    });

    const saved = await this.boxRepo.save(box);
    this.logger.log(`Registered Apiary Colony Box ${saved.boxCode} in ${saved.currentDistrict}`);
    return saved;
  }

  async updateApiaryBoxHealth(id: string, dto: UpdateApiaryBoxHealthDto) {
    const box = await this.getApiaryBoxById(id);

    box.healthStatus = dto.healthStatus;
    if (dto.currentDistrict) box.currentDistrict = dto.currentDistrict;
    if (dto.currentUpazila) box.currentUpazila = dto.currentUpazila;
    if (dto.gpsLatitude !== undefined) box.gpsLatitude = dto.gpsLatitude;
    if (dto.gpsLongitude !== undefined) box.gpsLongitude = dto.gpsLongitude;
    if (dto.activeFloralCrop) box.activeFloralCrop = dto.activeFloralCrop;
    if (dto.estimatedHoneyYieldKg !== undefined) box.estimatedHoneyYieldKg = dto.estimatedHoneyYieldKg;
    if (dto.notes !== undefined) box.notes = dto.notes;

    box.lastInspectedAt = new Date().toISOString();
    return this.boxRepo.save(box);
  }

  // --- Royal Jelly & Bee Superfood Batches ---
  async getAllSuperfoodBatches() {
    return this.superfoodRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createSuperfoodBatch(dto: CreateRoyalJellyBatchDto) {
    const batchNumber = `RJ-BATCH-${Date.now().toString().slice(-6)}`;

    const batch = this.superfoodRepo.create({
      batchNumber,
      productType: dto.productType,
      producerName: dto.producerName,
      harvestLocation: dto.harvestLocation,
      weightGrams: dto.weightGrams,
      tenHdaPercentage: dto.tenHdaPercentage,
      storageTemperatureCelsius: dto.storageTemperatureCelsius ?? -18.0,
      coldChainStatus:
        dto.storageTemperatureCelsius && dto.storageTemperatureCelsius <= -15
          ? 'SUB_ZERO_DEEP_FROZEN_SECURE'
          : 'CHILLED_HERMETIC_SEALED',
      priceBdt: dto.priceBdt,
      availableStockCount: dto.availableStockCount,
    });

    const saved = await this.superfoodRepo.save(batch);
    this.logger.log(`Registered Superfood Batch ${saved.batchNumber} (${saved.productType})`);
    return saved;
  }
}
