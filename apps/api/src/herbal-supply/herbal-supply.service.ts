import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HerbalBatch } from './entities/herbal-batch.entity.js';
import { PharmaSourcingContract } from './entities/pharma-sourcing-contract.entity.js';
import { HerbalMoistureAudit } from './entities/herbal-moisture-audit.entity.js';
import {
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
  GACPStandardGrade,
  LabCertificateStatus,
  SourcingContractStatus,
} from './enums/herbal-supply.enum.js';
import {
  CreateHerbalBatchDto,
  UpdateHerbalBatchDto,
  CreatePharmaContractDto,
  RecordMoistureAuditDto,
  FreshToDryCalculatorDto,
  QueryHerbalBatchesDto,
} from './dto/herbal-supply.dto.js';

@Injectable()
export class HerbalSupplyService implements OnModuleInit {
  private readonly logger = new Logger(HerbalSupplyService.name);

  constructor(
    @InjectRepository(HerbalBatch)
    private readonly batchRepo: Repository<HerbalBatch>,
    @InjectRepository(PharmaSourcingContract)
    private readonly contractRepo: Repository<PharmaSourcingContract>,
    @InjectRepository(HerbalMoistureAudit)
    private readonly auditRepo: Repository<HerbalMoistureAudit>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  /**
   * Seed authentic Bangladeshi Medicinal Plant Stocks and Pharma Sourcing Contracts
   */
  async seedBaselineData() {
    const existingBatches = await this.batchRepo.count();
    if (existingBatches > 0) return;

    this.logger.log('Seeding authentic Bangladeshi Organic Herbal and Medicinal Batches...');

    // 1. Natore Laxmipur Kholabaria Kalomegh
    const b1 = this.batchRepo.create({
      growerId: 'grower-natore-001',
      cooperativeName: 'Laxmipur Kholabaria Oushodhi Krishi Samity, Natore',
      growerPhone: '01712987654',
      growerDistrict: 'Natore',
      growerUpazila: 'Natore Sadar',
      batchNumber: 'HERB-2026-NTR-881',
      species: HerbalSpecies.KALOMEGH,
      scientificName: 'Andrographis paniculata',
      plantPart: PlantPartUsed.LEAF_DRIED,
      processingState: ProcessingState.SHADE_DRIED_WHOLE,
      harvestedDate: '2026-09-15',
      totalWeightKg: 1200,
      moistureContentPercentage: 8.8,
      activePhytochemicalPercentage: 2.6,
      phytochemicalMarkerName: 'Andrographolide Active Purity',
      labReportNumber: 'DGDA-HERB-2026-441',
      testingLaboratory: 'BCSIR Central Laboratory, Dhaka',
      gacpGrade: GACPStandardGrade.PHARMA_GRADE_A,
      certStatus: LabCertificateStatus.TESTED_COMPLIANT_DGDA,
      pricePerKgBdt: 320,
      minOrderKg: 50,
      isOrganicCertified: true,
      storageWarehouseConditions: 'Dehumidified pallet storage below 45% relative humidity',
      isAvailable: true,
      description:
        'Premium shade-dried Kalomegh leaves cultivated with bio-fertilizers. Certified free of heavy metals and aflatoxin, ideal for hepatoprotective formulations.',
    });

    // 2. Natore Ashwagandha Roots
    const b2 = this.batchRepo.create({
      growerId: 'grower-natore-001',
      cooperativeName: 'Laxmipur Kholabaria Oushodhi Krishi Samity, Natore',
      growerPhone: '01712987654',
      growerDistrict: 'Natore',
      growerUpazila: 'Natore Sadar',
      batchNumber: 'HERB-2026-NTR-892',
      species: HerbalSpecies.ASHWAGANDHA,
      scientificName: 'Withania somnifera',
      plantPart: PlantPartUsed.ROOT_RHIZOME,
      processingState: ProcessingState.SOLAR_DEHYDRATED_CHOPPED,
      harvestedDate: '2026-09-20',
      totalWeightKg: 650,
      moistureContentPercentage: 9.2,
      activePhytochemicalPercentage: 1.85,
      phytochemicalMarkerName: 'Withanolides Purity Index',
      labReportNumber: 'DGDA-HERB-2026-455',
      testingLaboratory: 'Department of Pharmacy, University of Dhaka',
      gacpGrade: GACPStandardGrade.PHARMA_GRADE_A,
      certStatus: LabCertificateStatus.TESTED_COMPLIANT_DGDA,
      pricePerKgBdt: 580,
      minOrderKg: 25,
      isOrganicCertified: true,
      storageWarehouseConditions: 'Vacuum-sealed moisture barrier bags',
      isAvailable: true,
      description:
        'Starch-rich Ashwagandha dried root cuts. Optimal for adaptogenic stress-relief syrups and tonic capsules.',
    });

    // 3. Tangail Madhupur Vasaka Leaves
    const b3 = this.batchRepo.create({
      growerId: 'grower-tangail-002',
      cooperativeName: 'Madhupur Indigenous Herbal Growers Society',
      growerPhone: '01819345671',
      growerDistrict: 'Tangail',
      growerUpazila: 'Madhupur',
      batchNumber: 'HERB-2026-TNG-104',
      species: HerbalSpecies.VASAKA,
      scientificName: 'Justicia adhatoda',
      plantPart: PlantPartUsed.LEAF_DRIED,
      processingState: ProcessingState.SHADE_DRIED_WHOLE,
      harvestedDate: '2026-10-01',
      totalWeightKg: 900,
      moistureContentPercentage: 8.5,
      activePhytochemicalPercentage: 1.25,
      phytochemicalMarkerName: 'Vasicine Alkaloid',
      labReportNumber: 'DGDA-HERB-2026-478',
      testingLaboratory: 'Square Pharma R&D Analytical Lab, Gazipur',
      gacpGrade: GACPStandardGrade.PHARMA_GRADE_A,
      certStatus: LabCertificateStatus.TESTED_COMPLIANT_DGDA,
      pricePerKgBdt: 290,
      minOrderKg: 40,
      isOrganicCertified: true,
      storageWarehouseConditions: 'Controlled ventilation, shaded botanical racks',
      isAvailable: true,
      description:
        'GACP certified Vasaka leaves harvested in morning dew, immediately dried under solar canopy to prevent alkaloid degradation. Crucial for cough syrups.',
    });

    // 4. Rangpur Krishna Tulsi
    const b4 = this.batchRepo.create({
      growerId: 'grower-rangpur-003',
      cooperativeName: 'Teesta Basin Organic Tulsi Producers Club',
      growerPhone: '01711234560',
      growerDistrict: 'Rangpur',
      growerUpazila: 'Gangachhara',
      batchNumber: 'HERB-2026-RNG-309',
      species: HerbalSpecies.TULSI_KRISHNA_RAMA,
      scientificName: 'Ocimum sanctum',
      plantPart: PlantPartUsed.LEAF_DRIED,
      processingState: ProcessingState.FINE_PULVERIZED_POWDER,
      harvestedDate: '2026-10-05',
      totalWeightKg: 500,
      moistureContentPercentage: 8.0,
      activePhytochemicalPercentage: 0.95,
      phytochemicalMarkerName: 'Eugenol Essential Oil',
      labReportNumber: 'DGDA-HERB-2026-490',
      testingLaboratory: 'BCSIR Rajshahi Regional Centre',
      gacpGrade: GACPStandardGrade.PHARMA_GRADE_A,
      certStatus: LabCertificateStatus.TESTED_COMPLIANT_DGDA,
      pricePerKgBdt: 360,
      minOrderKg: 20,
      isOrganicCertified: true,
      storageWarehouseConditions: 'Airtight tin containers with food-grade silica gel',
      isAvailable: true,
      description:
        'Micro-pulverized Krishna Tulsi leaf powder with potent aroma. 100% pure botanical without foreign dust.',
    });

    await this.batchRepo.save([b1, b2, b3, b4]);

    // Seed Pharma Sourcing Contracts
    const c1 = this.contractRepo.create({
      contractNumber: 'PHARMA-CNT-2026-901',
      pharmaCompanyId: 'pharma-square-001',
      buyerCompanyName: 'Square Herbal & Nutraceuticals Ltd.',
      buyerContactPerson: 'Dr. M. A. Hasan (Head of Botanical Sourcing)',
      buyerPhone: '01713009988',
      sellerCooperativeId: 'grower-natore-001',
      cooperativeName: 'Laxmipur Kholabaria Oushodhi Krishi Samity, Natore',
      species: HerbalSpecies.KALOMEGH,
      plantPart: PlantPartUsed.LEAF_DRIED,
      processingState: ProcessingState.SHADE_DRIED_WHOLE,
      targetWeightKg: 2000,
      agreedPricePerKgBdt: 320,
      maxAllowedMoisturePercentage: 10.0,
      deliveryDeadline: '2026-11-15',
      destinationWarehouseDistrict: 'Gazipur (Square Herbal Factory Hub)',
      escrowAdvanceAmountBdt: 192000, // 30% advance
      finalSettlementAmountBdt: 640000,
      contractStatus: SourcingContractStatus.CONTRACT_ACTIVE,
      specialPharmacopoeiaSpecifications:
        'Compliant with Bangladesh National Ayurvedic Formulary (BNAF). Minimum 2.0% andrographolide by HPLC.',
    });

    const c2 = this.contractRepo.create({
      contractNumber: 'PHARMA-CNT-2026-902',
      pharmaCompanyId: 'pharma-hamdard-002',
      buyerCompanyName: 'Hamdard Laboratories (Waqf) Bangladesh',
      buyerContactPerson: 'Hakim Shamsul Huda (Plant Production Director)',
      buyerPhone: '01819223344',
      sellerCooperativeId: 'grower-tangail-002',
      cooperativeName: 'Madhupur Indigenous Herbal Growers Society',
      species: HerbalSpecies.VASAKA,
      plantPart: PlantPartUsed.LEAF_DRIED,
      processingState: ProcessingState.SHADE_DRIED_WHOLE,
      targetWeightKg: 1500,
      agreedPricePerKgBdt: 290,
      maxAllowedMoisturePercentage: 9.5,
      deliveryDeadline: '2026-11-20',
      destinationWarehouseDistrict: 'Sonargaon, Narayanganj (Hamdard Industrial City)',
      escrowAdvanceAmountBdt: 130500,
      finalSettlementAmountBdt: 435000,
      contractStatus: SourcingContractStatus.CONTRACT_ACTIVE,
      specialPharmacopoeiaSpecifications:
        'Zero microbial contamination, dried leaf moisture strictly <= 9.5% for Sualin production batch.',
    });

    await this.contractRepo.save([c1, c2]);

    this.logger.log('Herbal supply seed complete: 4 Batches, 2 Pharma Contracts.');
  }

  /**
   * High-Level Overview Metrics
   */
  async getOverviewStats(): Promise<{
    totalBatchesAvailable: number;
    totalActiveWeightKg: number;
    averageMoisturePercentage: number;
    pharmaGradePercentage: number;
    activePharmaContracts: number;
    totalHerbalTradeVolumeBdt: number;
  }> {
    const batches = await this.batchRepo.find();
    const contracts = await this.contractRepo.find();

    const totalWeight = batches.reduce((sum, b) => sum + Number(b.totalWeightKg), 0);
    const avgMoisture =
      batches.length > 0
        ? Number((batches.reduce((sum, b) => sum + Number(b.moistureContentPercentage), 0) / batches.length).toFixed(1))
        : 9.0;

    const pharmaGradeCount = batches.filter((b) => b.gacpGrade === GACPStandardGrade.PHARMA_GRADE_A).length;
    const pharmaPct = batches.length > 0 ? Number(((pharmaGradeCount / batches.length) * 100).toFixed(1)) : 100;

    const activeContractsCount = contracts.filter((c) => c.contractStatus === SourcingContractStatus.CONTRACT_ACTIVE).length;
    const totalTrade = contracts.reduce((sum, c) => sum + Number(c.finalSettlementAmountBdt), 0);

    return {
      totalBatchesAvailable: batches.length,
      totalActiveWeightKg: totalWeight,
      averageMoisturePercentage: avgMoisture,
      pharmaGradePercentage: pharmaPct,
      activePharmaContracts: activeContractsCount,
      totalHerbalTradeVolumeBdt: totalTrade,
    };
  }

  /**
   * Search / Filter Botanical Batches
   */
  async getBatches(query?: QueryHerbalBatchesDto): Promise<HerbalBatch[]> {
    const qb = this.batchRepo.createQueryBuilder('batch').where('batch.isAvailable = :isAvail', { isAvail: true });

    if (query?.species) {
      qb.andWhere('batch.species = :species', { species: query.species });
    }

    if (query?.district) {
      qb.andWhere('LOWER(batch.growerDistrict) LIKE LOWER(:district)', {
        district: `%${query.district}%`,
      });
    }

    if (query?.gacpGrade) {
      qb.andWhere('batch.gacpGrade = :gacpGrade', { gacpGrade: query.gacpGrade });
    }

    if (query?.pharmaGradeOnly) {
      qb.andWhere('batch.gacpGrade = :pharmaGrade', { pharmaGrade: GACPStandardGrade.PHARMA_GRADE_A });
    }

    qb.orderBy('batch.createdAt', 'DESC');
    return qb.getMany();
  }

  /**
   * Get Batch Details with Quality Audits
   */
  async getBatchById(id: string): Promise<HerbalBatch> {
    const batch = await this.batchRepo.findOne({
      where: { id },
      relations: ['audits'],
    });

    if (!batch) {
      throw new NotFoundException(`Herbal batch with ID ${id} not found.`);
    }

    return batch;
  }

  /**
   * Register New Harvested Herbal Batch
   */
  async createBatch(growerId: string, dto: CreateHerbalBatchDto): Promise<HerbalBatch> {
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
    const prefix = dto.growerDistrict.substring(0, 3).toUpperCase();
    const batchNumber = `HERB-${new Date().getFullYear()}-${prefix}-${randomSuffix}`;

    const batch = this.batchRepo.create({
      ...dto,
      growerId,
      batchNumber,
      isAvailable: true,
    });

    return this.batchRepo.save(batch);
  }

  /**
   * Update Batch
   */
  async updateBatch(id: string, dto: UpdateHerbalBatchDto): Promise<HerbalBatch> {
    const batch = await this.getBatchById(id);
    Object.assign(batch, dto);
    return this.batchRepo.save(batch);
  }

  /**
   * Grower's Own Batches
   */
  async getGrowerBatches(growerId: string): Promise<HerbalBatch[]> {
    return this.batchRepo.find({
      where: { growerId },
      relations: ['audits'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Fresh-to-Dry Biomass Conversion Calculator
   * Determines expected dried medicinal yield, water loss, and economic net advantage
   */
  calculateFreshToDryBiomass(dto: FreshToDryCalculatorDto): {
    freshHarvestKg: number;
    expectedDryYieldKg: number;
    waterLossPercentage: number;
    conversionRatioText: string;
    freshFarmgatePriceEstimateBdt: number;
    driedPharmaPriceEstimateBdt: number;
    netFarmerAdvantageBdt: number;
    advantagePercentage: number;
    recommendationBn: string;
  } {
    let ratio = 4.5; // default 4.5:1 (22% yield)
    let freshRatePerKg = 40;
    let driedPharmaRatePerKg = 300;

    switch (dto.plantPart) {
      case PlantPartUsed.LEAF_DRIED:
        ratio = 5.5; // 18.2% dry yield
        freshRatePerKg = 45;
        driedPharmaRatePerKg = 310;
        break;
      case PlantPartUsed.ROOT_RHIZOME:
        ratio = 3.8; // 26.3% dry yield
        freshRatePerKg = 90;
        driedPharmaRatePerKg = 520;
        break;
      case PlantPartUsed.GEL_EXTRACT:
        ratio = 18.0; // 5.5% dry solids
        freshRatePerKg = 20;
        driedPharmaRatePerKg = 550;
        break;
      case PlantPartUsed.FRUIT_SEED:
        ratio = 4.2; // 23.8% dry yield
        freshRatePerKg = 50;
        driedPharmaRatePerKg = 280;
        break;
      case PlantPartUsed.BARK_STEM:
        ratio = 3.2; // 31.2% dry yield
        freshRatePerKg = 60;
        driedPharmaRatePerKg = 260;
        break;
      default:
        ratio = 4.5;
        freshRatePerKg = 40;
        driedPharmaRatePerKg = 300;
    }

    const expectedDryYieldKg = Number((dto.freshHarvestKg / ratio).toFixed(2));
    const waterLossPercentage = Number(((1 - 1 / ratio) * 100).toFixed(1));

    const freshFarmgatePriceEstimateBdt = Math.round(dto.freshHarvestKg * freshRatePerKg);
    const driedPharmaPriceEstimateBdt = Math.round(expectedDryYieldKg * driedPharmaRatePerKg);
    const netFarmerAdvantageBdt = Math.max(0, driedPharmaPriceEstimateBdt - freshFarmgatePriceEstimateBdt);
    const advantagePercentage = Number(
      ((netFarmerAdvantageBdt / freshFarmgatePriceEstimateBdt) * 100).toFixed(1),
    );

    const recommendationBn = `কাঁচা বিক্রির চেয়ে সৌর ড্রায়ারে আর্দ্রতা ১০% এর নিচে শুকিয়ে এ-গ্রেড সনদে বিক্রি করলে প্রতি কেজিতে প্রায় +${advantagePercentage}% বাড়তি নিট মুনাফা নিশ্চিত হয়।`;

    return {
      freshHarvestKg: dto.freshHarvestKg,
      expectedDryYieldKg,
      waterLossPercentage,
      conversionRatioText: `${ratio}:1 (${(100 / ratio).toFixed(1)}% শুষ্ক ফলন)`,
      freshFarmgatePriceEstimateBdt,
      driedPharmaPriceEstimateBdt,
      netFarmerAdvantageBdt,
      advantagePercentage,
      recommendationBn,
    };
  }

  /**
   * Record Moisture & Heavy Metal Quality Audit
   */
  async recordMoistureAudit(inspectorId: string, dto: RecordMoistureAuditDto): Promise<HerbalMoistureAudit> {
    const batch = await this.getBatchById(dto.batchId);

    let evaluatedGrade: GACPStandardGrade = GACPStandardGrade.PHARMA_GRADE_A;
    let certStatus: LabCertificateStatus = LabCertificateStatus.TESTED_COMPLIANT_DGDA;
    let complianceVerdictBn = 'ফার্মাকোপিয়া আর্দ্রতা মান (<১০%) উত্তীর্ণ। ঔষধ কারখানার জন্য অনুমোদিত।';

    if (dto.isAflatoxinDetected || (dto.leadHeavyMetalPpm && dto.leadHeavyMetalPpm > 0.5)) {
      evaluatedGrade = GACPStandardGrade.RAW_UNSORTED_C;
      certStatus = LabCertificateStatus.REJECTED_EXCESS_MOISTURE_OR_MOLD;
      complianceVerdictBn = 'ক্ষতিকর ছত্রাক বা অতিরিক্ত ভারী ধাতু শনাক্ত! ওষুধ উৎপাদনে ব্যবহারের অনুপযুক্ত।';
    } else if (dto.testedMoisturePercentage > 12.0) {
      evaluatedGrade = GACPStandardGrade.RAW_UNSORTED_C;
      certStatus = LabCertificateStatus.REJECTED_EXCESS_MOISTURE_OR_MOLD;
      complianceVerdictBn = `অতিরিক্ত আর্দ্রতা (${dto.testedMoisturePercentage}%)! ছত্রাক রোধে পুনরায় সৌর ড্রায়ারে শুকাতে হবে।`;
    } else if (dto.testedMoisturePercentage > 10.0) {
      evaluatedGrade = GACPStandardGrade.COMMERCIAL_GRADE_B;
      complianceVerdictBn = `বাণিজ্যিক বি-গ্রেড (${dto.testedMoisturePercentage}% আর্দ্রতা)। স্থানীয় বাজারের জন্য উপযোগী।`;
    }

    const audit = this.auditRepo.create({
      batchId: dto.batchId,
      inspectorId,
      inspectorName: dto.inspectorName,
      testedMoisturePercentage: dto.testedMoisturePercentage,
      isAflatoxinDetected: dto.isAflatoxinDetected || false,
      leadHeavyMetalPpm: dto.leadHeavyMetalPpm || 0.05,
      foreignMatterPercentage: dto.foreignMatterPercentage || 0.2,
      evaluatedGrade,
      complianceVerdictBn,
      inspectorNotes: dto.inspectorNotes || null,
    });

    const savedAudit = await this.auditRepo.save(audit);

    // Update parent batch moisture and grade
    batch.moistureContentPercentage = dto.testedMoisturePercentage;
    batch.gacpGrade = evaluatedGrade;
    batch.certStatus = certStatus;
    await this.batchRepo.save(batch);

    return savedAudit;
  }

  /**
   * Institutional Sourcing Contract Management
   */
  async createPharmaContract(pharmaCompanyId: string, dto: CreatePharmaContractDto): Promise<PharmaSourcingContract> {
    const finalAmount = Math.round(Number(dto.targetWeightKg) * Number(dto.agreedPricePerKgBdt));
    const advanceAmount = Math.round(finalAmount * 0.3); // 30% advance escrow
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
    const contractNumber = `PHARMA-CNT-${new Date().getFullYear()}-${randomSuffix}`;

    const contract = this.contractRepo.create({
      ...dto,
      contractNumber,
      pharmaCompanyId,
      escrowAdvanceAmountBdt: advanceAmount,
      finalSettlementAmountBdt: finalAmount,
      contractStatus: SourcingContractStatus.CONTRACT_ACTIVE,
    });

    return this.contractRepo.save(contract);
  }

  /**
   * Get Contracts
   */
  async getPharmaContracts(companyId?: string): Promise<PharmaSourcingContract[]> {
    if (companyId) {
      return this.contractRepo.find({
        where: { pharmaCompanyId: companyId },
        order: { createdAt: 'DESC' },
      });
    }
    return this.contractRepo.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Update Contract Status (e.g. FULFILLED_ACCEPTED)
   */
  async updateContractStatus(id: string, status: SourcingContractStatus): Promise<PharmaSourcingContract> {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found.`);
    }

    contract.contractStatus = status;
    if (status === SourcingContractStatus.FULFILLED_ACCEPTED) {
      contract.acceptedAt = new Date();
    }

    return this.contractRepo.save(contract);
  }
}
