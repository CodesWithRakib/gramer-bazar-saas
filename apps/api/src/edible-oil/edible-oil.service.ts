import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OilSeedType,
  OilExtractionMethod,
  GhaniWoodType,
  PressingBatchStatus,
  ArgemoneTestResult,
  AdulterationScreeningStatus,
  OilPurityGrade,
  OilPackagingType,
  OilLotStatus,
  OilRegion,
} from './enums/edible-oil.enum.js';
import { GhaniPressingBatch } from './entities/ghani-pressing-batch.entity.js';
import { OilPurityLabTest } from './entities/oil-purity-lab-test.entity.js';
import { ArtisanalOilLot } from './entities/artisanal-oil-lot.entity.js';
import {
  CalculateOilExtractionDto,
  EvaluateOilPurityDto,
  CreateGhaniPressingBatchDto,
  UpdateBatchExtractionDto,
  CreateOilPurityLabTestDto,
  CreateArtisanalOilLotDto,
  PurchaseOilLotDto,
} from './dto/edible-oil.dto.js';

export interface OilExtractionCalculationResult {
  seedType: OilSeedType;
  seedWeightKg: number;
  extractionMethod: OilExtractionMethod;
  yieldPct: number;
  expectedOilKg: number;
  expectedOilLiters: number;
  oilcakeWeightKg: number;
  oilcakeMarketValueBdt: number;
  isColdPressSafe: boolean;
  maxRecommendedTempCelsius: number;
  pungencyPreservationPct: number;
  processingAdvice: string;
}

export interface OilPurityEvaluationResult {
  seedType: OilSeedType;
  isAdulterated: boolean;
  isArgemoneContaminated: boolean;
  isAcidValueExceeded: boolean;
  isPeroxideExceeded: boolean;
  isOverheated: boolean;
  purityGrade: OilPurityGrade;
  bstiComplianceApproved: boolean;
  qualityScore: number;
  verdict: string;
  safetyNotes: string;
}

@Injectable()
export class EdibleOilService implements OnModuleInit {
  constructor(
    @InjectRepository(GhaniPressingBatch)
    private readonly batchRepo: Repository<GhaniPressingBatch>,
    @InjectRepository(OilPurityLabTest)
    private readonly labRepo: Repository<OilPurityLabTest>,
    @InjectRepository(ArtisanalOilLot)
    private readonly lotRepo: Repository<ArtisanalOilLot>,
  ) {}

  async onModuleInit() {
    await this.seedInitialEdibleOilData();
  }

  private async seedInitialEdibleOilData() {
    const count = await this.batchRepo.count();
    if (count > 0) return;

    // 1. Seed Ghani Batches
    const batch1 = this.batchRepo.create({
      batchNumber: 'GHANI-2026-TGL-001',
      millName: 'Delduar Heritage Wood Ghani Cooperative (দেলদুয়ার কাঠের ঘানি সমবায়)',
      contactPhone: '+8801711223344',
      region: OilRegion.TANGAIL_DELDUAR,
      seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
      seedVariety: 'Deshi Small Maghi Red (ছোট দেশি মাঘী সরিষা)',
      inputSeedWeightKg: 600,
      extractedOilLiters: 210,
      oilcakeWeightKg: 375,
      extractionYieldPct: 35.0,
      extractionMethod: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
      ghaniWoodType: GhaniWoodType.TAMARIND_WOOD,
      maxExtractionTempCelsius: 36.8,
      operatingRpm: 16.0,
      crushingHours: 7.5,
      status: PressingBatchStatus.COMPLETED_DISPATCHED,
      notes: 'Pressed in aged tamarind wood mortar; temperature monitored continuously below 38°C.',
    });

    const batch2 = this.batchRepo.create({
      batchNumber: 'GHANI-2026-MNK-002',
      millName: 'Singair Pure Agro Oil Mills (সিঙ্গাইর নিম কাঠের ঘানি)',
      contactPhone: '+8801722334455',
      region: OilRegion.MANIKGANJ_SINGAIR,
      seedType: OilSeedType.MUSTARD_BARI_14,
      seedVariety: 'BARI Sarisha-14 Golden Seed (বারি সরিষা-১৪)',
      inputSeedWeightKg: 800,
      extractedOilLiters: 295,
      oilcakeWeightKg: 490,
      extractionYieldPct: 36.8,
      extractionMethod: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
      ghaniWoodType: GhaniWoodType.NEEM_WOOD,
      maxExtractionTempCelsius: 37.2,
      operatingRpm: 18.0,
      crushingHours: 9.0,
      status: PressingBatchStatus.DECANTING_SETTLING,
      notes: 'Neem-wood ghani gives natural antimicrobial preservation; resting in stainless settling vat.',
    });

    const batch3 = this.batchRepo.create({
      batchNumber: 'GHANI-2026-JSR-003',
      millName: 'Jhikargacha Black Til Artisanal Guild (ঝিকরগাছা কালো তিল সমবায়)',
      contactPhone: '+8801733445566',
      region: OilRegion.JASHORE_JHIKARGACHA,
      seedType: OilSeedType.SESAME_BLACK,
      seedVariety: 'Indigenous Black Til (দেশি কালো তিল)',
      inputSeedWeightKg: 400,
      extractedOilLiters: 178,
      oilcakeWeightKg: 215,
      extractionYieldPct: 44.5,
      extractionMethod: OilExtractionMethod.WOOD_GHANI_COLD_PRESS,
      ghaniWoodType: GhaniWoodType.MAHOGANY_WOOD,
      maxExtractionTempCelsius: 35.4,
      operatingRpm: 15.0,
      crushingHours: 6.0,
      status: PressingBatchStatus.TESTING_AND_BOTTLING,
      notes: 'Cold-pressed black sesame oil; high lignan and sesamin retention.',
    });

    await this.batchRepo.save([batch1, batch2, batch3]);

    // 2. Seed BSTI Chemical Purity Lab Tests
    const labTest1 = this.labRepo.create({
      testReportNumber: 'BSTI/OIL-2026-TGL-991',
      batchId: batch1.id,
      seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
      sampleName: 'Delduar Tamarind Wood Ghani Mustard Oil Composite Sample',
      testingLabName: 'BSTI National Chemical Testing Laboratory, Dhaka',
      freeFattyAcidPct: 0.78,
      peroxideValueMeq: 2.8,
      allylIsothiocyanatePct: 0.42,
      argemoneOilStatus: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
      adulterationStatus: AdulterationScreeningStatus.PURE_UNADULTERATED,
      refractiveIndex: 1.466,
      purityGrade: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
      isBstiApproved: true,
      authenticitySealNumber: 'GBZ-BSTI-GHANI-99120',
      leadChemistName: 'Dr. Shahabuddin Ahmed, Lead Analytical Chemist',
    });

    const labTest2 = this.labRepo.create({
      testReportNumber: 'BSTI/OIL-2026-MNK-402',
      batchId: batch2.id,
      seedType: OilSeedType.MUSTARD_BARI_14,
      sampleName: 'Singair Neem Ghani BARI-14 Golden Mustard Oil',
      testingLabName: 'Food Safety & Quality Assurance Lab, BARI Gazipur',
      freeFattyAcidPct: 0.92,
      peroxideValueMeq: 3.5,
      allylIsothiocyanatePct: 0.36,
      argemoneOilStatus: ArgemoneTestResult.NEGATIVE_PASS_SAFE,
      adulterationStatus: AdulterationScreeningStatus.PURE_UNADULTERATED,
      refractiveIndex: 1.467,
      purityGrade: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
      isBstiApproved: true,
      authenticitySealNumber: 'GBZ-BSTI-GHANI-40288',
      leadChemistName: 'Professor Farida Yasmin, Head of Lipid Chromatography',
    });

    const labTestSeized = this.labRepo.create({
      testReportNumber: 'BSTI/OIL-2026-SEIZED-108',
      seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
      sampleName: 'Marketplace Intercepted Roadside Expeller Mustard Oil Sample',
      testingLabName: 'Directorate of National Consumer Rights Protection (DNCRP) Mobile Lab',
      freeFattyAcidPct: 3.40,
      peroxideValueMeq: 18.5,
      allylIsothiocyanatePct: 0.12,
      argemoneOilStatus: ArgemoneTestResult.POSITIVE_CONTAMINATED_SEIZED,
      adulterationStatus: AdulterationScreeningStatus.ADULTERATED_TOXIC_ARGEMONE,
      refractiveIndex: 1.478,
      purityGrade: OilPurityGrade.REJECTED_ADULTERATED,
      isBstiApproved: false,
      authenticitySealNumber: undefined,
      leadChemistName: 'Enforcement Officer Md. Mahbubur Rahman',
    });

    await this.labRepo.save([labTest1, labTest2, labTestSeized]);

    // 3. Seed Artisanal Oil Forward Lots
    const lot1 = this.lotRepo.create({
      lotCode: 'OIL-LOT-2026-TGL-MAGHI',
      batchId: batch1.id,
      labTestId: labTest1.id,
      lotTitle: 'Pure Wood-Ghani Cold-Pressed Maghi Mustard Oil (দেলদুয়ার খাঁটি ঘানি সরিষার তেল)',
      millProducerName: 'Delduar Heritage Wood Ghani Cooperative',
      originRegion: OilRegion.TANGAIL_DELDUAR,
      seedType: OilSeedType.MUSTARD_MAGHI_DESHI,
      packagingType: OilPackagingType.AMBER_GLASS_BOTTLE_1L,
      totalVolumeLiters: 200,
      availableVolumeLiters: 175,
      pricePerLiterBdt: 420,
      totalValueBdt: 84000,
      minimumOrderLiters: 5,
      pungencyRating: 5,
      purityGrade: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
      isBstiCertified: true,
      isColdPressedCertified: true,
      status: OilLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot2 = this.lotRepo.create({
      lotCode: 'OIL-LOT-2026-MNK-BARI14',
      batchId: batch2.id,
      labTestId: labTest2.id,
      lotTitle: 'Artisanal Neem-Ghani BARI-14 Golden Mustard Oil (সিঙ্গাইর গোল্ডেন সরিষার তেল)',
      millProducerName: 'Singair Pure Agro Oil Mills',
      originRegion: OilRegion.MANIKGANJ_SINGAIR,
      seedType: OilSeedType.MUSTARD_BARI_14,
      packagingType: OilPackagingType.FOOD_GRADE_CAN_5L,
      totalVolumeLiters: 280,
      availableVolumeLiters: 280,
      pricePerLiterBdt: 390,
      totalValueBdt: 109200,
      minimumOrderLiters: 10,
      pungencyRating: 4,
      purityGrade: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
      isBstiCertified: true,
      isColdPressedCertified: true,
      status: OilLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot3 = this.lotRepo.create({
      lotCode: 'OIL-LOT-2026-JSR-TIL',
      batchId: batch3.id,
      lotTitle: 'Cold-Pressed Virgin Black Sesame Oil (ঝিকরগাছা ঘানি ভাঙ্গা কালো তিলের তেল)',
      millProducerName: 'Jhikargacha Black Til Artisanal Guild',
      originRegion: OilRegion.JASHORE_JHIKARGACHA,
      seedType: OilSeedType.SESAME_BLACK,
      packagingType: OilPackagingType.AMBER_GLASS_BOTTLE_500ML,
      totalVolumeLiters: 150,
      availableVolumeLiters: 140,
      pricePerLiterBdt: 680,
      totalValueBdt: 102000,
      minimumOrderLiters: 2,
      pungencyRating: 2,
      purityGrade: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
      isBstiCertified: true,
      isColdPressedCertified: true,
      status: OilLotStatus.AVAILABLE_FOR_SALE,
    });

    await this.lotRepo.save([lot1, lot2, lot3]);
  }

  // Calculators
  calculateOilExtraction(dto: CalculateOilExtractionDto): OilExtractionCalculationResult {
    let yieldPct = 35.0; // default for Maghi Deshi Mustard
    let maxRecommendedTemp = 38.0; // °C for cold-press

    switch (dto.seedType) {
      case OilSeedType.MUSTARD_MAGHI_DESHI:
        yieldPct = 35.0;
        break;
      case OilSeedType.MUSTARD_BARI_14:
        yieldPct = 36.5;
        break;
      case OilSeedType.MUSTARD_TORI_7:
        yieldPct = 34.0;
        break;
      case OilSeedType.SESAME_BLACK:
        yieldPct = 44.0;
        break;
      case OilSeedType.SESAME_WHITE:
        yieldPct = 46.0;
        break;
      case OilSeedType.SUNFLOWER_SEED:
        yieldPct = 40.0;
        break;
      case OilSeedType.PEANUT_GROUNDNUT:
        yieldPct = 42.0;
        break;
    }

    let isColdPressSafe = true;
    let pungencyPreservationPct = 100;

    if (dto.extractionMethod === OilExtractionMethod.STEEL_EXPELLER_MECHANICAL) {
      yieldPct += 2.5; // slight mechanical boost
      maxRecommendedTemp = 95.0;
      isColdPressSafe = false;
      pungencyPreservationPct = 45; // thermal destruction of allyl isothiocyanate
    } else if (dto.extractionMethod === OilExtractionMethod.HYDRAULIC_COLD_PRESS) {
      yieldPct += 1.0;
      maxRecommendedTemp = 40.0;
      pungencyPreservationPct = 95;
    }

    const expectedOilKg = Number(((dto.seedWeightKg * yieldPct) / 100).toFixed(2));
    // Mustard/sesame oil density approx 0.915 kg/liter
    const expectedOilLiters = Number((expectedOilKg / 0.915).toFixed(2));
    // Oilcake is remaining seed mass minus ~2% moisture friction loss
    const oilcakeWeightKg = Number(
      (dto.seedWeightKg * (1 - yieldPct / 100 - 0.02)).toFixed(2),
    );
    // High-protein organic oilcake (খৈল) valued at ৳50/kg for cattle feed & organic nitrogen fertilizer
    const oilcakeMarketValueBdt = Number((oilcakeWeightKg * 50).toFixed(2));

    let processingAdvice = '';
    if (isColdPressSafe) {
      processingAdvice =
        'Optimal Artisanal Cold Pressing: Slow rotation (<=18 RPM) keeps oil temperatures below 40°C, fully preserving natural allyl isothiocyanate pungency (ঝাঁঝ), polyphenols, and vitamin E.';
    } else {
      processingAdvice =
        'High-Friction Expeller Notice: High extraction heat (>85°C) risks thermal degradation of delicate aroma compounds and volatile pungent glucosinolates.';
    }

    return {
      seedType: dto.seedType,
      seedWeightKg: dto.seedWeightKg,
      extractionMethod: dto.extractionMethod,
      yieldPct: Number(yieldPct.toFixed(1)),
      expectedOilKg,
      expectedOilLiters,
      oilcakeWeightKg,
      oilcakeMarketValueBdt,
      isColdPressSafe,
      maxRecommendedTempCelsius: maxRecommendedTemp,
      pungencyPreservationPct,
      processingAdvice,
    };
  }

  evaluateOilPurity(dto: EvaluateOilPurityDto): OilPurityEvaluationResult {
    const isArgemoneContaminated =
      dto.argemoneOilStatus === ArgemoneTestResult.POSITIVE_CONTAMINATED_SEIZED;
    const isAdulterated =
      dto.adulterationStatus !== AdulterationScreeningStatus.PURE_UNADULTERATED ||
      isArgemoneContaminated;

    const isAcidValueExceeded = dto.freeFattyAcidPct > 1.50; // BSTI standard <= 1.50%
    const isPeroxideExceeded = dto.peroxideValueMeq > 10.0; // POV <= 10.0 meq O2/kg
    const isOverheated = dto.maxExtractionTempCelsius > 40.0;

    let purityGrade: OilPurityGrade = OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED;
    let bstiComplianceApproved = true;
    let verdict = 'VERIFIED PURE EXTRA VIRGIN COLD-PRESSED OIL';
    let safetyNotes = 'Complies with BSTI Free Fatty Acid (FFA <= 1.5%) and Peroxide Value limits.';
    let qualityScore = 98;

    if (isArgemoneContaminated) {
      purityGrade = OilPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 0;
      verdict = 'HAZARDOUS CONTAMINATION DETECTED: Positive for Toxic Argemone Oil';
      safetyNotes =
        'SEIZURE MANDATE: Argemone mexicana contains toxic sanguinarine alkaloids causing epidemic dropsy. Mandatory seizure under Bangladesh Food Safety Act 2013.';
    } else if (isAdulterated) {
      purityGrade = OilPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 15;
      verdict = `ADULTERATION DETECTED: ${dto.adulterationStatus.replace(/_/g, ' ')}`;
      safetyNotes = 'Batch fails authenticity testing; contains non-declared blending agents.';
    } else if (isAcidValueExceeded || isPeroxideExceeded) {
      bstiComplianceApproved = false;
      if (dto.freeFattyAcidPct <= 2.5 && dto.peroxideValueMeq <= 15.0) {
        purityGrade = OilPurityGrade.GRADE_A_STANDARD_VIRGIN;
        qualityScore = 75;
        verdict = 'STANDARD DOMESTIC VIRGIN GRADE (Moderate Acidity)';
        safetyNotes = 'Free Fatty Acid or Peroxide values slightly elevated; suitable for general cooking.';
      } else {
        purityGrade = OilPurityGrade.COMMERCIAL_REFINED;
        qualityScore = 50;
        verdict = 'SUBSTANDARD HIGH-ACIDITY OIL (Requires Refining)';
        safetyNotes = 'Excessive Free Fatty Acid (>2.5%) indicates hydrolytic or oxidative rancidity.';
      }
    } else if (isOverheated) {
      purityGrade = OilPurityGrade.GRADE_A_STANDARD_VIRGIN;
      qualityScore = 82;
      verdict = 'COMMERCIAL THERMALLY-EXPRESSED OIL (Not Extra Virgin)';
      safetyNotes = 'Crushing temperature exceeded 40°C threshold; cannot be certified as true cold-press.';
    }

    if (dto.allylIsothiocyanatePct < 0.25 && purityGrade === OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED) {
      qualityScore -= 10;
      safetyNotes += ' Pungency marker (allyl isothiocyanate) is mild.';
    }

    return {
      seedType: dto.seedType,
      isAdulterated,
      isArgemoneContaminated,
      isAcidValueExceeded,
      isPeroxideExceeded,
      isOverheated,
      purityGrade,
      bstiComplianceApproved,
      qualityScore,
      verdict,
      safetyNotes,
    };
  }

  // Ghani Pressing Batches
  async getGhaniBatches(filter?: {
    seedType?: OilSeedType;
    region?: OilRegion;
    status?: PressingBatchStatus;
  }): Promise<GhaniPressingBatch[]> {
    const qb = this.batchRepo.createQueryBuilder('batch');
    if (filter?.seedType) {
      qb.andWhere('batch.seedType = :seedType', { seedType: filter.seedType });
    }
    if (filter?.region) {
      qb.andWhere('batch.region = :region', { region: filter.region });
    }
    if (filter?.status) {
      qb.andWhere('batch.status = :status', { status: filter.status });
    }
    qb.orderBy('batch.createdAt', 'DESC');
    return qb.getMany();
  }

  async getGhaniBatchById(id: string): Promise<GhaniPressingBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Ghani pressing batch with ID ${id} not found.`);
    }
    return batch;
  }

  async createGhaniBatch(dto: CreateGhaniPressingBatchDto): Promise<GhaniPressingBatch> {
    const count = await this.batchRepo.count();
    const batchNumber = `GHANI-${new Date().getFullYear()}-${dto.region.substring(0, 3)}-${String(
      count + 1,
    ).padStart(3, '0')}`;

    // Compute initial mass balance estimates
    const calc = this.calculateOilExtraction({
      seedType: dto.seedType,
      seedWeightKg: dto.inputSeedWeightKg,
      extractionMethod: dto.extractionMethod,
    });

    const batch = this.batchRepo.create({
      batchNumber,
      millName: dto.millName,
      contactPhone: dto.contactPhone,
      region: dto.region,
      seedType: dto.seedType,
      seedVariety: dto.seedVariety,
      inputSeedWeightKg: dto.inputSeedWeightKg,
      extractedOilLiters: calc.expectedOilLiters,
      oilcakeWeightKg: calc.oilcakeWeightKg,
      extractionYieldPct: calc.yieldPct,
      extractionMethod: dto.extractionMethod,
      ghaniWoodType: dto.ghaniWoodType,
      maxExtractionTempCelsius: dto.maxExtractionTempCelsius,
      operatingRpm: dto.operatingRpm,
      crushingHours: dto.crushingHours,
      status: PressingBatchStatus.CRUSHING_IN_PROGRESS,
      notes: dto.notes,
    });

    return this.batchRepo.save(batch);
  }

  async updateBatchExtraction(
    id: string,
    dto: UpdateBatchExtractionDto,
  ): Promise<GhaniPressingBatch> {
    const batch = await this.getGhaniBatchById(id);

    batch.maxExtractionTempCelsius = dto.maxExtractionTempCelsius;
    batch.extractedOilLiters = dto.extractedOilLiters;
    batch.oilcakeWeightKg = dto.oilcakeWeightKg;

    if (batch.inputSeedWeightKg > 0) {
      const oilKg = dto.extractedOilLiters * 0.915;
      batch.extractionYieldPct = Number(
        ((oilKg / batch.inputSeedWeightKg) * 100).toFixed(1),
      );
    }

    if (dto.status) {
      batch.status = dto.status;
    }
    if (dto.notes) {
      batch.notes = dto.notes;
    }

    return this.batchRepo.save(batch);
  }

  // Lab Tests
  async getOilLabTests(filter?: {
    seedType?: OilSeedType;
    purityGrade?: OilPurityGrade;
  }): Promise<OilPurityLabTest[]> {
    const qb = this.labRepo.createQueryBuilder('test');
    if (filter?.seedType) {
      qb.andWhere('test.seedType = :seedType', { seedType: filter.seedType });
    }
    if (filter?.purityGrade) {
      qb.andWhere('test.purityGrade = :purityGrade', { purityGrade: filter.purityGrade });
    }
    qb.orderBy('test.createdAt', 'DESC');
    return qb.getMany();
  }

  async getOilLabTestById(id: string): Promise<OilPurityLabTest> {
    const test = await this.labRepo.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Oil lab test with ID ${id} not found.`);
    }
    return test;
  }

  async createOilLabTest(dto: CreateOilPurityLabTestDto): Promise<OilPurityLabTest> {
    const count = await this.labRepo.count();
    const testReportNumber = `BSTI/OIL-${new Date().getFullYear()}-${String(count + 1).padStart(
      4,
      '0',
    )}`;

    const evalResult = this.evaluateOilPurity({
      seedType: dto.seedType,
      freeFattyAcidPct: dto.freeFattyAcidPct,
      peroxideValueMeq: dto.peroxideValueMeq,
      allylIsothiocyanatePct: dto.allylIsothiocyanatePct,
      argemoneOilStatus: dto.argemoneOilStatus,
      adulterationStatus: dto.adulterationStatus,
      maxExtractionTempCelsius: 38.0, // standard certified baseline
    });

    const isBstiApproved = evalResult.bstiComplianceApproved;
    const authenticitySealNumber = isBstiApproved
      ? `GBZ-BSTI-GHANI-${Math.floor(10000 + Math.random() * 90000)}`
      : undefined;

    const test = this.labRepo.create({
      testReportNumber,
      batchId: dto.batchId,
      seedType: dto.seedType,
      sampleName: dto.sampleName,
      testingLabName: dto.testingLabName,
      freeFattyAcidPct: dto.freeFattyAcidPct,
      peroxideValueMeq: dto.peroxideValueMeq,
      allylIsothiocyanatePct: dto.allylIsothiocyanatePct,
      argemoneOilStatus: dto.argemoneOilStatus,
      adulterationStatus: dto.adulterationStatus,
      refractiveIndex: dto.refractiveIndex,
      purityGrade: evalResult.purityGrade,
      isBstiApproved,
      authenticitySealNumber,
      leadChemistName: dto.leadChemistName,
    });

    return this.labRepo.save(test);
  }

  // Artisanal Oil Forward Lots
  async getArtisanalOilLots(filter?: {
    seedType?: OilSeedType;
    region?: OilRegion;
    status?: OilLotStatus;
  }): Promise<ArtisanalOilLot[]> {
    const qb = this.lotRepo.createQueryBuilder('lot');
    if (filter?.seedType) {
      qb.andWhere('lot.seedType = :seedType', { seedType: filter.seedType });
    }
    if (filter?.region) {
      qb.andWhere('lot.originRegion = :region', { region: filter.region });
    }
    if (filter?.status) {
      qb.andWhere('lot.status = :status', { status: filter.status });
    }
    qb.orderBy('lot.createdAt', 'DESC');
    return qb.getMany();
  }

  async getArtisanalOilLotById(id: string): Promise<ArtisanalOilLot> {
    const lot = await this.lotRepo.findOne({ where: { id } });
    if (!lot) {
      throw new NotFoundException(`Artisanal oil lot with ID ${id} not found.`);
    }
    return lot;
  }

  async createArtisanalOilLot(dto: CreateArtisanalOilLotDto): Promise<ArtisanalOilLot> {
    const count = await this.lotRepo.count();
    const lotCode = `OIL-LOT-${new Date().getFullYear()}-${dto.originRegion.substring(
      0,
      3,
    )}-${String(count + 1).padStart(3, '0')}`;

    const totalValueBdt = Number((dto.totalVolumeLiters * dto.pricePerLiterBdt).toFixed(2));

    const lot = this.lotRepo.create({
      lotCode,
      batchId: dto.batchId,
      labTestId: dto.labTestId,
      lotTitle: dto.lotTitle,
      millProducerName: dto.millProducerName,
      originRegion: dto.originRegion,
      seedType: dto.seedType,
      packagingType: dto.packagingType,
      totalVolumeLiters: dto.totalVolumeLiters,
      availableVolumeLiters: dto.totalVolumeLiters,
      pricePerLiterBdt: dto.pricePerLiterBdt,
      totalValueBdt,
      minimumOrderLiters: dto.minimumOrderLiters,
      pungencyRating: dto.pungencyRating,
      purityGrade: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
      isBstiCertified: dto.isBstiCertified ?? true,
      isColdPressedCertified: dto.isColdPressedCertified ?? true,
      status: OilLotStatus.AVAILABLE_FOR_SALE,
    });

    return this.lotRepo.save(lot);
  }

  async purchaseOilLot(id: string, dto: PurchaseOilLotDto): Promise<ArtisanalOilLot> {
    const lot = await this.getArtisanalOilLotById(id);

    if (lot.status !== OilLotStatus.AVAILABLE_FOR_SALE) {
      throw new BadRequestException('This artisanal oil lot is no longer available for purchase.');
    }

    if (dto.orderQuantityLiters < lot.minimumOrderLiters) {
      throw new BadRequestException(
        `Minimum order quantity for this lot is ${lot.minimumOrderLiters} liters.`,
      );
    }

    if (dto.orderQuantityLiters > lot.availableVolumeLiters) {
      throw new BadRequestException(
        `Requested ${dto.orderQuantityLiters} L exceeds available inventory of ${lot.availableVolumeLiters} L.`,
      );
    }

    lot.availableVolumeLiters = Number(
      (lot.availableVolumeLiters - dto.orderQuantityLiters).toFixed(2),
    );

    if (lot.availableVolumeLiters <= 0) {
      lot.status = OilLotStatus.SOLD_OUT;
    }

    return this.lotRepo.save(lot);
  }
}
