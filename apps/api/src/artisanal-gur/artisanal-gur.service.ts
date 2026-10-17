import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatePalmTappingBatch } from './entities/date-palm-tapping-batch.entity.js';
import { GurPurityLabTest } from './entities/gur-purity-lab-test.entity.js';
import { ArtisanalGurLot } from './entities/artisanal-gur-lot.entity.js';
import {
  GurType,
  GurRegion,
  SapCollectionShift,
  BoilingPanType,
  HydrosulfiteTestResult,
  SugarSyrupAdulterationStatus,
  GurPurityGrade,
  GurPackagingType,
  GurLotStatus,
} from './enums/artisanal-gur.enum.js';
import {
  CalculateGurExtractionDto,
  EvaluateGurPurityDto,
  CreateDatePalmTappingBatchDto,
  UpdateBatchBoilingDto,
  CreateGurPurityLabTestDto,
  CreateArtisanalGurLotDto,
  PurchaseGurLotDto,
} from './dto/artisanal-gur.dto.js';

export interface GurExtractionCalculationResult {
  gurType: GurType;
  rawSapVolumeLiters: number;
  sapBrixDegrees: number;
  sapCollectionShift: SapCollectionShift;
  expectedGurWeightKg: number;
  sapToGurRatio: number;
  recommendedStrikeTempCelsius: number;
  aromaPreservationScore: number;
  sweetnessBrixProjected: number;
  byproductChitaMolassesKg: number;
  advisoryMessage: string;
}

export interface GurPurityEvaluationResult {
  gurType: GurType;
  isHydrosulfiteContaminated: boolean;
  isSugarAdulterated: boolean;
  isColoringDetected: boolean;
  isOverheated: boolean;
  purityGrade: GurPurityGrade;
  bstiComplianceApproved: boolean;
  qualityScore: number;
  verdict: string;
  safetyNotes: string;
}

@Injectable()
export class ArtisanalGurService implements OnModuleInit {
  constructor(
    @InjectRepository(DatePalmTappingBatch)
    private readonly batchRepo: Repository<DatePalmTappingBatch>,
    @InjectRepository(GurPurityLabTest)
    private readonly labTestRepo: Repository<GurPurityLabTest>,
    @InjectRepository(ArtisanalGurLot)
    private readonly lotRepo: Repository<ArtisanalGurLot>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  private async seedBaselineData() {
    const existingCount = await this.batchRepo.count();
    if (existingCount > 0) return;

    // 1. Seed Tapping & Boiling Batches
    const batch1 = this.batchRepo.create({
      batchNumber: 'GUR-2026-JSR-001',
      gachhiCoopName: 'Jhikargacha Traditional Gachhi Cooperative (ঝিকরগাছা গাছি সমবায়)',
      contactPhone: '+8801711229988',
      region: GurRegion.JASHORE_JHIKARGACHA,
      gurType: GurType.DATE_PALM_NOLEN_JHOLA,
      sapCollectionShift: SapCollectionShift.DAWN_JIRAN_PREMIUM,
      treesTappedCount: 85,
      rawSapVolumeLiters: 450,
      sapBrixDegrees: 13.8,
      strikeBoilingTempCelsius: 115.5,
      panType: BoilingPanType.TRADITIONAL_IRON_KARAI,
      producedGurWeightKg: 53.0,
      sapToGurRatio: 8.49,
      status: 'BOILING_COMPLETED',
      notes: 'Dawn Jiran sap collected before sunrise; boiled gently with date leaves fuel preserving authentic aroma.',
    });

    const batch2 = this.batchRepo.create({
      batchNumber: 'GUR-2026-CHU-002',
      gachhiCoopName: 'Damurhuda Heritage Date Palm Guild (দামুড়হুদা পাটালি কারিগর সমবায়)',
      contactPhone: '+8801722338877',
      region: GurRegion.CHUADANGA_DAMURHUDA,
      gurType: GurType.DATE_PALM_PATALI_SOLID,
      sapCollectionShift: SapCollectionShift.DAWN_JIRAN_PREMIUM,
      treesTappedCount: 120,
      rawSapVolumeLiters: 620,
      sapBrixDegrees: 13.2,
      strikeBoilingTempCelsius: 119.2,
      panType: BoilingPanType.TRADITIONAL_IRON_KARAI,
      producedGurWeightKg: 75.0,
      sapToGurRatio: 8.27,
      status: 'MOLD_CRYSTALLIZATION',
      notes: 'Stirred with wooden paddle at 119°C for micro-crystallization; set in traditional earthenware frame.',
    });

    const batch3 = this.batchRepo.create({
      batchNumber: 'GUR-2026-KUS-003',
      gachhiCoopName: 'Kumarkhali Organic Sugarcane Growers Guild (কুমারখালী আখচাষি সমবায়)',
      contactPhone: '+8801733447766',
      region: GurRegion.KUSHTIA_KUMARKHALI,
      gurType: GurType.SUGARCANE_ORGANIC_SOLID,
      sapCollectionShift: SapCollectionShift.EVENING_SWEET_INTAKE,
      treesTappedCount: 0,
      rawSapVolumeLiters: 800,
      sapBrixDegrees: 18.5,
      strikeBoilingTempCelsius: 118.0,
      panType: BoilingPanType.STAINLESS_STEEL_PAN,
      producedGurWeightKg: 115.0,
      sapToGurRatio: 6.96,
      status: 'BOILING_COMPLETED',
      notes: 'Freshly crushed sugarcane juice; natural plant-mucilage clarification without synthetic chemicals.',
    });

    await this.batchRepo.save([batch1, batch2, batch3]);

    // 2. Seed BSTI Chemical Purity Lab Tests
    const labTest1 = this.labTestRepo.create({
      testReportNumber: 'BSTI-GUR-2026-0811',
      batchId: batch1.id,
      gurType: GurType.DATE_PALM_NOLEN_JHOLA,
      sampleName: 'Jhikargacha Dawn Jiran Nolen Gur Sample #01',
      testingLabName: 'BSTI Food & Chemical Testing Laboratory, Khulna',
      sucrosePct: 68.5,
      reducingSugarPct: 13.2,
      hydrosulfitePpm: 0.0,
      hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
      sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
      isArtificialColoringDetected: false,
      leadPpm: 0.12,
      totalSolubleSolidsBrix: 78.5,
      purityGrade: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiCompliant: true,
      isBstiApproved: true,
      authenticitySealNumber: 'GBZ-GI-GUR-JSR-0811',
      leadChemistName: 'Dr. Anisur Rahman, Senior Food Technologist',
    });

    const labTest2 = this.labTestRepo.create({
      testReportNumber: 'BSTI-GUR-2026-0812',
      batchId: batch2.id,
      gurType: GurType.DATE_PALM_PATALI_SOLID,
      sampleName: 'Damurhuda Natural Date Palm Patali Block #02',
      testingLabName: 'BSTI Food & Chemical Testing Laboratory, Khulna',
      sucrosePct: 71.0,
      reducingSugarPct: 11.5,
      hydrosulfitePpm: 0.0,
      hydrosulfiteStatus: HydrosulfiteTestResult.NEGATIVE_ZERO_TOLERANCE_PASS,
      sugarAdulterationStatus: SugarSyrupAdulterationStatus.GENUINE_PURE_SAP,
      isArtificialColoringDetected: false,
      leadPpm: 0.15,
      totalSolubleSolidsBrix: 88.0,
      purityGrade: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiCompliant: true,
      isBstiApproved: true,
      authenticitySealNumber: 'GBZ-GI-GUR-CHU-0812',
      leadChemistName: 'Dr. Anisur Rahman, Senior Food Technologist',
    });

    const labTest3 = this.labTestRepo.create({
      testReportNumber: 'BSTI-SEIZED-2026-991',
      gurType: GurType.DATE_PALM_PATALI_SOLID,
      sampleName: 'Confiscated Commercial Bazar Patali Sample (Seized)',
      testingLabName: 'BSTI Food & Chemical Testing Laboratory, Dhaka',
      sucrosePct: 88.5, // Exceedingly high due to sugar syrup
      reducingSugarPct: 3.2,
      hydrosulfitePpm: 185.0, // High toxic chemical bleaching agent
      hydrosulfiteStatus: HydrosulfiteTestResult.POSITIVE_CONTAMINATED_SEIZED,
      sugarAdulterationStatus: SugarSyrupAdulterationStatus.HIGH_SUGAR_ADULTERATED,
      isArtificialColoringDetected: true,
      leadPpm: 1.85,
      totalSolubleSolidsBrix: 84.0,
      purityGrade: GurPurityGrade.REJECTED_ADULTERATED,
      isGiCompliant: false,
      isBstiApproved: false,
      authenticitySealNumber: undefined,
      leadChemistName: 'Dr. Nazmul Huda, Food Safety Analyst',
    });

    await this.labTestRepo.save([labTest1, labTest2, labTest3]);

    // 3. Seed Artisanal Gur Lots
    const lot1 = this.lotRepo.create({
      lotCode: 'GUR-LOT-2026-JSR-JHOLA',
      batchId: batch1.id,
      labTestId: labTest1.id,
      lotTitle: 'Authentic Jashore GI Nolen Jhola Gur (যশোরের খাঁটি নলেন ঝোল গুড়)',
      artisanProducerName: 'Jhikargacha Traditional Gachhi Cooperative',
      originRegion: GurRegion.JASHORE_JHIKARGACHA,
      gurType: GurType.DATE_PALM_NOLEN_JHOLA,
      packagingType: GurPackagingType.TRADITIONAL_EARTHEN_POT_1KG,
      totalWeightKg: 150,
      availableWeightKg: 135,
      pricePerKgBdt: 480,
      totalValueBdt: 72000,
      minimumOrderKg: 2,
      aromaRating: 5,
      purityGrade: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: true,
      isHydrosulfiteFreeCertified: true,
      status: GurLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot2 = this.lotRepo.create({
      lotCode: 'GUR-LOT-2026-CHU-PATALI',
      batchId: batch2.id,
      labTestId: labTest2.id,
      lotTitle: 'Chuadanga Aromatic Date Palm Patali Block (দামুড়হুদা খাঁটি পাটালি গুড়)',
      artisanProducerName: 'Damurhuda Heritage Date Palm Guild',
      originRegion: GurRegion.CHUADANGA_DAMURHUDA,
      gurType: GurType.DATE_PALM_PATALI_SOLID,
      packagingType: GurPackagingType.BAMBOO_LEAF_PATALI_BLOCK_2KG,
      totalWeightKg: 200,
      availableWeightKg: 190,
      pricePerKgBdt: 440,
      totalValueBdt: 88000,
      minimumOrderKg: 2,
      aromaRating: 5,
      purityGrade: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: true,
      isHydrosulfiteFreeCertified: true,
      status: GurLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot3 = this.lotRepo.create({
      lotCode: 'GUR-LOT-2026-KUS-CANE',
      batchId: batch3.id,
      lotTitle: 'Organic Deshi Sugarcane Red Gur (কুষ্টিয়ার প্রাকৃতিক আখের লাল গুড়)',
      artisanProducerName: 'Kumarkhali Organic Sugarcane Growers Guild',
      originRegion: GurRegion.KUSHTIA_KUMARKHALI,
      gurType: GurType.SUGARCANE_ORGANIC_SOLID,
      packagingType: GurPackagingType.FOOD_GRADE_GLASS_JAR_1KG,
      totalWeightKg: 250,
      availableWeightKg: 240,
      pricePerKgBdt: 220,
      totalValueBdt: 55000,
      minimumOrderKg: 5,
      aromaRating: 4,
      purityGrade: GurPurityGrade.GRADE_A_PURE_ARTISANAL,
      isGiTagged: false,
      isHydrosulfiteFreeCertified: true,
      status: GurLotStatus.AVAILABLE_FOR_SALE,
    });

    await this.lotRepo.save([lot1, lot2, lot3]);
  }

  // Calculators
  calculateGurExtraction(dto: CalculateGurExtractionDto): GurExtractionCalculationResult {
    let baseRatio = 8.5; // Liters of sap per 1 kg of Date Palm Gur
    let recommendedStrikeTemp = 115.0; // °C
    let projectedBrix = 78.0;

    const brix = dto.sapBrixDegrees || 13.5;

    switch (dto.gurType) {
      case GurType.DATE_PALM_NOLEN_JHOLA:
        baseRatio = (78 / brix) * 1.5; // ~8.6:1
        recommendedStrikeTemp = 115.5;
        projectedBrix = 78.5;
        break;
      case GurType.DATE_PALM_PATALI_SOLID:
        baseRatio = (88 / brix) * 1.35; // ~9.0:1
        recommendedStrikeTemp = 119.5;
        projectedBrix = 88.0;
        break;
      case GurType.DATE_PALM_DANADAR:
        baseRatio = (85 / brix) * 1.4; // ~8.8:1
        recommendedStrikeTemp = 118.0;
        projectedBrix = 85.0;
        break;
      case GurType.SUGARCANE_ORGANIC_SOLID:
      case GurType.SUGARCANE_CRUMBLED_POWDER:
        baseRatio = (85 / (brix > 15 ? brix : 18.0)) * 1.45; // ~6.8:1
        recommendedStrikeTemp = 118.5;
        projectedBrix = 86.0;
        break;
      case GurType.MOLASSES_CHITA_ORGANIC:
        baseRatio = 5.0;
        recommendedStrikeTemp = 110.0;
        projectedBrix = 72.0;
        break;
    }

    // Shift modifier
    let aromaPreservationScore = 95;
    let advisoryMessage = '';

    if (dto.sapCollectionShift === SapCollectionShift.DAWN_JIRAN_PREMIUM) {
      aromaPreservationScore = 98;
      advisoryMessage =
        'Dawn Jiran Sap (ভোরের জিরান রস): Cold morning collection before sunrise ensures unfermented sucrose, rich volatile aromas, and peak GI-grade Nolen Gur crystallization.';
    } else if (dto.sapCollectionShift === SapCollectionShift.DAY_DAULA_STANDARD) {
      baseRatio += 0.8;
      aromaPreservationScore = 78;
      advisoryMessage =
        'Day Daula Sap (ডাউলা রস): Solar warming increases mild acidity and reducing sugars; best boiled rapidly for table consumption or crumbled powder.';
    } else {
      aromaPreservationScore = 84;
      advisoryMessage =
        'Evening Sap (সন্ধ্যার রস): Moderate sweetness; recommended for organic solid blocks with thorough skimming.';
    }

    const sapToGurRatio = Number(baseRatio.toFixed(2));
    const expectedGurWeightKg = Number((dto.rawSapVolumeLiters / sapToGurRatio).toFixed(2));
    const byproductChitaMolassesKg = Number((expectedGurWeightKg * 0.12).toFixed(2));

    return {
      gurType: dto.gurType,
      rawSapVolumeLiters: dto.rawSapVolumeLiters,
      sapBrixDegrees: brix,
      sapCollectionShift: dto.sapCollectionShift,
      expectedGurWeightKg,
      sapToGurRatio,
      recommendedStrikeTempCelsius: recommendedStrikeTemp,
      aromaPreservationScore,
      sweetnessBrixProjected: projectedBrix,
      byproductChitaMolassesKg,
      advisoryMessage,
    };
  }

  evaluateGurPurity(dto: EvaluateGurPurityDto): GurPurityEvaluationResult {
    const isHydrosulfiteContaminated =
      dto.hydrosulfitePpm > 0.0 ||
      dto.hydrosulfiteStatus === HydrosulfiteTestResult.POSITIVE_CONTAMINATED_SEIZED;

    const isSugarAdulterated =
      dto.sugarAdulterationStatus !== SugarSyrupAdulterationStatus.GENUINE_PURE_SAP ||
      dto.sucrosePct > 82.0 ||
      dto.reducingSugarPct < 5.0;

    const isColoringDetected = dto.isArtificialColoringDetected;
    const isOverheated = dto.strikeBoilingTempCelsius > 123.0;

    let purityGrade: GurPurityGrade = GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE;
    let bstiComplianceApproved = true;
    let verdict = 'VERIFIED PURE CHEMICAL-FREE ARTISANAL GUR';
    let safetyNotes = '100% free from toxic sodium hydrosulfite and synthetic adulterants. Complies with BSTI standards.';
    let qualityScore = 98;

    if (isHydrosulfiteContaminated) {
      purityGrade = GurPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 0;
      verdict = 'HAZARDOUS TOXIC CHEMICAL DETECTED: Positive for Sodium Hydrosulfite (হাইড্রোজ)';
      safetyNotes =
        'MANDATORY SEIZURE: Sodium hydrosulfite (Na2S2O4) is a hazardous bleaching chemical that destroys respiratory tissues and causes severe gastric injury. Immediate mobile court seizure ordered under Bangladesh Food Safety Act 2013.';
    } else if (isColoringDetected) {
      purityGrade = GurPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 10;
      verdict = 'SYNTHETIC INDUSTRIAL DYE DETECTED';
      safetyNotes = 'Contaminated with prohibited coal-tar/azo dyes (Metanil Yellow or Orange-II) to artificially simulate golden color.';
    } else if (isSugarAdulterated) {
      purityGrade = GurPurityGrade.COMMERCIAL_STANDARD;
      bstiComplianceApproved = false;
      qualityScore = 45;
      verdict = 'ADULTERATED WITH INDUSTRIAL REFINED SUGAR SYRUP';
      safetyNotes = 'High sucrose (>82%) and deficient reducing sugars indicate blending with cheap refined white cane sugar, stripping natural date palm essence.';
    } else if (isOverheated) {
      purityGrade = GurPurityGrade.GRADE_A_PURE_ARTISANAL;
      qualityScore = 80;
      verdict = 'THERMALLY SCORCHED (Caramelized Aroma Distortion)';
      safetyNotes = 'Strike boiling temperature exceeded 123°C; slight caramelization bitterness present.';
    }

    if (dto.sucrosePct < 60.0 && purityGrade === GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE) {
      qualityScore -= 10;
      safetyNotes += ' Sucrose content is mildly lower than typical date palm harvest baseline.';
    }

    return {
      gurType: dto.gurType,
      isHydrosulfiteContaminated,
      isSugarAdulterated,
      isColoringDetected,
      isOverheated,
      purityGrade,
      bstiComplianceApproved,
      qualityScore,
      verdict,
      safetyNotes,
    };
  }

  // Batches
  async getTappingBatches(filter?: {
    gurType?: GurType;
    region?: GurRegion;
    shift?: SapCollectionShift;
  }): Promise<DatePalmTappingBatch[]> {
    const qb = this.batchRepo.createQueryBuilder('b');
    if (filter?.gurType) {
      qb.andWhere('b.gurType = :gurType', { gurType: filter.gurType });
    }
    if (filter?.region) {
      qb.andWhere('b.region = :region', { region: filter.region });
    }
    if (filter?.shift) {
      qb.andWhere('b.sapCollectionShift = :shift', { shift: filter.shift });
    }
    qb.orderBy('b.createdAt', 'DESC');
    return qb.getMany();
  }

  async getTappingBatchById(id: string): Promise<DatePalmTappingBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException(`Tapping batch with ID ${id} not found`);
    return batch;
  }

  async createTappingBatch(dto: CreateDatePalmTappingBatchDto): Promise<DatePalmTappingBatch> {
    const prefix = (dto.region || GurRegion.JASHORE_JHIKARGACHA).substring(0, 3).toUpperCase();
    const count = await this.batchRepo.count();
    const batchNumber = `GUR-${new Date().getFullYear()}-${prefix}-${String(count + 1).padStart(3, '0')}`;

    const ratio = Number(((dto.rawSapVolumeLiters * 13.5) / (dto.sapBrixDegrees * 8.5)).toFixed(2));
    const producedWeight = Number((dto.rawSapVolumeLiters / (ratio > 5 ? ratio : 8.5)).toFixed(2));

    const batch = this.batchRepo.create({
      ...dto,
      batchNumber,
      sapToGurRatio: ratio > 0 ? ratio : 8.5,
      producedGurWeightKg: producedWeight,
      status: 'BOILING_IN_PROGRESS',
    });

    return this.batchRepo.save(batch);
  }

  async updateBatchBoiling(id: string, dto: UpdateBatchBoilingDto): Promise<DatePalmTappingBatch> {
    const batch = await this.getTappingBatchById(id);
    batch.strikeBoilingTempCelsius = dto.strikeBoilingTempCelsius;
    batch.producedGurWeightKg = dto.producedGurWeightKg;
    if (dto.producedGurWeightKg > 0) {
      batch.sapToGurRatio = Number((batch.rawSapVolumeLiters / dto.producedGurWeightKg).toFixed(2));
    }
    if (dto.status) batch.status = dto.status;
    if (dto.notes) batch.notes = dto.notes;

    return this.batchRepo.save(batch);
  }

  // Lab Tests
  async getGurLabTests(filter?: {
    gurType?: GurType;
    purityGrade?: GurPurityGrade;
  }): Promise<GurPurityLabTest[]> {
    const qb = this.labTestRepo.createQueryBuilder('t');
    if (filter?.gurType) {
      qb.andWhere('t.gurType = :gurType', { gurType: filter.gurType });
    }
    if (filter?.purityGrade) {
      qb.andWhere('t.purityGrade = :purityGrade', { purityGrade: filter.purityGrade });
    }
    qb.orderBy('t.createdAt', 'DESC');
    return qb.getMany();
  }

  async getGurLabTestById(id: string): Promise<GurPurityLabTest> {
    const test = await this.labTestRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException(`Gur lab test with ID ${id} not found`);
    return test;
  }

  async createGurLabTest(dto: CreateGurPurityLabTestDto): Promise<GurPurityLabTest> {
    const count = await this.labTestRepo.count();
    const testReportNumber = `BSTI-GUR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const isHydrosulfiteContaminated =
      dto.hydrosulfitePpm > 0.0 ||
      dto.hydrosulfiteStatus === HydrosulfiteTestResult.POSITIVE_CONTAMINATED_SEIZED;

    const isSugarAdulterated =
      dto.sugarAdulterationStatus !== SugarSyrupAdulterationStatus.GENUINE_PURE_SAP ||
      dto.sucrosePct > 82.0;

    let purityGrade: GurPurityGrade = GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE;
    let isBstiApproved = true;
    let authenticitySealNumber: string | undefined = `GBZ-GI-GUR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (isHydrosulfiteContaminated || dto.isArtificialColoringDetected) {
      purityGrade = GurPurityGrade.REJECTED_ADULTERATED;
      isBstiApproved = false;
      authenticitySealNumber = undefined;
    } else if (isSugarAdulterated) {
      purityGrade = GurPurityGrade.COMMERCIAL_STANDARD;
      isBstiApproved = false;
      authenticitySealNumber = undefined;
    }

    const labTest = this.labTestRepo.create({
      ...dto,
      testReportNumber,
      purityGrade,
      isBstiApproved,
      isGiCompliant: isBstiApproved && purityGrade === GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      authenticitySealNumber,
    });

    return this.labTestRepo.save(labTest);
  }

  // Forward Lots
  async getArtisanalLots(filter?: {
    gurType?: GurType;
    region?: GurRegion;
    status?: GurLotStatus;
  }): Promise<ArtisanalGurLot[]> {
    const qb = this.lotRepo.createQueryBuilder('l');
    if (filter?.gurType) {
      qb.andWhere('l.gurType = :gurType', { gurType: filter.gurType });
    }
    if (filter?.region) {
      qb.andWhere('l.originRegion = :region', { region: filter.region });
    }
    if (filter?.status) {
      qb.andWhere('l.status = :status', { status: filter.status });
    }
    qb.orderBy('l.createdAt', 'DESC');
    return qb.getMany();
  }

  async getArtisanalLotById(id: string): Promise<ArtisanalGurLot> {
    const lot = await this.lotRepo.findOne({ where: { id } });
    if (!lot) throw new NotFoundException(`Artisanal Gur Lot with ID ${id} not found`);
    return lot;
  }

  async createArtisanalLot(dto: CreateArtisanalGurLotDto): Promise<ArtisanalGurLot> {
    const count = await this.lotRepo.count();
    const regionCode = (dto.originRegion || GurRegion.JASHORE_JHIKARGACHA).substring(0, 3).toUpperCase();
    const lotCode = `GUR-LOT-${new Date().getFullYear()}-${regionCode}-${String(count + 1).padStart(3, '0')}`;

    const totalValueBdt = Number((dto.totalWeightKg * dto.pricePerKgBdt).toFixed(2));

    const lot = this.lotRepo.create({
      ...dto,
      lotCode,
      availableWeightKg: dto.totalWeightKg,
      totalValueBdt,
      purityGrade: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: dto.isGiTagged ?? true,
      isHydrosulfiteFreeCertified: dto.isHydrosulfiteFreeCertified ?? true,
      status: GurLotStatus.AVAILABLE_FOR_SALE,
    });

    return this.lotRepo.save(lot);
  }

  async purchaseGurLot(id: string, dto: PurchaseGurLotDto): Promise<ArtisanalGurLot> {
    const lot = await this.getArtisanalLotById(id);

    if (lot.status === GurLotStatus.SOLD_OUT || lot.availableWeightKg <= 0) {
      throw new BadRequestException('This artisanal gur lot is completely sold out.');
    }

    if (dto.orderQuantityKg > lot.availableWeightKg) {
      throw new BadRequestException(
        `Requested order quantity (${dto.orderQuantityKg} kg) exceeds available stock (${lot.availableWeightKg} kg).`,
      );
    }

    if (dto.orderQuantityKg < lot.minimumOrderKg) {
      throw new BadRequestException(
        `Order quantity must be at least ${lot.minimumOrderKg} kg.`,
      );
    }

    lot.availableWeightKg = Number((lot.availableWeightKg - dto.orderQuantityKg).toFixed(2));
    if (lot.availableWeightKg === 0) {
      lot.status = GurLotStatus.SOLD_OUT;
    }

    return this.lotRepo.save(lot);
  }
}
