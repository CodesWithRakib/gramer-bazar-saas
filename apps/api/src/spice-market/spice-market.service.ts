import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SpiceType,
  SpiceRegion,
  DryingMethod,
  DryingBatchStatus,
  AflatoxinRiskLevel,
  AdulterationTestStatus,
  SpicePurityGrade,
  SpiceFormFactor,
  SpicePackagingType,
  SpiceLotStatus,
} from './enums/spice-market.enum.js';
import { SpiceDryingBatch } from './entities/spice-drying-batch.entity.js';
import { SpicePurityLabTest } from './entities/spice-purity-lab-test.entity.js';
import { SpiceForwardLot } from './entities/spice-forward-lot.entity.js';
import {
  CalculateSpiceDehydrationDto,
  EvaluateSpicePurityDto,
  CreateSpiceDryingBatchDto,
  UpdateBatchTelemetryDto,
  CreateSpicePurityLabTestDto,
  CreateSpiceForwardLotDto,
  PurchaseSpiceLotDto,
} from './dto/spice-market.dto.js';

@Injectable()
export class SpiceMarketService implements OnModuleInit {
  constructor(
    @InjectRepository(SpiceDryingBatch)
    private readonly batchRepo: Repository<SpiceDryingBatch>,
    @InjectRepository(SpicePurityLabTest)
    private readonly labRepo: Repository<SpicePurityLabTest>,
    @InjectRepository(SpiceForwardLot)
    private readonly lotRepo: Repository<SpiceForwardLot>,
  ) {}

  async onModuleInit() {
    await this.seedInitialSpiceData();
  }

  private async seedInitialSpiceData() {
    const count = await this.batchRepo.count();
    if (count > 0) return;

    // 1. Seed Drying Batches
    const batch1 = this.batchRepo.create({
      batchNumber: 'SPICE-DRY-2026-BGR-001',
      growerCoopName: 'Sariakandi Jamuna Char Spice Producers Cooperative',
      contactPhone: '+8801712334455',
      region: SpiceRegion.BOGURA_SARIAKANDI_CHAR,
      spiceType: SpiceType.CHILLI,
      varietyName: 'BARI Morich-2 (বগুড়ার লাল মরিচ)',
      initialFreshWeightKg: 2000,
      currentDryWeightKg: 450,
      dryingMethod: DryingMethod.SOLAR_PARABOLIC_TUNNEL,
      chamberTempCelsius: 49.5,
      chamberHumidityPct: 38.0,
      currentMoisturePct: 9.2,
      dryingDaysElapsed: 4,
      aflatoxinRiskLevel: AflatoxinRiskLevel.SAFE_ZERO_RISK,
      status: DryingBatchStatus.DEHYDRATION_COMPLETED,
    });

    const batch2 = this.batchRepo.create({
      batchNumber: 'SPICE-DRY-2026-NTR-002',
      growerCoopName: 'Gurudaspur Chalan Beel Golden Turmeric Hub',
      contactPhone: '+8801715667788',
      region: SpiceRegion.NATORE_GURUDASPUR,
      spiceType: SpiceType.TURMERIC,
      varietyName: 'BARI Halud-4 (উচ্চ কার্কিউমিন দেশি হলুদ)',
      initialFreshWeightKg: 3000,
      currentDryWeightKg: 660,
      dryingMethod: DryingMethod.SOLAR_PARABOLIC_TUNNEL,
      chamberTempCelsius: 51.0,
      chamberHumidityPct: 35.5,
      currentMoisturePct: 9.0,
      dryingDaysElapsed: 5,
      aflatoxinRiskLevel: AflatoxinRiskLevel.SAFE_ZERO_RISK,
      status: DryingBatchStatus.DEHYDRATION_COMPLETED,
    });

    const batch3 = this.batchRepo.create({
      batchNumber: 'SPICE-DRY-2026-BND-003',
      growerCoopName: 'Ruma Hill Tracts Organic Indigenous Spices Guild',
      contactPhone: '+8801819223344',
      region: SpiceRegion.BANDARBAN_HILL_TRACTS,
      spiceType: SpiceType.GINGER,
      varietyName: 'Pahari Dimple Ginger (পাহাড়ি আঁশযুক্ত আদা)',
      initialFreshWeightKg: 1500,
      currentDryWeightKg: 320,
      dryingMethod: DryingMethod.SOLAR_PARABOLIC_TUNNEL,
      chamberTempCelsius: 48.0,
      chamberHumidityPct: 40.0,
      currentMoisturePct: 9.4,
      dryingDaysElapsed: 4,
      aflatoxinRiskLevel: AflatoxinRiskLevel.SAFE_ZERO_RISK,
      status: DryingBatchStatus.DEHYDRATION_COMPLETED,
    });

    await this.batchRepo.save([batch1, batch2, batch3]);

    // 2. Seed BSTI Anti-Adulteration Purity Lab Tests
    const test1 = this.labRepo.create({
      testReportNumber: 'BSTI-LAB-2026-SP-0412',
      batchId: batch1.id,
      spiceType: SpiceType.CHILLI,
      sampleName: 'Sariakandi Sun-Tunnel Whole Dried Red Chilli',
      testingLabName: 'BSTI National Chemical Testing Laboratory, Dhaka',
      sudanDyeStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
      leadChromateStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
      metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
      moisturePct: 9.1,
      aflatoxinB1Ppb: 2.1,
      scovilleHeatUnits: 48500,
      purityGrade: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
      certificateIssued: true,
      authenticitySealNumber: 'BSTI-PURE-CHILLI-2026-0811',
      leadChemistName: 'Prof. Dr. Anwarul Karim',
    });

    const test2 = this.labRepo.create({
      testReportNumber: 'BSTI-LAB-2026-SP-0413',
      batchId: batch2.id,
      spiceType: SpiceType.TURMERIC,
      sampleName: 'Gurudaspur Cured Mother Rhizome Turmeric',
      testingLabName: 'BARI Spices Research Center Analytical Lab, Bogura',
      sudanDyeStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
      leadChromateStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
      metanilYellowStatus: AdulterationTestStatus.NEGATIVE_NOT_DETECTED,
      moisturePct: 8.9,
      aflatoxinB1Ppb: 1.8,
      curcuminPct: 5.2,
      purityGrade: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
      certificateIssued: true,
      authenticitySealNumber: 'BSTI-PURE-TURMERIC-2026-0812',
      leadChemistName: 'Dr. Sultana Razia Begum',
    });

    await this.labRepo.save([test1, test2]);

    // 3. Seed Forward Pure Spice Lots
    const lot1 = this.lotRepo.create({
      lotCode: 'LOT-2026-CHILLI-089',
      dryingBatchId: batch1.id,
      labTestId: test1.id,
      lotTitle: 'Bogura Char Pure Solar-Dried Whole Red Chilli (Grade AAA)',
      producerName: 'Sariakandi Jamuna Char Spice Producers Cooperative',
      originRegion: SpiceRegion.BOGURA_SARIAKANDI_CHAR,
      spiceType: SpiceType.CHILLI,
      formFactor: SpiceFormFactor.WHOLE_DRIED_POD_RHIZOME,
      totalQuantityKg: 450,
      availableQuantityKg: 450,
      packagingType: SpicePackagingType.HERMETIC_GRAINPRO_BAG_50KG,
      pricePerKgBdt: 440,
      totalValueBdt: 198000,
      minimumOrderKg: 50,
      isBstiCertified: true,
      isBarisrcVerified: true,
      purityGrade: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
      status: SpiceLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot2 = this.lotRepo.create({
      lotCode: 'LOT-2026-TURM-090',
      dryingBatchId: batch2.id,
      labTestId: test2.id,
      lotTitle: 'Natore High-Curcumin Solar-Cured Turmeric Fingers (Curcumin 5.2%)',
      producerName: 'Gurudaspur Chalan Beel Golden Turmeric Hub',
      originRegion: SpiceRegion.NATORE_GURUDASPUR,
      spiceType: SpiceType.TURMERIC,
      formFactor: SpiceFormFactor.WHOLE_DRIED_POD_RHIZOME,
      totalQuantityKg: 660,
      availableQuantityKg: 660,
      packagingType: SpicePackagingType.HERMETIC_GRAINPRO_BAG_50KG,
      pricePerKgBdt: 360,
      totalValueBdt: 237600,
      minimumOrderKg: 50,
      isBstiCertified: true,
      isBarisrcVerified: true,
      purityGrade: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
      status: SpiceLotStatus.AVAILABLE_FOR_SALE,
    });

    const lot3 = this.lotRepo.create({
      lotCode: 'LOT-2026-GINGER-091',
      dryingBatchId: batch3.id,
      lotTitle: 'Bandarban Organic Mountain Dried Ginger Flakes',
      producerName: 'Ruma Hill Tracts Organic Indigenous Spices Guild',
      originRegion: SpiceRegion.BANDARBAN_HILL_TRACTS,
      spiceType: SpiceType.GINGER,
      formFactor: SpiceFormFactor.CRACKED_COARSE_FLAKES,
      totalQuantityKg: 320,
      availableQuantityKg: 320,
      packagingType: SpicePackagingType.NITROGEN_FLUSHED_FOIL_POUCH_1KG,
      pricePerKgBdt: 580,
      totalValueBdt: 185600,
      minimumOrderKg: 20,
      isBstiCertified: true,
      isBarisrcVerified: false,
      purityGrade: SpicePurityGrade.STANDARD_GRADE_A_DOMESTIC,
      status: SpiceLotStatus.AVAILABLE_FOR_SALE,
    });

    await this.lotRepo.save([lot1, lot2, lot3]);
  }

  // 1. Spice Dehydration & Moisture Loss Calculator
  calculateSpiceDehydration(dto: CalculateSpiceDehydrationDto) {
    const dryMatterKg = dto.freshWeightKg * (1 - dto.initialMoisturePct / 100);
    const finishedDryWeightKg = Math.round(
      dryMatterKg / (1 - dto.targetMoisturePct / 100),
    );
    const evaporatedWaterKg = dto.freshWeightKg - finishedDryWeightKg;
    const yieldRatio = Number(
      (dto.freshWeightKg / finishedDryWeightKg).toFixed(2),
    );
    const yieldPct = Number(
      ((finishedDryWeightKg / dto.freshWeightKg) * 100).toFixed(1),
    );

    let dryingDaysEstimate = 4;
    let spoilageRiskPct = 0;
    let cleanlinessBonusPct = 25;

    if (dto.dryingMethod === DryingMethod.SOLAR_PARABOLIC_TUNNEL) {
      dryingDaysEstimate = 4;
      spoilageRiskPct = 0.5; // Enclosed greenhouse tunnel protects from dirt, insects, rain
      cleanlinessBonusPct = 25; // 25% price premium over dusty roadside open sun-dried spice
    } else if (dto.dryingMethod === DryingMethod.MECHANICAL_BIOMASS_DRYER) {
      dryingDaysEstimate = 2;
      spoilageRiskPct = 0.2;
      cleanlinessBonusPct = 20;
    } else {
      dryingDaysEstimate = 12; // Traditional road drying
      spoilageRiskPct = 15.0; // High dust, bird-droppings, unseasonal rain wetting
      cleanlinessBonusPct = 0;
    }

    return {
      spiceType: dto.spiceType,
      freshWeightKg: dto.freshWeightKg,
      initialMoisturePct: dto.initialMoisturePct,
      targetMoisturePct: dto.targetMoisturePct,
      dryingMethod: dto.dryingMethod,
      dryMatterKg: Math.round(dryMatterKg),
      finishedDryWeightKg,
      evaporatedWaterKg,
      yieldRatio,
      yieldPct,
      dryingDaysEstimate,
      spoilageRiskPct,
      cleanlinessBonusPct,
      qualityAdvisory:
        finishedDryWeightKg > 0 && dto.targetMoisturePct <= 10.0
          ? 'Safe warehousing threshold achieved (<10% moisture). Low water activity inhibits Aspergillus mold and aflatoxin formation.'
          : 'Moisture exceeds safe 10% threshold. Requires extended solar tunnel draft to prevent fungal decay.',
    };
  }

  // 2. Anti-Adulteration Purity & Potency Scoring Evaluator
  evaluateSpicePurity(dto: EvaluateSpicePurityDto) {
    const hasSudanDye =
      dto.sudanDyeStatus === AdulterationTestStatus.POSITIVE_ADULTERATED;
    const hasLeadChromate =
      dto.leadChromateStatus === AdulterationTestStatus.POSITIVE_ADULTERATED;
    const hasMetanilYellow =
      dto.metanilYellowStatus === AdulterationTestStatus.POSITIVE_ADULTERATED;

    const isAdulterated = hasSudanDye || hasLeadChromate || hasMetanilYellow;
    const isAflatoxinExceeded = dto.aflatoxinB1Ppb > 5.0; // EU/BSTI max 5 ppb
    const isMoistureExceeded = dto.moisturePct > 10.0;

    let purityGrade = SpicePurityGrade.PURE_GRADE_AAA_EXPORT;
    let verdict = 'VERIFIED_PURE_AUTHENTIC';
    let safetyNotes =
      'Sample passed all spectroscopic tests. Zero toxic dyes, lead, or aflatoxin contamination detected.';

    if (isAdulterated) {
      purityGrade = SpicePurityGrade.ADULTERATED_REJECTED;
      verdict = 'CRITICAL_TOXIC_ADULTERATION_DETECTED';
      const toxins = [];
      if (hasSudanDye) toxins.push('Carcinogenic Sudan Dyes (I-IV)');
      if (hasLeadChromate) toxins.push('Toxic Lead Chromate (PbCrO4)');
      if (hasMetanilYellow) toxins.push('Banned Metanil Yellow Dye');
      safetyNotes = `SEIZURE ORDER: Contains ${toxins.join(', ')}. Referred to Bangladesh Food Safety Authority mobile court.`;
    } else if (isAflatoxinExceeded) {
      purityGrade = SpicePurityGrade.SUBSTANDARD_INDUSTRIAL;
      verdict = 'AFLATOXIN_MOLD_THRESHOLD_EXCEEDED';
      safetyNotes = `Aflatoxin B1 at ${dto.aflatoxinB1Ppb} ppb exceeds 5.0 ppb safety threshold. Rejected for human table consumption.`;
    } else if (isMoistureExceeded) {
      purityGrade = SpicePurityGrade.STANDARD_GRADE_A_DOMESTIC;
      verdict = 'EXCESS_MOISTURE_WARNING';
      safetyNotes = `Moisture at ${dto.moisturePct}% exceeds safe 10.0% limit. Redrying recommended prior to packaging.`;
    }

    // Bioactive Potency Score (0 - 100)
    let potencyScore = 80;
    if (dto.spiceType === SpiceType.TURMERIC && dto.curcuminPct) {
      // 5.0% curcumin = 100
      potencyScore = Math.min(100, Math.round((dto.curcuminPct / 5.0) * 100));
    } else if (dto.spiceType === SpiceType.CHILLI && dto.scovilleHeatUnits) {
      // 50,000 SHU = 100
      potencyScore = Math.min(
        100,
        Math.round((dto.scovilleHeatUnits / 50000) * 100),
      );
    } else if (dto.spiceType === SpiceType.CORIANDER && dto.essentialOilPct) {
      // 1.0% oil = 100
      potencyScore = Math.min(
        100,
        Math.round((dto.essentialOilPct / 1.0) * 100),
      );
    }

    return {
      spiceType: dto.spiceType,
      isAdulterated,
      isAflatoxinExceeded,
      isMoistureExceeded,
      purityGrade,
      verdict,
      safetyNotes,
      potencyScore,
      bstiComplianceApproved:
        !isAdulterated && !isAflatoxinExceeded && !isMoistureExceeded,
    };
  }

  // 3. Drying Batches CRUD & Telemetry
  async getDryingBatches(
    spiceType?: SpiceType,
    region?: SpiceRegion,
    status?: DryingBatchStatus,
  ): Promise<SpiceDryingBatch[]> {
    const qb = this.batchRepo.createQueryBuilder('b');

    if (spiceType) {
      qb.andWhere('b.spiceType = :spiceType', { spiceType });
    }
    if (region) {
      qb.andWhere('b.region = :region', { region });
    }
    if (status) {
      qb.andWhere('b.status = :status', { status });
    }

    qb.orderBy('b.createdAt', 'DESC');
    return qb.getMany();
  }

  async getDryingBatchById(id: string): Promise<SpiceDryingBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Spice drying batch with ID ${id} not found`);
    }
    return batch;
  }

  async createDryingBatch(
    dto: CreateSpiceDryingBatchDto,
  ): Promise<SpiceDryingBatch> {
    const count = await this.batchRepo.count();
    const regionCode = dto.region.split('_')[0].slice(0, 3);
    const batchNumber = `SPICE-DRY-${new Date().getFullYear()}-${regionCode}-${String(count + 1).padStart(3, '0')}`;

    // Calculate approximate dry weight based on 10% target
    const dryMatter = dto.initialFreshWeightKg * (1 - dto.currentMoisturePct / 100);
    const estimatedDryWeight = Math.round(dryMatter / 0.9);

    const newBatch = this.batchRepo.create({
      ...dto,
      batchNumber,
      currentDryWeightKg: estimatedDryWeight,
      dryingDaysElapsed: 0,
      aflatoxinRiskLevel: AflatoxinRiskLevel.SAFE_ZERO_RISK,
      status: DryingBatchStatus.DRYING_IN_PROGRESS,
    });

    return this.batchRepo.save(newBatch);
  }

  async updateBatchTelemetry(
    id: string,
    dto: UpdateBatchTelemetryDto,
  ): Promise<SpiceDryingBatch> {
    const batch = await this.getDryingBatchById(id);

    batch.chamberTempCelsius = dto.chamberTempCelsius;
    batch.chamberHumidityPct = dto.chamberHumidityPct;
    batch.currentMoisturePct = dto.currentMoisturePct;
    batch.dryingDaysElapsed = dto.dryingDaysElapsed;

    // Recalculate dry weight
    const dryMatter = batch.initialFreshWeightKg * 0.22; // approx 22% dry matter
    batch.currentDryWeightKg = Math.round(
      dryMatter / (1 - dto.currentMoisturePct / 100),
    );

    // Dynamic Aflatoxin risk assessment
    if (dto.aflatoxinRiskLevel) {
      batch.aflatoxinRiskLevel = dto.aflatoxinRiskLevel;
    } else {
      if (dto.chamberHumidityPct > 70.0 && dto.currentMoisturePct > 15.0) {
        batch.aflatoxinRiskLevel = AflatoxinRiskLevel.CRITICAL_MOLD_HAZARD;
      } else if (dto.chamberHumidityPct > 55.0 || dto.currentMoisturePct > 12.0) {
        batch.aflatoxinRiskLevel = AflatoxinRiskLevel.MODERATE_CONDENSATION_WATCH;
      } else {
        batch.aflatoxinRiskLevel = AflatoxinRiskLevel.SAFE_ZERO_RISK;
      }
    }

    if (dto.status) {
      batch.status = dto.status;
    } else if (dto.currentMoisturePct <= 9.5) {
      batch.status = DryingBatchStatus.DEHYDRATION_COMPLETED;
    }

    return this.batchRepo.save(batch);
  }

  // 4. BSTI Lab Tests CRUD
  async getLabTests(
    spiceType?: SpiceType,
    purityGrade?: SpicePurityGrade,
  ): Promise<SpicePurityLabTest[]> {
    const qb = this.labRepo.createQueryBuilder('t');

    if (spiceType) {
      qb.andWhere('t.spiceType = :spiceType', { spiceType });
    }
    if (purityGrade) {
      qb.andWhere('t.purityGrade = :purityGrade', { purityGrade });
    }

    qb.orderBy('t.createdAt', 'DESC');
    return qb.getMany();
  }

  async getLabTestById(id: string): Promise<SpicePurityLabTest> {
    const test = await this.labRepo.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Lab test report with ID ${id} not found`);
    }
    return test;
  }

  async createLabTest(
    dto: CreateSpicePurityLabTestDto,
  ): Promise<SpicePurityLabTest> {
    const count = await this.labRepo.count();
    const testReportNumber = `BSTI-LAB-${new Date().getFullYear()}-SP-${String(count + 1).padStart(4, '0')}`;

    const isAdulterated =
      dto.sudanDyeStatus === AdulterationTestStatus.POSITIVE_ADULTERATED ||
      dto.leadChromateStatus === AdulterationTestStatus.POSITIVE_ADULTERATED ||
      dto.metanilYellowStatus === AdulterationTestStatus.POSITIVE_ADULTERATED;

    const isSafe = !isAdulterated && dto.aflatoxinB1Ppb <= 5.0 && dto.moisturePct <= 10.0;

    let purityGrade = SpicePurityGrade.PURE_GRADE_AAA_EXPORT;
    if (isAdulterated) {
      purityGrade = SpicePurityGrade.ADULTERATED_REJECTED;
    } else if (dto.aflatoxinB1Ppb > 5.0) {
      purityGrade = SpicePurityGrade.SUBSTANDARD_INDUSTRIAL;
    } else if (dto.moisturePct > 10.0) {
      purityGrade = SpicePurityGrade.STANDARD_GRADE_A_DOMESTIC;
    }

    const authenticitySealNumber = isSafe
      ? `BSTI-PURE-${dto.spiceType}-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
      : undefined;

    const newTest = this.labRepo.create({
      ...dto,
      testReportNumber,
      purityGrade,
      certificateIssued: isSafe,
      authenticitySealNumber,
    });

    return this.labRepo.save(newTest);
  }

  // 5. Forward Pure Spice Lots CRUD & Purchase
  async getForwardLots(
    spiceType?: SpiceType,
    region?: SpiceRegion,
    status?: SpiceLotStatus,
  ): Promise<SpiceForwardLot[]> {
    const qb = this.lotRepo.createQueryBuilder('l');

    if (spiceType) {
      qb.andWhere('l.spiceType = :spiceType', { spiceType });
    }
    if (region) {
      qb.andWhere('l.originRegion = :region', { region });
    }
    if (status) {
      qb.andWhere('l.status = :status', { status });
    }

    qb.orderBy('l.createdAt', 'DESC');
    return qb.getMany();
  }

  async getForwardLotById(id: string): Promise<SpiceForwardLot> {
    const lot = await this.lotRepo.findOne({ where: { id } });
    if (!lot) {
      throw new NotFoundException(`Spice forward lot with ID ${id} not found`);
    }
    return lot;
  }

  async createForwardLot(
    dto: CreateSpiceForwardLotDto,
  ): Promise<SpiceForwardLot> {
    const count = await this.lotRepo.count();
    const lotCode = `LOT-${new Date().getFullYear()}-${dto.spiceType.slice(0, 4)}-${String(count + 1).padStart(3, '0')}`;
    const totalValueBdt = Math.round(dto.totalQuantityKg * dto.pricePerKgBdt);

    const newLot = this.lotRepo.create({
      ...dto,
      lotCode,
      totalValueBdt,
      availableQuantityKg: dto.totalQuantityKg,
      purityGrade: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
      status: SpiceLotStatus.AVAILABLE_FOR_SALE,
    });

    return this.lotRepo.save(newLot);
  }

  async purchaseSpiceLot(
    id: string,
    dto: PurchaseSpiceLotDto,
  ): Promise<SpiceForwardLot> {
    const lot = await this.getForwardLotById(id);

    if (lot.status !== SpiceLotStatus.AVAILABLE_FOR_SALE) {
      throw new BadRequestException(
        `Lot is not available for purchase (current status: ${lot.status})`,
      );
    }

    if (dto.orderQuantityKg < lot.minimumOrderKg) {
      throw new BadRequestException(
        `Order quantity ${dto.orderQuantityKg} kg is below minimum order requirement of ${lot.minimumOrderKg} kg`,
      );
    }

    if (dto.orderQuantityKg > lot.availableQuantityKg) {
      throw new BadRequestException(
        `Requested quantity ${dto.orderQuantityKg} kg exceeds available stock of ${lot.availableQuantityKg} kg`,
      );
    }

    lot.availableQuantityKg -= dto.orderQuantityKg;
    if (lot.availableQuantityKg <= 0) {
      lot.status = SpiceLotStatus.DISPATCHED_SOLD;
    } else {
      lot.status = SpiceLotStatus.AVAILABLE_FOR_SALE;
    }

    return this.lotRepo.save(lot);
  }
}
