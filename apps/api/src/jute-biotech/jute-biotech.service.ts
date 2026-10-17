import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JuteRettingBatch } from './entities/jute-retting-batch.entity.js';
import { JuteFiberLot } from './entities/jute-fiber-lot.entity.js';
import { JuteB2bContract } from './entities/jute-b2b-contract.entity.js';
import {
  JuteVariety,
  JuteFiberGrade,
  RettingMethod,
  RettingStatus,
  BaleType,
  PackagingActCategory,
  BalingEscrowStatus,
} from './enums/jute-biotech.enum.js';
import {
  CalculateMoistureDeductionDto,
  EvaluateRettingPondDto,
  CreateRettingBatchDto,
  UpdateRettingTelemetryDto,
  CreateFiberLotDto,
  CreateB2bContractDto,
} from './dto/jute-biotech.dto.js';

@Injectable()
export class JuteBiotechService implements OnModuleInit {
  private readonly logger = new Logger(JuteBiotechService.name);

  constructor(
    @InjectRepository(JuteRettingBatch)
    private readonly rettingRepo: Repository<JuteRettingBatch>,
    @InjectRepository(JuteFiberLot)
    private readonly lotRepo: Repository<JuteFiberLot>,
    @InjectRepository(JuteB2bContract)
    private readonly contractRepo: Repository<JuteB2bContract>,
  ) {}

  async onModuleInit() {
    await this.seedInitialJuteData();
  }

  private async seedInitialJuteData() {
    try {
      const rettingCount = await this.rettingRepo.count();
      if (rettingCount === 0) {
        this.logger.log('Seeding initial Jute Retting Batches...');
        await this.rettingRepo.save([
          {
            batchCode: 'BJRI-RET-2026-FRP-01',
            farmerName: 'Md. Akram Hossain Mollah',
            farmerPhone: '+8801711223344',
            district: 'Faridpur',
            upazila: 'Faridpur Sadar',
            waterSourceType: 'Padma Tributary Canal',
            variety: JuteVariety.TOSSA_JUTE,
            rettingMethod: RettingMethod.RIBBON_RETTING_ENZYMATIC,
            microbialInoculantUsed: true,
            inoculantStrainCode: 'BJRI-PectinoConsortium-B4',
            steepingDate: '2026-07-10',
            expectedHarvestDate: '2026-07-19',
            daysElapsed: 7,
            waterTempCelsius: 31.0,
            waterPh: 7.2,
            dissolvedOxygenMgL: 4.5,
            status: RettingStatus.ACTIVE_MICROBIAL_RETTING,
            targetFiberYieldMaunds: 65.0,
            bjriFieldOfficer: 'Dr. Rafiqul Islam, Senior Scientific Officer',
            notes: 'Ribbon retting with BJRI bacterial formulation. Retting pace is 2.2x faster than traditional whole plant retting with lustrous golden sheen.',
          },
          {
            batchCode: 'BJRI-RET-2026-RNG-04',
            farmerName: 'Alhaj Motiur Rahman',
            farmerPhone: '+8801822334455',
            district: 'Rangpur',
            upazila: 'Badarganj',
            waterSourceType: 'Community Geo-Membrane Tank',
            variety: JuteVariety.WHITE_JUTE,
            rettingMethod: RettingMethod.RIBBON_RETTING_ENZYMATIC,
            microbialInoculantUsed: true,
            inoculantStrainCode: 'BJRI-PectinoConsortium-B4',
            steepingDate: '2026-07-08',
            expectedHarvestDate: '2026-07-17',
            daysElapsed: 9,
            waterTempCelsius: 29.5,
            waterPh: 7.0,
            dissolvedOxygenMgL: 3.8,
            status: RettingStatus.FIBER_SEPARATION_READY,
            targetFiberYieldMaunds: 48.0,
            bjriFieldOfficer: 'Nazmul Haque, Extension Agronomist',
            notes: 'Gummy pectin completely decomposed. Fiber slips smoothly off stick ribbons with zero bark adherence.',
          },
          {
            batchCode: 'BJRI-RET-2026-JSR-09',
            farmerName: 'Shankar Kumar Ghosh',
            farmerPhone: '+8801933445566',
            district: 'Jessore',
            upazila: 'Jhikargachha',
            waterSourceType: 'Bhairab River Oxbow Bend',
            variety: JuteVariety.TOSSA_JUTE,
            rettingMethod: RettingMethod.CONVENTIONAL_WHOLE_PLANT_STEEP,
            microbialInoculantUsed: false,
            inoculantStrainCode: 'NATURAL_POND_FLORA',
            steepingDate: '2026-06-28',
            expectedHarvestDate: '2026-07-18',
            daysElapsed: 18,
            waterTempCelsius: 32.5,
            waterPh: 6.8,
            dissolvedOxygenMgL: 2.1,
            status: RettingStatus.FIBER_SEPARATION_READY,
            targetFiberYieldMaunds: 55.0,
            bjriFieldOfficer: 'Kazi Mahbub, Upazila Jute Officer',
            notes: 'Traditional steeping jacketed with water hyacinth covers. Ready for manual peeling and clean canal washing.',
          },
          {
            batchCode: 'BJRI-RET-2026-JML-12',
            farmerName: 'Abdur Rashid Master',
            farmerPhone: '+8801744556677',
            district: 'Jamalpur',
            upazila: 'Melandaha',
            waterSourceType: 'Brahmaputra Floodplain Canal',
            variety: JuteVariety.TOSSA_JUTE,
            rettingMethod: RettingMethod.RIBBON_RETTING_ENZYMATIC,
            microbialInoculantUsed: true,
            inoculantStrainCode: 'BJRI-PectinoConsortium-B4',
            steepingDate: '2026-07-13',
            expectedHarvestDate: '2026-07-22',
            daysElapsed: 4,
            waterTempCelsius: 30.2,
            waterPh: 7.3,
            dissolvedOxygenMgL: 4.8,
            status: RettingStatus.ACTIVE_MICROBIAL_RETTING,
            targetFiberYieldMaunds: 70.0,
            bjriFieldOfficer: 'Suraiya Yasmin, BJRI Research Associate',
            notes: 'Early stage active fermentation. Rapid gas bubble evolution confirms active pectinolytic bacterial multiplication.',
          },
        ]);
      }

      const lotCount = await this.lotRepo.count();
      if (lotCount === 0) {
        this.logger.log('Seeding initial Jute Fiber Lots...');
        await this.lotRepo.save([
          {
            lotNumber: 'FBR-2026-TOSSA-TOP-88',
            farmerName: 'Md. Akram Hossain Mollah',
            balingCenterName: 'Faridpur Sadar Jute Baling & Warehousing Co-op',
            district: 'Faridpur',
            variety: JuteVariety.TOSSA_JUTE,
            grade: JuteFiberGrade.BJC_SPECIAL_TOP,
            baleType: BaleType.KUTCHA_BALE_FARM,
            baleCount: 20,
            grossWeightKg: 2850.0,
            tareWeightKg: 100.0,
            netRawWeightKg: 2750.0,
            moisturePercentage: 11.8,
            moistureAdjustmentKg: 0.0,
            billableDryWeightKg: 2750.0,
            billableMaunds: 68.75,
            pricePerMaund: 4200.0,
            totalPayoutBdt: 293025.0, // Includes 1.5% dryness bonus: 68.75 * 4200 * 1.015 = 293,081 approx
            tensileStrengthGPerTex: 29.2,
            lustreScore: 'Lustrous Golden Silk',
            rootCutPercentage: 2.5,
            defectPercentage: 0.8,
            escrowStatus: BalingEscrowStatus.HELD_IN_ESCROW,
            directorateLicenseNumber: 'DOJ-LIC-2026-FRP-44',
            bjriGradeCertNumber: 'BJRI-QC-CERT-9041',
            isOrganicCertified: true,
          },
          {
            lotNumber: 'FBR-2026-TOSSA-GR2-71',
            farmerName: 'Shankar Kumar Ghosh',
            balingCenterName: 'Jessore Central Jute Market Press',
            district: 'Jessore',
            variety: JuteVariety.TOSSA_JUTE,
            grade: JuteFiberGrade.BJD_GRADE_2,
            baleType: BaleType.KUTCHA_BALE_FARM,
            baleCount: 15,
            grossWeightKg: 2150.0,
            tareWeightKg: 75.0,
            netRawWeightKg: 2075.0,
            moisturePercentage: 14.8,
            moistureAdjustmentKg: 16.6,
            billableDryWeightKg: 2058.4,
            billableMaunds: 51.46,
            pricePerMaund: 3850.0,
            totalPayoutBdt: 198121.0,
            tensileStrengthGPerTex: 26.8,
            lustreScore: 'Bright Creamy Yellow',
            rootCutPercentage: 4.8,
            defectPercentage: 1.5,
            escrowStatus: BalingEscrowStatus.SETTLED_TO_FARMER,
            directorateLicenseNumber: 'DOJ-LIC-2026-JSR-18',
            bjriGradeCertNumber: 'BJRI-QC-CERT-8812',
            isOrganicCertified: false,
          },
          {
            lotNumber: 'FBR-2026-WHITE-TOP-33',
            farmerName: 'Alhaj Motiur Rahman',
            balingCenterName: 'Rangpur Regional Jute Depot',
            district: 'Rangpur',
            variety: JuteVariety.WHITE_JUTE,
            grade: JuteFiberGrade.BWC_SPECIAL_TOP,
            baleType: BaleType.PUCCA_EXPORT_BALE,
            baleCount: 25,
            grossWeightKg: 3500.0,
            tareWeightKg: 120.0,
            netRawWeightKg: 3380.0,
            moisturePercentage: 13.5,
            moistureAdjustmentKg: 0.0,
            billableDryWeightKg: 3380.0,
            billableMaunds: 84.5,
            pricePerMaund: 3600.0,
            totalPayoutBdt: 304200.0,
            tensileStrengthGPerTex: 27.4,
            lustreScore: 'Clean Silvery White',
            rootCutPercentage: 3.1,
            defectPercentage: 1.0,
            escrowStatus: BalingEscrowStatus.HELD_IN_ESCROW,
            directorateLicenseNumber: 'DOJ-LIC-2026-RNG-09',
            bjriGradeCertNumber: 'BJRI-QC-CERT-7921',
            isOrganicCertified: true,
          },
          {
            lotNumber: 'FBR-2026-TOSSA-GR3-55',
            farmerName: 'Abdur Rashid Master',
            balingCenterName: 'Jamalpur Baling Society Press',
            district: 'Jamalpur',
            variety: JuteVariety.TOSSA_JUTE,
            grade: JuteFiberGrade.BJD_GRADE_3,
            baleType: BaleType.KUTCHA_BALE_FARM,
            baleCount: 12,
            grossWeightKg: 1700.0,
            tareWeightKg: 60.0,
            netRawWeightKg: 1640.0,
            moisturePercentage: 16.2,
            moistureAdjustmentKg: 36.08,
            billableDryWeightKg: 1603.92,
            billableMaunds: 40.1,
            pricePerMaund: 3400.0,
            totalPayoutBdt: 136340.0,
            tensileStrengthGPerTex: 24.5,
            lustreScore: 'Semi-Bright Brownish Yellow',
            rootCutPercentage: 8.5,
            defectPercentage: 2.2,
            escrowStatus: BalingEscrowStatus.HELD_IN_ESCROW,
            directorateLicenseNumber: 'DOJ-LIC-2026-JML-27',
            bjriGradeCertNumber: 'BJRI-QC-CERT-6490',
            isOrganicCertified: false,
          },
        ]);
      }

      const contractCount = await this.contractRepo.count();
      if (contractCount === 0) {
        this.logger.log('Seeding initial Jute B2B Forward Contracts under Mandatory Packaging Act 2010...');
        await this.contractRepo.save([
          {
            contractCode: 'B2B-ACT2010-MIL-941',
            buyerMillName: 'Adamjee Jute Mills Ltd (Operating Unit)',
            buyerRegNumber: 'BJMC-REG-2026-M88',
            sellerCooperativeName: 'Faridpur Golden Fiber Growers Federation',
            mandatoryPackagingCategory: PackagingActCategory.PADDY_AND_RICE_50KG,
            productDescription: 'Standard 50kg B.Twill Food-Grade Jute Grain Sacks (BSTI BDS 1007 compliant)',
            quantityMetricTonsOrBales: 120.0,
            unitPriceBdt: 88000.0,
            totalContractValueBdt: 10560000.0,
            deliveryDeadline: '2026-09-30',
            destinationDepot: 'Ghorashal Central Food Silo & Warehouse',
            compliancePackagingAct2010: true,
            escrowDepositPercentage: 30.0,
            escrowStatus: 'ACTIVE_ESCROW_FUNDED',
            inspectionPassed: true,
          },
          {
            contractCode: 'B2B-ACT2010-MIL-802',
            buyerMillName: 'Afil Jute Weaving Mills Ltd',
            buyerRegNumber: 'BJMA-REG-2026-W34',
            sellerCooperativeName: 'Jessore Jute Farmers Welfare Society',
            mandatoryPackagingCategory: PackagingActCategory.FERTILIZER_50KG,
            productDescription: 'Heavy-Duty 50kg Hessian Tarpaulin Bags for BADC & BCIC Urea Distribution',
            quantityMetricTonsOrBales: 80.0,
            unitPriceBdt: 84000.0,
            totalContractValueBdt: 6720000.0,
            deliveryDeadline: '2026-10-15',
            destinationDepot: 'Ashuganj Fertilizer Chemical Complex Depot',
            compliancePackagingAct2010: true,
            escrowDepositPercentage: 30.0,
            escrowStatus: 'ACTIVE_ESCROW_FUNDED',
            inspectionPassed: true,
          },
          {
            contractCode: 'B2B-ACT2010-GEO-415',
            buyerMillName: 'Janata Jute Mills Ltd',
            buyerRegNumber: 'BJSA-REG-2026-S12',
            sellerCooperativeName: 'Rangpur & Kurigram Riverine Jute Syndicate',
            mandatoryPackagingCategory: PackagingActCategory.GEO_JUTE_SOIL_EROSION_MESH,
            productDescription: 'High-Density 700 GSM Open-Mesh Geo-Jute Fabric for BWDB Riverbank Protection',
            quantityMetricTonsOrBales: 40.0,
            unitPriceBdt: 95000.0,
            totalContractValueBdt: 3800000.0,
            deliveryDeadline: '2026-11-10',
            destinationDepot: 'Sirajganj Jamuna Riverbank Defense Site',
            compliancePackagingAct2010: true,
            escrowDepositPercentage: 30.0,
            escrowStatus: 'ACTIVE_ESCROW_FUNDED',
            inspectionPassed: true,
          },
        ]);
      }
    } catch (err) {
      this.logger.error('Failed to seed initial jute biotech data', err);
    }
  }

  // --- STATS OVERVIEW ---
  async getOverviewStats() {
    const totalBatches = await this.rettingRepo.count();
    const activeRettingBatches = await this.rettingRepo.count({
      where: { status: RettingStatus.ACTIVE_MICROBIAL_RETTING },
    });
    const readyBatches = await this.rettingRepo.count({
      where: { status: RettingStatus.FIBER_SEPARATION_READY },
    });

    const lots = await this.lotRepo.find();
    const totalBales = lots.reduce((acc, l) => acc + (Number(l.baleCount) || 0), 0);
    const totalMaunds = lots.reduce((acc, l) => acc + (Number(l.billableMaunds) || 0), 0);
    const totalFarmerPayoutBdt = lots.reduce((acc, l) => acc + (Number(l.totalPayoutBdt) || 0), 0);

    const contracts = await this.contractRepo.find();
    const totalContractValueBdt = contracts.reduce((acc, c) => acc + (Number(c.totalContractValueBdt) || 0), 0);
    const totalContractTonnage = contracts.reduce((acc, c) => acc + (Number(c.quantityMetricTonsOrBales) || 0), 0);

    return {
      totalBatches,
      activeRettingBatches,
      readyBatches,
      totalBales,
      totalMaunds: Math.round(totalMaunds * 100) / 100,
      totalFarmerPayoutBdt: Math.round(totalFarmerPayoutBdt),
      totalContractTonnage,
      totalContractValueBdt: Math.round(totalContractValueBdt),
      standardSafeMoistureTarget: 14.0, // Standard safe warehousing threshold
      mandatoryPackagingActCompliantRate: 100, // 100% compliance
    };
  }

  // --- ALGORITHM 1: MOISTURE WEIGHT & ESCROW PAYOUT CALCULATOR ---
  calculateMoistureDeduction(dto: CalculateMoistureDeductionDto) {
    const netRawWeightKg = Math.max(0, dto.grossWeightKg - dto.tareWeightKg);
    const safeStandard = 14.0; // 14% is BJRI standard for moisture
    let moistureAdjustmentKg = 0;
    let billableDryWeightKg = netRawWeightKg;
    let status = 'ACCEPTED_SAFE_MOISTURE';
    let drynessBonusPercentage = 0;
    let moisturePenaltyPercentage = 0;
    let recommendation = '';

    if (dto.moisturePercentage <= 14.0) {
      moistureAdjustmentKg = 0;
      billableDryWeightKg = netRawWeightKg;
      status = 'ACCEPTED_SAFE_MOISTURE';
      if (dto.moisturePercentage < 12.0) {
        drynessBonusPercentage = 1.5; // 1.5% premium for super dry fiber
        recommendation =
          'Extra-dry premium condition (<12% moisture). Safe for immediate high-density pucca pressing without risk of fungal blotch or internal heat buildup. 1.5% dry bonus awarded.';
      } else {
        recommendation =
          'Standard safe moisture level (12% - 14%). Complies fully with Directorate of Jute warehousing standards. Zero weight deduction applied.';
      }
    } else if (dto.moisturePercentage <= 17.0) {
      // Pro-rata water weight deduction
      const excessMoistureFraction = (dto.moisturePercentage - safeStandard) / 100;
      moistureAdjustmentKg = Math.round(netRawWeightKg * excessMoistureFraction * 100) / 100;
      billableDryWeightKg = Math.max(0, netRawWeightKg - moistureAdjustmentKg);
      status = 'ACCEPTED_WITH_MOISTURE_DEDUCTION';
      recommendation = `Fiber is moderately damp (${dto.moisturePercentage}%). Pro-rata excess water deduction of ${moistureAdjustmentKg} kg applied. Fiber should undergo 24 hours open shed aeration before hydraulic baling.`;
    } else if (dto.moisturePercentage <= 22.0) {
      // High moisture damp penalty
      const excessMoistureFraction = (dto.moisturePercentage - safeStandard) / 100;
      const excessWaterKg = netRawWeightKg * excessMoistureFraction;
      const penaltyKg = netRawWeightKg * 0.05; // 5% handling & re-drying surcharge
      moisturePenaltyPercentage = 5.0;
      moistureAdjustmentKg = Math.round((excessWaterKg + penaltyKg) * 100) / 100;
      billableDryWeightKg = Math.max(0, netRawWeightKg - moistureAdjustmentKg);
      status = 'HIGH_MOISTURE_PENALTY_APPLIED';
      recommendation = `High dampness alert (${dto.moisturePercentage}%). Weight deduction of ${moistureAdjustmentKg} kg includes a 5% penalty to offset artificial watering and yard re-drying expenses.`;
    } else {
      // Greater than 22% is rejected
      moistureAdjustmentKg = netRawWeightKg;
      billableDryWeightKg = 0;
      status = 'REJECTED_EXCESSIVE_WATERLOG_RISK';
      recommendation = `REJECTED: Moisture level (${dto.moisturePercentage}%) exceeds 22% safety ceiling. High risk of microbial rot, heart damage, and self-combustion in pressed bales. Farmer must sun-dry lot before re-test.`;
    }

    const billableMaunds = Math.round((billableDryWeightKg / 40) * 100) / 100;
    const basePayout = billableMaunds * dto.basePricePerMaund;
    const bonusMultiplier = 1 + drynessBonusPercentage / 100;
    const totalPayoutBdt = Math.round(basePayout * bonusMultiplier * 100) / 100;

    return {
      grossWeightKg: dto.grossWeightKg,
      tareWeightKg: dto.tareWeightKg,
      netRawWeightKg,
      testedMoisturePercentage: dto.moisturePercentage,
      safeStandardMoisturePercentage: safeStandard,
      moistureAdjustmentKg,
      billableDryWeightKg: Math.round(billableDryWeightKg * 100) / 100,
      billableMaunds,
      basePricePerMaund: dto.basePricePerMaund,
      drynessBonusPercentage,
      moisturePenaltyPercentage,
      totalPayoutBdt,
      status,
      recommendation,
      variety: dto.variety || JuteVariety.TOSSA_JUTE,
      grade: dto.grade || JuteFiberGrade.BJC_SPECIAL_TOP,
    };
  }

  // --- ALGORITHM 2: RETTING POND & WATER QUALITY ADVISORY ---
  evaluateRettingPond(dto: EvaluateRettingPondDto) {
    let tempScore = 0;
    let phScore = 0;
    let doScore = 0;
    const days = dto.daysSteeping;
    let daysScore = 0;
    let expectedTotalDays = 10; // Ribbon retting with microbial inoculants takes 8-10 days
    let fiberColorPrediction = 'Golden Lustre';
    let tensileStrengthForecast = '27-29 g/tex (High Tenacity)';
    const alerts: string[] = [];

    if (dto.rettingMethod === RettingMethod.CONVENTIONAL_WHOLE_PLANT_STEEP) {
      expectedTotalDays = 20; // Conventional whole plant steep takes 18-21 days
    } else if (dto.rettingMethod === RettingMethod.TANK_MICROBIAL_RETTING) {
      expectedTotalDays = 11;
    }

    // Temperature evaluation
    if (dto.waterTempCelsius >= 28 && dto.waterTempCelsius <= 34) {
      tempScore = 30; // Optimal for pectinolytic microbial fermentation
    } else if (dto.waterTempCelsius >= 25 && dto.waterTempCelsius < 28) {
      tempScore = 20;
      alerts.push('Sub-optimal water temperature. Microbial activity slowed by 25-30%.');
    } else if (dto.waterTempCelsius > 34 && dto.waterTempCelsius <= 38) {
      tempScore = 20;
      alerts.push('Elevated water temperature. Monitor for accelerated softening.');
    } else {
      tempScore = 10;
      alerts.push('Critical water temperature out-of-range. High risk of enzyme inactivation.');
    }

    // pH evaluation
    if (dto.waterPh >= 6.8 && dto.waterPh <= 7.4) {
      phScore = 30; // Optimal neutral-slightly acidic
    } else if (dto.waterPh >= 6.2 && dto.waterPh < 6.8) {
      phScore = 22;
      alerts.push('Water is slightly acidic due to fermentation acid byproducts. Normal in mid-cycle.');
    } else if (dto.waterPh > 7.4 && dto.waterPh <= 8.0) {
      phScore = 22;
    } else {
      phScore = 10;
      alerts.push('Adverse pH level. Extreme acidic or alkaline condition inhibits pectinase enzyme consortia.');
    }

    // Dissolved Oxygen (DO) evaluation
    if (dto.dissolvedOxygenMgL >= 3.5) {
      doScore = 25;
      fiberColorPrediction = 'Bright Silky Golden (Zero Tannin Staining)';
    } else if (dto.dissolvedOxygenMgL >= 2.0) {
      doScore = 18;
      fiberColorPrediction = 'Creamy Golden Yellow';
    } else {
      doScore = 8;
      fiberColorPrediction = 'Dark Greyish / Shyamla Risk (Anaerobic stagnation)';
      alerts.push('Hypoxic / anaerobic water state (<2.0 mg/L DO). Risk of dark tannin staining (Shyamla jute). Flush with fresh canal water.');
    }

    // Days progression
    const progressRatio = Math.min(1.2, days / expectedTotalDays);
    if (progressRatio >= 0.85 && progressRatio <= 1.05) {
      daysScore = 15;
    } else if (progressRatio > 1.05) {
      daysScore = 5;
      tensileStrengthForecast = '21-23 g/tex (Weakened due to over-retting)';
      alerts.push('OVER-RETTING HAZARD: Fiber pectin has decomposed and cellulolytic degradation of fiber bundles has begun. Harvest immediately!');
    } else {
      daysScore = Math.round(progressRatio * 15);
    }

    const readinessScore = Math.min(100, Math.round(tempScore + phScore + doScore + daysScore));
    let status = RettingStatus.ACTIVE_MICROBIAL_RETTING;
    if (progressRatio > 1.1) {
      status = RettingStatus.OVER_RETTED_RISK;
    } else if (readinessScore >= 85) {
      status = RettingStatus.FIBER_SEPARATION_READY;
    }

    return {
      waterTempCelsius: dto.waterTempCelsius,
      waterPh: dto.waterPh,
      dissolvedOxygenMgL: dto.dissolvedOxygenMgL,
      daysSteeping: dto.daysSteeping,
      expectedTotalDays,
      readinessScore,
      status,
      fiberColorPrediction,
      tensileStrengthForecast,
      alerts: alerts.length > 0 ? alerts : ['All retting parameters optimal. High-grade golden fiber expected.'],
    };
  }

  // --- CRUD: RETTING BATCHES ---
  async getAllRettingBatches() {
    return this.rettingRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getRettingBatchById(id: string) {
    const batch = await this.rettingRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Jute Retting Batch with ID ${id} not found`);
    }
    return batch;
  }

  async createRettingBatch(dto: CreateRettingBatchDto) {
    const batch = this.rettingRepo.create({
      ...dto,
      status: dto.status || RettingStatus.STEEPING_INITIATED,
      microbialInoculantUsed: dto.microbialInoculantUsed ?? true,
      inoculantStrainCode: dto.inoculantStrainCode || 'BJRI-PectinoConsortium-B4',
      waterSourceType: dto.waterSourceType || 'Flowing River Canal',
    });
    return this.rettingRepo.save(batch);
  }

  async updateRettingTelemetry(id: string, dto: UpdateRettingTelemetryDto) {
    const batch = await this.getRettingBatchById(id);
    if (dto.waterTempCelsius !== undefined) batch.waterTempCelsius = dto.waterTempCelsius;
    if (dto.waterPh !== undefined) batch.waterPh = dto.waterPh;
    if (dto.dissolvedOxygenMgL !== undefined) batch.dissolvedOxygenMgL = dto.dissolvedOxygenMgL;
    if (dto.daysElapsed !== undefined) batch.daysElapsed = dto.daysElapsed;
    if (dto.status !== undefined) batch.status = dto.status;
    return this.rettingRepo.save(batch);
  }

  // --- CRUD: FIBER LOTS ---
  async getAllFiberLots() {
    return this.lotRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createFiberLot(dto: CreateFiberLotDto) {
    const calc = this.calculateMoistureDeduction({
      grossWeightKg: dto.grossWeightKg,
      tareWeightKg: dto.tareWeightKg,
      moisturePercentage: dto.moisturePercentage,
      basePricePerMaund: dto.pricePerMaund,
      variety: dto.variety,
      grade: dto.grade,
    });

    const lot = this.lotRepo.create({
      ...dto,
      netRawWeightKg: calc.netRawWeightKg,
      moistureAdjustmentKg: calc.moistureAdjustmentKg,
      billableDryWeightKg: calc.billableDryWeightKg,
      billableMaunds: calc.billableMaunds,
      totalPayoutBdt: calc.totalPayoutBdt,
      escrowStatus: dto.escrowStatus || BalingEscrowStatus.HELD_IN_ESCROW,
      tensileStrengthGPerTex: dto.tensileStrengthGPerTex ?? 27.5,
      lustreScore: dto.lustreScore || 'Lustrous Golden',
      rootCutPercentage: dto.rootCutPercentage ?? 3.5,
      defectPercentage: dto.defectPercentage ?? 1.2,
      directorateLicenseNumber: dto.directorateLicenseNumber || 'DOJ-LIC-2026-REG',
      bjriGradeCertNumber: dto.bjriGradeCertNumber || 'BJRI-QC-PASS',
      isOrganicCertified: dto.isOrganicCertified ?? true,
    });

    return this.lotRepo.save(lot);
  }

  // --- CRUD: B2B CONTRACTS ---
  async getAllB2bContracts() {
    return this.contractRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createB2bContract(dto: CreateB2bContractDto) {
    const totalContractValueBdt = dto.quantityMetricTonsOrBales * dto.unitPriceBdt;
    const contract = this.contractRepo.create({
      ...dto,
      totalContractValueBdt,
      buyerRegNumber: dto.buyerRegNumber || 'BJMC-REG-2026',
      destinationDepot: dto.destinationDepot || 'Central Warehouse Silo',
      compliancePackagingAct2010: dto.compliancePackagingAct2010 ?? true,
      escrowDepositPercentage: dto.escrowDepositPercentage ?? 30.0,
      escrowStatus: 'ACTIVE_ESCROW_FUNDED',
      inspectionPassed: true,
    });
    return this.contractRepo.save(contract);
  }
}
