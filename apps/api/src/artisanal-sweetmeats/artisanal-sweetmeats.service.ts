import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChhanaProductionBatch } from './entities/chhana-production-batch.entity.js';
import { SweetmeatPurityLabTest } from './entities/sweetmeat-purity-lab-test.entity.js';
import { ArtisanalSweetmeatLot } from './entities/artisanal-sweetmeat-lot.entity.js';
import {
  SweetmeatType,
  SweetmeatRegion,
  MilkSourceType,
  ChhanaCoagulantType,
  StarchAdulterationTest,
  SweetmeatPurityGrade,
  SweetmeatPackagingType,
  SweetmeatLotStatus,
} from './enums/artisanal-sweetmeats.enum.js';
import {
  CalculateSweetmeatYieldDto,
  EvaluateSweetmeatPurityDto,
  CreateChhanaProductionBatchDto,
  UpdateBatchCookingDto,
  CreateSweetmeatPurityLabTestDto,
  CreateArtisanalSweetmeatLotDto,
  PurchaseSweetmeatLotDto,
} from './dto/artisanal-sweetmeats.dto.js';

export interface SweetmeatYieldCalculationResult {
  sweetmeatType: SweetmeatType;
  inputMilkVolumeLiters: number;
  milkSource: MilkSourceType;
  milkFatPct: number;
  expectedOutputKg: number;
  milkToProductRatio: number;
  recommendedCoagulationTempCelsius: number;
  optimalMoisturePct: number;
  fatRetentionScore: number;
  byproductWheyLiters: number;
  processingAdvice: string;
}

export interface SweetmeatPurityEvaluationResult {
  sweetmeatType: SweetmeatType;
  isStarchAdulterated: boolean;
  isSyntheticMilkChemicalsDetected: boolean;
  isVanaspatiDetected: boolean;
  isColoringDetected: boolean;
  isThermalDefect: boolean;
  purityGrade: SweetmeatPurityGrade;
  bstiComplianceApproved: boolean;
  qualityScore: number;
  verdict: string;
  safetyNotes: string;
}

@Injectable()
export class ArtisanalSweetmeatsService implements OnModuleInit {
  constructor(
    @InjectRepository(ChhanaProductionBatch)
    private readonly batchRepo: Repository<ChhanaProductionBatch>,
    @InjectRepository(SweetmeatPurityLabTest)
    private readonly labTestRepo: Repository<SweetmeatPurityLabTest>,
    @InjectRepository(ArtisanalSweetmeatLot)
    private readonly lotRepo: Repository<ArtisanalSweetmeatLot>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  private async seedBaselineData() {
    const existingCount = await this.batchRepo.count();
    if (existingCount > 0) return;

    // 1. Seed Chhana & Curd Production Batches
    const batch1 = this.batchRepo.create({
      batchNumber: 'SWT-2026-BGR-001',
      moiraGuildName: 'Sherpur Traditional Doi Karigar Somobay (শেরপুর ঐতিহ্যবাহী দই কারিগর সমবায়)',
      contactPhone: '+8801711334455',
      region: SweetmeatRegion.BOGURA_SADAR,
      sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
      milkSource: MilkSourceType.INDIGENOUS_COW_DESHI,
      inputMilkVolumeLiters: 350,
      milkFatPct: 5.2,
      milkSnfPct: 9.0,
      coagulantType: ChhanaCoagulantType.YOGURT_WHEY_FERMENT,
      coagulationTempCelsius: 88.0,
      producedChhanaKg: 78.0,
      chhanaMoisturePct: 54.0,
      status: 'CLAY_POT_INCUBATION',
      notes: 'Whole indigenous cow milk simmered in large iron karai; poured into porous clay sras for 18-hour slow ferment.',
    });

    const batch2 = this.batchRepo.create({
      batchNumber: 'SWT-2026-NTR-002',
      moiraGuildName: 'Natore Lalbazar Kachagolla Guild (নাটোর লালবাজার খাঁটি কাঁচাগোল্লা সমিতি)',
      contactPhone: '+8801722445566',
      region: SweetmeatRegion.NATORE_SADAR,
      sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
      milkSource: MilkSourceType.INDIGENOUS_COW_DESHI,
      inputMilkVolumeLiters: 400,
      milkFatPct: 4.9,
      milkSnfPct: 8.8,
      coagulantType: ChhanaCoagulantType.NATURAL_WHEY_CULTURE,
      coagulationTempCelsius: 83.5,
      producedChhanaKg: 68.0,
      chhanaMoisturePct: 52.5,
      status: 'KNEADING_AND_COOKING',
      notes: 'Pure cow milk curdled with natural sour whey at 83.5°C; stirred with fine raw cane sugar syrup to preserve soft grainy texture.',
    });

    const batch3 = this.batchRepo.create({
      batchNumber: 'SWT-2026-TNG-003',
      moiraGuildName: 'Porabari Heritage Chamcham Guild (পোড়াবাড়ী আসল চমচম কারিগর সংস্থ্থা)',
      contactPhone: '+8801733556677',
      region: SweetmeatRegion.TANGAIL_PORABARI,
      sweetmeatType: SweetmeatType.PORABARI_CHAMCHAM,
      milkSource: MilkSourceType.CROSSBRED_DAIRY_COW,
      inputMilkVolumeLiters: 500,
      milkFatPct: 4.5,
      milkSnfPct: 8.5,
      coagulantType: ChhanaCoagulantType.FOOD_GRADE_CITRIC_ACID,
      coagulationTempCelsius: 84.0,
      producedChhanaKg: 82.0,
      chhanaMoisturePct: 48.0,
      status: 'READY_FOR_DISPATCH',
      notes: 'Dense firm chhana boiled in caramel sugar syrup and dusted with sun-dried mawa.',
    });

    await this.batchRepo.save([batch1, batch2, batch3]);

    // 2. Seed Lab Tests
    const labTest1 = this.labTestRepo.create({
      testReportNumber: 'BSTI-SWT-2026-0001',
      batchId: batch1.id,
      sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
      sampleName: 'Bogura Special Shahi Red Curd (মাটির সরা)',
      testingLabName: 'BSTI Regional Food & Chemical Laboratory, Rajshahi',
      milkFatDryMatterPct: 29.5,
      moisturePct: 53.0,
      starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
      isDetergentOrUreaDetected: false,
      isHydrogenatedFatVanaspatiDetected: false,
      isArtificialColoringDetected: false,
      totalAcidityLacticPct: 0.88,
      sensoryTasteScore: 9.8,
      purityGrade: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isBstiApproved: true,
      isGiCompliant: true,
      authenticitySealNumber: 'GBZ-GI-SWT-BGR01',
      leadChemistName: 'Dr. Anowar Hossain, Chief Food Microbiologist',
    });

    const labTest2 = this.labTestRepo.create({
      testReportNumber: 'BSTI-SWT-2026-0002',
      batchId: batch2.id,
      sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
      sampleName: 'Natore Traditional Melt-in-Mouth Kachagolla',
      testingLabName: 'BSTI Regional Laboratory, Rajshahi',
      milkFatDryMatterPct: 31.0,
      moisturePct: 51.5,
      starchAdulterationStatus: StarchAdulterationTest.NEGATIVE_ZERO_TOLERANCE_PASS,
      isDetergentOrUreaDetected: false,
      isHydrogenatedFatVanaspatiDetected: false,
      isArtificialColoringDetected: false,
      totalAcidityLacticPct: 0.65,
      sensoryTasteScore: 9.6,
      purityGrade: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isBstiApproved: true,
      isGiCompliant: true,
      authenticitySealNumber: 'GBZ-GI-SWT-NTR02',
      leadChemistName: 'Tahmina Begum, Senior Dairy Chemist',
    });

    const labTest3 = this.labTestRepo.create({
      testReportNumber: 'BSTI-SWT-2026-0003',
      sweetmeatType: SweetmeatType.PURE_COW_MILK_CHHANA,
      sampleName: 'Adulterated Commercial Chhana Sample',
      testingLabName: 'BFSA Central Food Safety Lab, Dhaka',
      milkFatDryMatterPct: 14.5,
      moisturePct: 62.0,
      starchAdulterationStatus: StarchAdulterationTest.POSITIVE_STARCH_DETECTED_SEIZED,
      isDetergentOrUreaDetected: true,
      isHydrogenatedFatVanaspatiDetected: true,
      isArtificialColoringDetected: true,
      totalAcidityLacticPct: 1.45,
      sensoryTasteScore: 2.1,
      purityGrade: SweetmeatPurityGrade.REJECTED_ADULTERATED,
      isBstiApproved: false,
      isGiCompliant: false,
      leadChemistName: 'M. Kabiruzzaman, Executive Magistrate & Analyst',
    });

    await this.labTestRepo.save([labTest1, labTest2, labTest3]);

    // 3. Seed Forward Lots
    const lot1 = this.lotRepo.create({
      lotCode: 'SWT-LOT-2026-BGR-001',
      batchId: batch1.id,
      labTestId: labTest1.id,
      lotTitle: 'Special Bogura Shahi Red Curd (বগুড়ার খাঁটি ক্ষীরসা লাল দই - মাটির সরা)',
      moiraProducerName: 'Sherpur Traditional Doi Karigar Somobay',
      originRegion: SweetmeatRegion.BOGURA_SADAR,
      sweetmeatType: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
      packagingType: SweetmeatPackagingType.POROUS_CLAY_SRA_1KG,
      totalWeightKg: 150,
      availableWeightKg: 120,
      pricePerKgBdt: 420,
      totalValueBdt: 63000,
      minimumOrderKg: 2,
      textureSoftnessRating: 5,
      purityGrade: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: true,
      isRefrigeratedColdChain: true,
      status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot2 = this.lotRepo.create({
      lotCode: 'SWT-LOT-2026-NTR-002',
      batchId: batch2.id,
      labTestId: labTest2.id,
      lotTitle: 'GI Certified Pure Natore Kachagolla (নাটোরের বিখ্যাত কাঁচাগোল্লা)',
      moiraProducerName: 'Natore Lalbazar Kachagolla Guild',
      originRegion: SweetmeatRegion.NATORE_SADAR,
      sweetmeatType: SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA,
      packagingType: SweetmeatPackagingType.HERMETIC_SWEET_BOX_1KG,
      totalWeightKg: 100,
      availableWeightKg: 85,
      pricePerKgBdt: 580,
      totalValueBdt: 58000,
      minimumOrderKg: 1,
      textureSoftnessRating: 5,
      purityGrade: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: true,
      isRefrigeratedColdChain: true,
      status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot3 = this.lotRepo.create({
      lotCode: 'SWT-LOT-2026-TNG-003',
      batchId: batch3.id,
      lotTitle: 'Original Tangail Porabari Chamcham (পোড়াবাড়ীর ঐতিহ্যবাহী চমচম)',
      moiraProducerName: 'Porabari Heritage Chamcham Guild',
      originRegion: SweetmeatRegion.TANGAIL_PORABARI,
      sweetmeatType: SweetmeatType.PORABARI_CHAMCHAM,
      packagingType: SweetmeatPackagingType.FOOD_GRADE_TIN_CAN_2KG,
      totalWeightKg: 200,
      availableWeightKg: 160,
      pricePerKgBdt: 480,
      totalValueBdt: 96000,
      minimumOrderKg: 2,
      textureSoftnessRating: 4,
      purityGrade: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: true,
      isRefrigeratedColdChain: false,
      status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
    });

    await this.lotRepo.save([lot1, lot2, lot3]);
  }

  // Calculators
  calculateSweetmeatYield(dto: CalculateSweetmeatYieldDto): SweetmeatYieldCalculationResult {
    let baseYieldRatio = 0.17; // 17% Chhana from standard cow milk
    let recommendedTemp = 83.5;
    let optimalMoisture = 52.0;
    let fatRetentionScore = 95;
    let advice = '';

    const fat = dto.milkFatPct || (dto.milkSource === MilkSourceType.RIVERINE_BUFFALO_MILK ? 7.5 : 4.5);

    switch (dto.sweetmeatType) {
      case SweetmeatType.BOGURA_SPECIAL_CURD_DOI:
        // Whole milk reduced by ~28% volume before incubation
        baseYieldRatio = 0.72;
        recommendedTemp = 88.0;
        optimalMoisture = 54.0;
        fatRetentionScore = 98;
        advice =
          'Bogura Shahi Curd: Slow simmering in open iron karai concentrates milk solids; setting in porous earthen sras allows water transpiration, producing signature reddish-brown curd skin (সর).';
        break;

      case SweetmeatType.NATORE_AUTHENTIC_KACHAGOLLA:
        baseYieldRatio = (fat / 4.5) * 0.175; // ~17.5% yield
        recommendedTemp = 83.0;
        optimalMoisture = 52.5;
        fatRetentionScore = 96;
        advice =
          'Natore Kachagolla: Coagulate at strictly 82-84°C with natural sour whey. Overheating toughens the chhana and destroys the soft, melt-in-mouth granular mouthfeel.';
        break;

      case SweetmeatType.PORABARI_CHAMCHAM:
      case SweetmeatType.NETROKONA_BALISH_MISTI:
        baseYieldRatio = (fat / 4.5) * 0.165; // ~16.5% yield for firm chhana
        recommendedTemp = 85.0;
        optimalMoisture = 48.0;
        fatRetentionScore = 92;
        advice =
          'Porabari Chamcham: Drain whey thoroughly to achieve 48% moisture. Firm chhana dough holds its shape during deep simmering in boiling caramel sugar syrup.';
        break;

      case SweetmeatType.COMILLA_RASMALAI_MATRI_BHANDAR:
        baseYieldRatio = 0.22; // Chhana dumplings + thick malai reduction
        recommendedTemp = 83.0;
        optimalMoisture = 53.0;
        fatRetentionScore = 97;
        advice =
          'Comilla Rasmalai: Feather-light mini chhana pellets boiled in thin syrup, then soaked in 2:1 reduced clotted cream malai.';
        break;

      case SweetmeatType.TRADITIONAL_GAWA_GHEE:
        baseYieldRatio = (fat / 4.5) * 0.048; // ~4.8% ghee from milk
        recommendedTemp = 112.0;
        optimalMoisture = 0.2;
        fatRetentionScore = 99;
        advice =
          'Gawa Ghee: Cultured cream clarified over gentle heat until milk solids turn golden brown with nutty aroma and granular texture.';
        break;

      case SweetmeatType.PURE_COW_MILK_CHHANA:
      default:
        baseYieldRatio = (fat / 4.5) * 0.17;
        recommendedTemp = 83.5;
        optimalMoisture = 52.0;
        fatRetentionScore = 95;
        advice =
          'Pure Artisanal Chhana: Immediately rinse freshly drained curd with cold water to halt acidification and preserve sweet milk aromatics.';
        break;
    }

    if (dto.milkSource === MilkSourceType.RIVERINE_BUFFALO_MILK) {
      baseYieldRatio *= 1.28; // Higher fat & protein increases yield significantly
      fatRetentionScore = 99;
    }

    const expectedOutputKg = Number((dto.inputMilkVolumeLiters * baseYieldRatio).toFixed(2));
    const milkToProductRatio = Number((dto.inputMilkVolumeLiters / expectedOutputKg).toFixed(2));
    const byproductWheyLiters = Number((dto.inputMilkVolumeLiters * 0.80).toFixed(2));

    return {
      sweetmeatType: dto.sweetmeatType,
      inputMilkVolumeLiters: dto.inputMilkVolumeLiters,
      milkSource: dto.milkSource,
      milkFatPct: fat,
      expectedOutputKg,
      milkToProductRatio,
      recommendedCoagulationTempCelsius: recommendedTemp,
      optimalMoisturePct: optimalMoisture,
      fatRetentionScore,
      byproductWheyLiters,
      processingAdvice: advice,
    };
  }

  evaluateSweetmeatPurity(dto: EvaluateSweetmeatPurityDto): SweetmeatPurityEvaluationResult {
    const isStarchAdulterated =
      dto.starchAdulterationStatus === StarchAdulterationTest.POSITIVE_STARCH_DETECTED_SEIZED;

    const isSyntheticMilkChemicalsDetected = dto.isDetergentOrUreaDetected;
    const isVanaspatiDetected = dto.isHydrogenatedFatVanaspatiDetected;
    const isColoringDetected = dto.isArtificialColoringDetected;
    const isThermalDefect = dto.coagulationTempCelsius > 88.0 || dto.coagulationTempCelsius < 78.0;

    let purityGrade: SweetmeatPurityGrade = SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE;
    let bstiComplianceApproved = true;
    let verdict = 'VERIFIED PURE ARTISANAL DAIRY CONFECTIONERY';
    let safetyNotes = '100% natural milk solids. Zero starch, synthetic chemicals, or hydrogenated vegetable fats detected.';
    let qualityScore = 98;

    if (isSyntheticMilkChemicalsDetected) {
      purityGrade = SweetmeatPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 0;
      verdict = 'CRIMINAL CONTAMINATION DETECTED: Synthetic Milk Chemicals (Urea / Detergent)';
      safetyNotes =
        'MANDATORY SEIZURE: Prohibited hazardous industrial chemicals detected in milk solids. Immediate mobile court seizure and penal prosecution ordered under Bangladesh Food Safety Act 2013.';
    } else if (isVanaspatiDetected) {
      purityGrade = SweetmeatPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 15;
      verdict = 'HYDROGENATED VEGETABLE FAT (DALDA/VANASPATI) DETECTED';
      safetyNotes = 'Positive Baudouin reaction indicates replacement of pure milk fat with cheap trans-fat-laden hydrogenated oil.';
    } else if (isStarchAdulterated) {
      purityGrade = SweetmeatPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 25;
      verdict = 'STARCH ADULTERATION DETECTED (Flour / Arrowroot Filler)';
      safetyNotes = 'Iodine test positive. Artificial bulk filler added to simulate chhana mass, stripping authentic melt-in-mouth texture.';
    } else if (isColoringDetected) {
      purityGrade = SweetmeatPurityGrade.REJECTED_ADULTERATED;
      bstiComplianceApproved = false;
      qualityScore = 30;
      verdict = 'PROHIBITED SYNTHETIC DYES DETECTED (Metanil Yellow / Auramine)';
      safetyNotes = 'Artificial industrial dyes used to simulate golden ghee/doi coloring.';
    } else if (dto.milkFatDryMatterPct < 25.0) {
      purityGrade = SweetmeatPurityGrade.COMMERCIAL_STANDARD;
      bstiComplianceApproved = false;
      qualityScore = 60;
      verdict = 'DEFICIENT MILK FAT IN DRY MATTER (Below BSTI BDS 961 Minimum 25%)';
      safetyNotes = 'Low fat content indicates skimming or dilution with water.';
    } else if (isThermalDefect) {
      purityGrade = SweetmeatPurityGrade.GRADE_A_PURE_ARTISANAL;
      qualityScore = 82;
      verdict = 'THERMAL COAGULATION DEFECT (Hard / Rubbery Chhana Texture)';
      safetyNotes = 'Coagulation temperature deviated outside optimal 82-85°C window; slight texture toughness observed.';
    }

    return {
      sweetmeatType: dto.sweetmeatType,
      isStarchAdulterated,
      isSyntheticMilkChemicalsDetected,
      isVanaspatiDetected,
      isColoringDetected,
      isThermalDefect,
      purityGrade,
      bstiComplianceApproved,
      qualityScore,
      verdict,
      safetyNotes,
    };
  }

  // Batches
  async getProductionBatches(filter?: {
    sweetmeatType?: SweetmeatType;
    region?: SweetmeatRegion;
  }): Promise<ChhanaProductionBatch[]> {
    const qb = this.batchRepo.createQueryBuilder('b');
    if (filter?.sweetmeatType) {
      qb.andWhere('b.sweetmeatType = :sweetmeatType', { sweetmeatType: filter.sweetmeatType });
    }
    if (filter?.region) {
      qb.andWhere('b.region = :region', { region: filter.region });
    }
    qb.orderBy('b.createdAt', 'DESC');
    return qb.getMany();
  }

  async getProductionBatchById(id: string): Promise<ChhanaProductionBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException(`Sweetmeat production batch with ID ${id} not found`);
    return batch;
  }

  async createProductionBatch(dto: CreateChhanaProductionBatchDto): Promise<ChhanaProductionBatch> {
    const regionCode = (dto.region || SweetmeatRegion.BOGURA_SADAR).substring(0, 3).toUpperCase();
    const count = await this.batchRepo.count();
    const batchNumber = `SWT-${new Date().getFullYear()}-${regionCode}-${String(count + 1).padStart(3, '0')}`;

    const yieldFactor = dto.milkFatPct ? (dto.milkFatPct / 4.5) * 0.17 : 0.17;
    const estimatedOutput = Number((dto.inputMilkVolumeLiters * yieldFactor).toFixed(2));

    const batch = this.batchRepo.create({
      ...dto,
      batchNumber,
      producedChhanaKg: estimatedOutput,
      chhanaMoisturePct: 52.0,
      status: 'CURDLING_IN_PROGRESS',
    });

    return this.batchRepo.save(batch);
  }

  async updateBatchCooking(id: string, dto: UpdateBatchCookingDto): Promise<ChhanaProductionBatch> {
    const batch = await this.getProductionBatchById(id);
    batch.producedChhanaKg = dto.producedChhanaKg;
    batch.chhanaMoisturePct = dto.chhanaMoisturePct;
    if (dto.status) batch.status = dto.status;
    if (dto.notes) batch.notes = dto.notes;

    return this.batchRepo.save(batch);
  }

  // Lab Tests
  async getSweetmeatLabTests(filter?: {
    sweetmeatType?: SweetmeatType;
    purityGrade?: SweetmeatPurityGrade;
  }): Promise<SweetmeatPurityLabTest[]> {
    const qb = this.labTestRepo.createQueryBuilder('t');
    if (filter?.sweetmeatType) {
      qb.andWhere('t.sweetmeatType = :sweetmeatType', { sweetmeatType: filter.sweetmeatType });
    }
    if (filter?.purityGrade) {
      qb.andWhere('t.purityGrade = :purityGrade', { purityGrade: filter.purityGrade });
    }
    qb.orderBy('t.createdAt', 'DESC');
    return qb.getMany();
  }

  async getSweetmeatLabTestById(id: string): Promise<SweetmeatPurityLabTest> {
    const test = await this.labTestRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException(`Sweetmeat lab test report with ID ${id} not found`);
    return test;
  }

  async createSweetmeatLabTest(dto: CreateSweetmeatPurityLabTestDto): Promise<SweetmeatPurityLabTest> {
    const count = await this.labTestRepo.count();
    const testReportNumber = `BSTI-SWT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const isStarchAdulterated =
      dto.starchAdulterationStatus === StarchAdulterationTest.POSITIVE_STARCH_DETECTED_SEIZED;

    const isContaminated =
      isStarchAdulterated ||
      dto.isDetergentOrUreaDetected ||
      dto.isHydrogenatedFatVanaspatiDetected ||
      dto.isArtificialColoringDetected;

    let purityGrade: SweetmeatPurityGrade = SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE;
    let isBstiApproved = true;
    let authenticitySealNumber: string | undefined = `GBZ-GI-SWT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (isContaminated) {
      purityGrade = SweetmeatPurityGrade.REJECTED_ADULTERATED;
      isBstiApproved = false;
      authenticitySealNumber = undefined;
    } else if (dto.milkFatDryMatterPct < 25.0) {
      purityGrade = SweetmeatPurityGrade.COMMERCIAL_STANDARD;
      isBstiApproved = false;
      authenticitySealNumber = undefined;
    }

    const labTest = this.labTestRepo.create({
      ...dto,
      testReportNumber,
      purityGrade,
      isBstiApproved,
      isGiCompliant: isBstiApproved && purityGrade === SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      authenticitySealNumber,
    });

    return this.labTestRepo.save(labTest);
  }

  // Forward Lots
  async getArtisanalLots(filter?: {
    sweetmeatType?: SweetmeatType;
    region?: SweetmeatRegion;
    status?: SweetmeatLotStatus;
  }): Promise<ArtisanalSweetmeatLot[]> {
    const qb = this.lotRepo.createQueryBuilder('l');
    if (filter?.sweetmeatType) {
      qb.andWhere('l.sweetmeatType = :sweetmeatType', { sweetmeatType: filter.sweetmeatType });
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

  async getArtisanalLotById(id: string): Promise<ArtisanalSweetmeatLot> {
    const lot = await this.lotRepo.findOne({ where: { id } });
    if (!lot) throw new NotFoundException(`Artisanal sweetmeat lot with ID ${id} not found`);
    return lot;
  }

  async createArtisanalLot(dto: CreateArtisanalSweetmeatLotDto): Promise<ArtisanalSweetmeatLot> {
    const count = await this.lotRepo.count();
    const regionCode = (dto.originRegion || SweetmeatRegion.BOGURA_SADAR).substring(0, 3).toUpperCase();
    const lotCode = `SWT-LOT-${new Date().getFullYear()}-${regionCode}-${String(count + 1).padStart(3, '0')}`;

    const totalValueBdt = Number((dto.totalWeightKg * dto.pricePerKgBdt).toFixed(2));

    const lot = this.lotRepo.create({
      ...dto,
      lotCode,
      availableWeightKg: dto.totalWeightKg,
      totalValueBdt,
      purityGrade: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
      isGiTagged: dto.isGiTagged ?? true,
      isRefrigeratedColdChain: dto.isRefrigeratedColdChain ?? true,
      status: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
    });

    return this.lotRepo.save(lot);
  }

  async purchaseSweetmeatLot(id: string, dto: PurchaseSweetmeatLotDto): Promise<ArtisanalSweetmeatLot> {
    const lot = await this.getArtisanalLotById(id);

    if (lot.status === SweetmeatLotStatus.SOLD_OUT || lot.availableWeightKg <= 0) {
      throw new BadRequestException('This artisanal sweetmeat lot is completely sold out.');
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
      lot.status = SweetmeatLotStatus.SOLD_OUT;
    }

    return this.lotRepo.save(lot);
  }
}
