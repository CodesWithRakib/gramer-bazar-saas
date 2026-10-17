import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeaGreenLeafIntake } from './entities/tea-green-leaf-intake.entity.js';
import { TeaFactoryBatch } from './entities/tea-factory-batch.entity.js';
import { TeaAuctionLot } from './entities/tea-auction-lot.entity.js';
import {
  TeaGardenRegion,
  TeaProcessingType,
  TeaLeafGrade,
  PluckingStandard,
  AuctionCenter,
  AuctionLotStatus,
} from './enums/tea-estate.enum.js';
import {
  CalculateGreenLeafIntakeDto,
  EvaluateLiquorQualityDto,
  CreateGreenLeafIntakeDto,
  CreateFactoryBatchDto,
  CreateAuctionLotDto,
  PlaceAuctionBidDto,
} from './dto/tea-estate.dto.js';

@Injectable()
export class TeaEstateService implements OnModuleInit {
  private readonly logger = new Logger(TeaEstateService.name);

  constructor(
    @InjectRepository(TeaGreenLeafIntake)
    private readonly intakeRepo: Repository<TeaGreenLeafIntake>,
    @InjectRepository(TeaFactoryBatch)
    private readonly factoryRepo: Repository<TeaFactoryBatch>,
    @InjectRepository(TeaAuctionLot)
    private readonly auctionRepo: Repository<TeaAuctionLot>,
  ) {}

  async onModuleInit() {
    await this.seedInitialTeaData();
  }

  private async seedInitialTeaData() {
    try {
      const intakeCount = await this.intakeRepo.count();
      if (intakeCount === 0) {
        this.logger.log('Seeding initial Tea Green Leaf Intakes...');
        await this.intakeRepo.save([
          {
            intakeTicketNumber: 'GLI-2026-PCH-9041',
            smallholderFarmerName: 'Md. Mizanur Rahman',
            farmerPhone: '+8801711223399',
            farmerRegNumber: 'BTB-SHT-2026-PCH-551',
            gardenNameOrCluster: 'Panchagarh Tetulia Smallholder Cooperative',
            region: TeaGardenRegion.PANCHAGARH_TERAI_FLATLAND,
            pluckingDate: '2026-07-12',
            grossWeightKg: 185.0,
            tareBagWeightKg: 5.0,
            netRawWeightKg: 180.0,
            finePluckingPercentage: 88.0,
            pluckingStandard: PluckingStandard.SUPERFINE_TWO_LEAVES_AND_BUD,
            surfaceWaterMoistureDeductionKg: 3.5,
            coarseLeafDeductionKg: 0.0,
            netBillableLeafWeightKg: 176.5,
            ratePerKgBdt: 34.0,
            totalPayoutBdt: 6301.05, // includes 5% bonus for >=85% plucking
            btbInspectorName: 'Md. Shahidul Islam, BTB Tea Extension Officer',
            payoutStatus: 'PAID_VIA_BKASH',
          },
          {
            intakeTicketNumber: 'GLI-2026-SRM-4102',
            smallholderFarmerName: 'Subrata Debbarma',
            farmerPhone: '+8801822334488',
            farmerRegNumber: 'BTB-SHT-2026-SRM-219',
            gardenNameOrCluster: 'Sreemangal Balisera Outgrower Group',
            region: TeaGardenRegion.SREEMANGAL_MOULVIBAZAR,
            pluckingDate: '2026-07-13',
            grossWeightKg: 240.0,
            tareBagWeightKg: 6.0,
            netRawWeightKg: 234.0,
            finePluckingPercentage: 81.5,
            pluckingStandard: PluckingStandard.STANDARD_FINE_PLUCK,
            surfaceWaterMoistureDeductionKg: 4.0,
            coarseLeafDeductionKg: 0.0,
            netBillableLeafWeightKg: 230.0,
            ratePerKgBdt: 33.0,
            totalPayoutBdt: 7590.0,
            btbInspectorName: 'Kazi Faruk, Senior Tea Agronomist',
            payoutStatus: 'PAID_VIA_NAGAD',
          },
          {
            intakeTicketNumber: 'GLI-2026-THK-1190',
            smallholderFarmerName: 'Abdul Khalek',
            farmerPhone: '+8801933445577',
            farmerRegNumber: 'BTB-SHT-2026-THK-084',
            gardenNameOrCluster: 'Thakurgaon Ranisankail Planar Garden',
            region: TeaGardenRegion.THAKURGAON_TERAI_FLATLAND,
            pluckingDate: '2026-07-14',
            grossWeightKg: 160.0,
            tareBagWeightKg: 5.0,
            netRawWeightKg: 155.0,
            finePluckingPercentage: 70.0,
            pluckingStandard: PluckingStandard.COARSE_OVERGROWN_PLUCK,
            surfaceWaterMoistureDeductionKg: 2.5,
            coarseLeafDeductionKg: 6.2, // coarse leaf deduction applied
            netBillableLeafWeightKg: 146.3,
            ratePerKgBdt: 31.0,
            totalPayoutBdt: 4535.3,
            btbInspectorName: 'Nazrul Ahsan, Field Inspector',
            payoutStatus: 'PAID_VIA_BKASH',
          },
          {
            intakeTicketNumber: 'GLI-2026-BDB-0051',
            smallholderFarmerName: 'Pai-Ching Marma',
            farmerPhone: '+8801755667788',
            farmerRegNumber: 'BTB-SHT-2026-BDB-012',
            gardenNameOrCluster: 'Bandarban Chimbuk High Elevation Garden',
            region: TeaGardenRegion.BANDARBAN_HILL_TRACTS,
            pluckingDate: '2026-07-15',
            grossWeightKg: 95.0,
            tareBagWeightKg: 3.0,
            netRawWeightKg: 92.0,
            finePluckingPercentage: 94.0,
            pluckingStandard: PluckingStandard.SUPERFINE_TWO_LEAVES_AND_BUD,
            surfaceWaterMoistureDeductionKg: 1.0,
            coarseLeafDeductionKg: 0.0,
            netBillableLeafWeightKg: 91.0,
            ratePerKgBdt: 45.0, // High-altitude artisanal green leaf premium
            totalPayoutBdt: 4299.75, // includes 5% bonus
            btbInspectorName: 'Mong Shwe Prue, Tribal Agriculture Officer',
            payoutStatus: 'PAID_VIA_BKASH',
          },
        ]);
      }

      const factoryCount = await this.factoryRepo.count();
      if (factoryCount === 0) {
        this.logger.log('Seeding initial Tea Factory Batches...');
        await this.factoryRepo.save([
          {
            batchNumber: 'MFG-2026-SRM-CTC-42',
            factoryName: 'Finlay Balisera Central Tea Factory',
            region: TeaGardenRegion.SREEMANGAL_MOULVIBAZAR,
            processingType: TeaProcessingType.CTC_BLACK_TEA,
            greenLeafIntakeKg: 4200.0,
            witheringTroughHours: 14.5,
            witheringMoistureLossPercentage: 11.5,
            rollingFrictionTempCelsius: 28.5,
            fermentationTimeMinutes: 75,
            dryerDischargeMoisturePercentage: 2.8,
            finishedTeaYieldKg: 965.0,
            primaryGrade: TeaLeafGrade.BOP,
            certificationMark: 'BTB-ESTATE-GRADE-A1',
            isOrganicCertified: false,
          },
          {
            batchNumber: 'MFG-2026-PCH-GRN-18',
            factoryName: 'Kazi & Kazi Organic Processing Facility',
            region: TeaGardenRegion.PANCHAGARH_TERAI_FLATLAND,
            processingType: TeaProcessingType.GREEN_TEA_STEAMED_PANFIRED,
            greenLeafIntakeKg: 2500.0,
            witheringTroughHours: 4.0,
            witheringMoistureLossPercentage: 6.0,
            rollingFrictionTempCelsius: 24.0,
            fermentationTimeMinutes: 0, // unfermented green tea
            dryerDischargeMoisturePercentage: 2.5,
            finishedTeaYieldKg: 550.0,
            primaryGrade: TeaLeafGrade.ORGANIC_SENCHA_GREEN,
            certificationMark: 'USDA-ORGANIC-BD-904',
            isOrganicCertified: true,
          },
          {
            batchNumber: 'MFG-2026-SYL-ORT-09',
            factoryName: 'Zareen Estate Orthodox Processing House',
            region: TeaGardenRegion.SYLHET_SURMA_VALLEY,
            processingType: TeaProcessingType.ARTISANAL_ORTHODOX_BLACK,
            greenLeafIntakeKg: 1800.0,
            witheringTroughHours: 16.0,
            witheringMoistureLossPercentage: 13.0,
            rollingFrictionTempCelsius: 26.0,
            fermentationTimeMinutes: 110,
            dryerDischargeMoisturePercentage: 2.9,
            finishedTeaYieldKg: 395.0,
            primaryGrade: TeaLeafGrade.FTGFOP1,
            certificationMark: 'RAINFOREST-ALLIANCE-CERTIFIED',
            isOrganicCertified: true,
          },
        ]);
      }

      const auctionCount = await this.auctionRepo.count();
      if (auctionCount === 0) {
        this.logger.log('Seeding initial Tea Auction Lots...');
        await this.auctionRepo.save([
          {
            lotNumber: 'AUC-LOT-2026-CTG-881',
            gardenMark: 'Zareen Tea Estate (Surma Valley)',
            auctionCenter: AuctionCenter.CHITTAGONG_TEA_AUCTION,
            saleNumber: 24,
            processingType: TeaProcessingType.ARTISANAL_ORTHODOX_BLACK,
            grade: TeaLeafGrade.FTGFOP1,
            packageCountBagsOrChests: 40,
            netWeightKg: 2000.0,
            reservePricePerKgBdt: 320.0,
            currentHighBidBdt: 410.0,
            winningBrokerName: 'National Brokers Ltd',
            tasterScoreBrightness: 9.2,
            tasterScoreBriskness: 9.4,
            tasterScoreLiquorBody: 9.0,
            tasterFlavorNotes: 'Sublime floral muscatel character, bright golden liquor ring, elegant tippy finish.',
            auctionStatus: AuctionLotStatus.ACTIVE_BIDDING,
            isOrganicCertified: true,
          },
          {
            lotNumber: 'AUC-LOT-2026-SRM-512',
            gardenMark: 'Finlay Balisera Estate',
            auctionCenter: AuctionCenter.SREEMANGAL_TEA_AUCTION,
            saleNumber: 18,
            processingType: TeaProcessingType.CTC_BLACK_TEA,
            grade: TeaLeafGrade.BOP,
            packageCountBagsOrChests: 60,
            netWeightKg: 3000.0,
            reservePricePerKgBdt: 260.0,
            currentHighBidBdt: 298.0,
            winningBrokerName: 'Ispahani Tea Blenders & Trading',
            tasterScoreBrightness: 8.8,
            tasterScoreBriskness: 9.0,
            tasterScoreLiquorBody: 8.9,
            tasterFlavorNotes: 'Deep coppery infusion, strong pungent liquor, ideal milk-tea binding structure.',
            auctionStatus: AuctionLotStatus.ACTIVE_BIDDING,
            isOrganicCertified: false,
          },
          {
            lotNumber: 'AUC-LOT-2026-PCH-044',
            gardenMark: 'Kazi & Kazi Organic Garden',
            auctionCenter: AuctionCenter.PANCHAGARH_AUCTION_DESK,
            saleNumber: 9,
            processingType: TeaProcessingType.SILVER_NEEDLE_WHITE_TEA,
            grade: TeaLeafGrade.SPECIALTY_SILVER_TIPS,
            packageCountBagsOrChests: 10,
            netWeightKg: 500.0,
            reservePricePerKgBdt: 1200.0,
            currentHighBidBdt: 1650.0,
            winningBrokerName: 'Euro-Bangla Specialty Export Consortia',
            tasterScoreBrightness: 9.8,
            tasterScoreBriskness: 8.5,
            tasterScoreLiquorBody: 9.6,
            tasterFlavorNotes: 'Pure silvery apical buds, delicate nectar infusion, notes of honeysuckle and wild mountain melon.',
            auctionStatus: AuctionLotStatus.KNOCKED_DOWN_SOLD,
            isOrganicCertified: true,
          },
        ]);
      }
    } catch (err) {
      this.logger.error('Failed to seed initial tea estate data', err);
    }
  }

  // --- STATS OVERVIEW ---
  async getOverviewStats() {
    const totalIntakeTickets = await this.intakeRepo.count();
    const intakes = await this.intakeRepo.find();
    const totalGreenLeafKg = intakes.reduce((acc, i) => acc + (Number(i.netBillableLeafWeightKg) || 0), 0);
    const totalSmallholderPayoutBdt = intakes.reduce((acc, i) => acc + (Number(i.totalPayoutBdt) || 0), 0);

    const factoryBatches = await this.factoryRepo.find();
    const totalProcessedTeaKg = factoryBatches.reduce((acc, b) => acc + (Number(b.finishedTeaYieldKg) || 0), 0);

    const auctionLots = await this.auctionRepo.find();
    const totalAuctionKg = auctionLots.reduce((acc, a) => acc + (Number(a.netWeightKg) || 0), 0);
    const totalAuctionValuationBdt = auctionLots.reduce(
      (acc, a) => acc + (Number(a.netWeightKg) * Number(a.currentHighBidBdt || a.reservePricePerKgBdt) || 0),
      0,
    );

    const activeLotsCount = auctionLots.filter((a) => a.auctionStatus === AuctionLotStatus.ACTIVE_BIDDING).length;

    return {
      totalIntakeTickets,
      totalGreenLeafKg: Math.round(totalGreenLeafKg * 100) / 100,
      totalSmallholderPayoutBdt: Math.round(totalSmallholderPayoutBdt),
      totalProcessedTeaKg: Math.round(totalProcessedTeaKg * 100) / 100,
      totalAuctionKg: Math.round(totalAuctionKg * 100) / 100,
      totalAuctionValuationBdt: Math.round(totalAuctionValuationBdt),
      activeLotsCount,
      btbBenchmarkSmallholderPrice: 34.0, // BDT per kg green leaf
      averageCupScore: 9.1,
    };
  }

  // --- ALGORITHM 1: GREEN LEAF INTAKE & PLUCKING QUALITY ENGINE ---
  calculateGreenLeafIntake(dto: CalculateGreenLeafIntakeDto) {
    const netRawWeightKg = Math.max(0, dto.grossWeightKg - dto.tareBagWeightKg);
    let pluckingStandard = PluckingStandard.STANDARD_FINE_PLUCK;
    let finePluckingBonusPercentage = 0;
    let coarseLeafDeductionKg = 0;
    let recommendation = '';

    if (dto.finePluckingPercentage >= 85.0) {
      pluckingStandard = PluckingStandard.SUPERFINE_TWO_LEAVES_AND_BUD;
      finePluckingBonusPercentage = 5.0; // 5% bonus for exquisite two leaves and a bud
      coarseLeafDeductionKg = 0;
      recommendation =
        'Superfine "two leaves and a bud" plucking quality (≥85%). Premium tier with 5% fine-plucking incentive bonus awarded.';
    } else if (dto.finePluckingPercentage >= 75.0) {
      pluckingStandard = PluckingStandard.STANDARD_FINE_PLUCK;
      finePluckingBonusPercentage = 0;
      coarseLeafDeductionKg = 0;
      recommendation =
        'Standard fine plucking (75%–84%). Fully compliant with Bangladesh Tea Board factory intake quality standards. Zero deduction.';
    } else {
      pluckingStandard = PluckingStandard.COARSE_OVERGROWN_PLUCK;
      finePluckingBonusPercentage = 0;
      // Deduction for coarse 3rd/4th leaves and fibrous woody stems
      const excessCoarseFraction = (75.0 - dto.finePluckingPercentage) / 100;
      coarseLeafDeductionKg = Math.round(netRawWeightKg * excessCoarseFraction * 0.8 * 100) / 100;
      recommendation = `Coarse overgrown leaf penalty: ${coarseLeafDeductionKg} kg deducted. Leaf contains fibrous overgrown third leaves and woody stalks which lower liquor quality.`;
    }

    const surfaceWaterMoistureDeductionKg = Math.min(netRawWeightKg, Math.max(0, dto.surfaceWaterDeductionKg));
    const netBillableLeafWeightKg = Math.max(
      0,
      Math.round((netRawWeightKg - surfaceWaterMoistureDeductionKg - coarseLeafDeductionKg) * 100) / 100,
    );

    const basePayout = netBillableLeafWeightKg * dto.ratePerKgBdt;
    const bonusMultiplier = 1 + finePluckingBonusPercentage / 100;
    const totalPayoutBdt = Math.round(basePayout * bonusMultiplier * 100) / 100;

    return {
      grossWeightKg: dto.grossWeightKg,
      tareBagWeightKg: dto.tareBagWeightKg,
      netRawWeightKg,
      finePluckingPercentage: dto.finePluckingPercentage,
      pluckingStandard,
      surfaceWaterMoistureDeductionKg,
      coarseLeafDeductionKg,
      netBillableLeafWeightKg,
      ratePerKgBdt: dto.ratePerKgBdt,
      finePluckingBonusPercentage,
      totalPayoutBdt,
      recommendation,
    };
  }

  // --- ALGORITHM 2: TEA LIQUOR SENSORY EVALUATION & EXPORT FORECAST ---
  evaluateLiquorQuality(dto: EvaluateLiquorQualityDto) {
    // Weighted cup quality index (0-100)
    // Brightness 30%, Briskness 30%, Body 25%, Color 15%
    const cupScore =
      dto.brightnessScore * 3.0 +
      dto.brisknessScore * 3.0 +
      dto.liquorBodyScore * 2.5 +
      dto.colorScore * 1.5;

    const normalizedCupScore = Math.min(100, Math.round(cupScore * 10) / 10);
    let valuationMultiplier = 1.0;
    let exportSuitability = '';
    let tasterNotes = '';

    if (normalizedCupScore >= 88.0) {
      valuationMultiplier = 1.45; // +45% premium over base reserve
      exportSuitability = 'Ultra-Premium Specialty Export Grade (Direct European, Japanese & Middle East Markets)';
      tasterNotes =
        'Exceptional briskness with sparkling bright liquor. Deep multi-layered floral aroma and long sweet lingering finish.';
    } else if (normalizedCupScore >= 78.0) {
      valuationMultiplier = 1.18; // +18% premium
      exportSuitability = 'Prime Commercial Auction Grade (Top Tier National Packet Tea Blending)';
      tasterNotes =
        'Rich malty body with vibrant coppery infusion. Well-balanced briskness suitable for high-grade domestic packaging.';
    } else {
      valuationMultiplier = 1.0;
      exportSuitability = 'Standard Utility Blending Grade (Catering & Mass Market Blends)';
      tasterNotes = 'Satisfactory strength with medium color. Best paired with higher elevation orthodox teas.';
    }

    return {
      brightnessScore: dto.brightnessScore,
      brisknessScore: dto.brisknessScore,
      liquorBodyScore: dto.liquorBodyScore,
      colorScore: dto.colorScore,
      overallCupQualityScore: normalizedCupScore,
      valuationMultiplier,
      exportSuitability,
      tasterNotes,
      processingType: dto.processingType,
      grade: dto.grade,
    };
  }

  // --- CRUD: GREEN LEAF INTAKES ---
  async getAllGreenLeafIntakes() {
    return this.intakeRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createGreenLeafIntake(dto: CreateGreenLeafIntakeDto) {
    const calc = this.calculateGreenLeafIntake({
      grossWeightKg: dto.grossWeightKg,
      tareBagWeightKg: dto.tareBagWeightKg,
      finePluckingPercentage: dto.finePluckingPercentage,
      surfaceWaterDeductionKg: dto.surfaceWaterMoistureDeductionKg,
      ratePerKgBdt: dto.ratePerKgBdt,
    });

    const intake = this.intakeRepo.create({
      ...dto,
      netRawWeightKg: calc.netRawWeightKg,
      pluckingStandard: calc.pluckingStandard,
      coarseLeafDeductionKg: calc.coarseLeafDeductionKg,
      netBillableLeafWeightKg: calc.netBillableLeafWeightKg,
      totalPayoutBdt: calc.totalPayoutBdt,
      farmerRegNumber: dto.farmerRegNumber || 'BTB-SHT-2026',
      btbInspectorName: dto.btbInspectorName || 'Md. Shahidul Islam, BTB Tea Extension Officer',
      payoutStatus: 'PAID_VIA_BKASH',
    });

    return this.intakeRepo.save(intake);
  }

  // --- CRUD: FACTORY BATCHES ---
  async getAllFactoryBatches() {
    return this.factoryRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createFactoryBatch(dto: CreateFactoryBatchDto) {
    const batch = this.factoryRepo.create({
      ...dto,
      certificationMark: dto.certificationMark || 'BTB-ESTATE-GRADE-A1',
      isOrganicCertified: dto.isOrganicCertified ?? false,
    });
    return this.factoryRepo.save(batch);
  }

  // --- CRUD: AUCTION LOTS & BIDDING ---
  async getAllAuctionLots() {
    return this.auctionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createAuctionLot(dto: CreateAuctionLotDto) {
    const lot = this.auctionRepo.create({
      ...dto,
      currentHighBidBdt: dto.reservePricePerKgBdt,
      winningBrokerName: 'Awaiting Bids',
      tasterScoreBrightness: dto.tasterScoreBrightness ?? 8.5,
      tasterScoreBriskness: dto.tasterScoreBriskness ?? 8.5,
      tasterScoreLiquorBody: dto.tasterScoreLiquorBody ?? 8.5,
      tasterFlavorNotes: dto.tasterFlavorNotes || 'Pleasant brisk liquor with balanced color infusion.',
      auctionStatus: AuctionLotStatus.ACTIVE_BIDDING,
      isOrganicCertified: dto.isOrganicCertified ?? false,
    });
    return this.auctionRepo.save(lot);
  }

  async placeAuctionBid(id: string, dto: PlaceAuctionBidDto) {
    const lot = await this.auctionRepo.findOne({ where: { id } });
    if (!lot) {
      throw new NotFoundException(`Tea Auction Lot with ID ${id} not found`);
    }

    if (lot.auctionStatus !== AuctionLotStatus.ACTIVE_BIDDING) {
      throw new BadRequestException('This auction lot is not open for bidding.');
    }

    const currentBest = Number(lot.currentHighBidBdt) || Number(lot.reservePricePerKgBdt);
    if (dto.bidPerKgBdt <= currentBest) {
      throw new BadRequestException(
        `Bid must be higher than current price of ৳${currentBest}/kg`,
      );
    }

    lot.currentHighBidBdt = dto.bidPerKgBdt;
    lot.winningBrokerName = dto.brokerName;

    return this.auctionRepo.save(lot);
  }
}
