import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FruitType,
  OrchardRegion,
  FruitCultivar,
  FruitBaggingStatus,
  OrchardAuctionStatus,
  HwtTreatmentStatus,
  ChemicalMrlStatus,
  ColdChainTransitStatus,
  PackagingType,
  DispatchGradingQuality,
} from './enums/orchard-auction.enum.js';
import { OrchardTreeAuctionLot } from './entities/orchard-tree-auction-lot.entity.js';
import { PhytosanitaryHwtBatch } from './entities/phytosanitary-hwt-batch.entity.js';
import { OrchardHarvestDispatch } from './entities/orchard-harvest-dispatch.entity.js';
import {
  CalculateOrchardValuationDto,
  EvaluateHwtQuarantineDto,
  CreateOrchardAuctionLotDto,
  PlaceOrchardBidDto,
  CreatePhytosanitaryHwtBatchDto,
  CreateOrchardHarvestDispatchDto,
  UpdateDispatchColdChainDto,
} from './dto/orchard-auction.dto.js';

@Injectable()
export class OrchardAuctionService implements OnModuleInit {
  constructor(
    @InjectRepository(OrchardTreeAuctionLot)
    private readonly lotRepo: Repository<OrchardTreeAuctionLot>,
    @InjectRepository(PhytosanitaryHwtBatch)
    private readonly hwtRepo: Repository<PhytosanitaryHwtBatch>,
    @InjectRepository(OrchardHarvestDispatch)
    private readonly dispatchRepo: Repository<OrchardHarvestDispatch>,
  ) {}

  async onModuleInit() {
    await this.seedInitialOrchardData();
  }

  private async seedInitialOrchardData() {
    const count = await this.lotRepo.count();
    if (count > 0) return;

    // Seed Orchard Lots
    const lot1 = this.lotRepo.create({
      lotNumber: 'ORCH-2026-CHPN-001',
      orchardName: 'Mahananda Riverbank Heritage Mango Orchard',
      growerName: 'Haji Shamsul Alam',
      growerPhone: '+8801711223344',
      region: OrchardRegion.CHAPAINAWABGANJ_SHIBGANJ,
      mouzaPlotNumber: 'Shibganj Mouza Plot #412',
      fruitType: FruitType.MANGO,
      cultivar: FruitCultivar.KHIRSAPAT_HIMSAGAR,
      isGiCertified: true,
      giRegistrationNumber: 'BD-GI-003-KHIRSAPAT',
      totalTrees: 120,
      estimatedYieldKg: 14500,
      treeAgeYears: 22,
      floweringFruitSetPct: 88.0,
      fruitBaggingStatus: FruitBaggingStatus.BAG_PROTECTED,
      baggedFruitsCount: 38000,
      baseReservePriceBdt: 1650000,
      currentHighestBidBdt: 1820000,
      highestBidderBrokerName: 'Bengal Fresh Fruits Exporters Ltd.',
      highestBidderBrokerPhone: '+8801819445566',
      advanceEscrowPct: 30.0,
      advanceEscrowPaidBdt: 546000,
      status: OrchardAuctionStatus.BID_ACCEPTED,
      auctionClosingDate: new Date('2026-05-15T18:00:00Z'),
      expectedHarvestStartDate: new Date('2026-06-05T00:00:00Z'),
      bids: [
        {
          id: 'bid-101',
          bidderName: 'Kawran Bazar Green Trade Co.',
          bidderPhone: '+8801912334455',
          bidAmountBdt: 1700000,
          placedAt: new Date('2026-04-20T10:30:00Z').toISOString(),
        },
        {
          id: 'bid-102',
          bidderName: 'Bengal Fresh Fruits Exporters Ltd.',
          bidderPhone: '+8801819445566',
          bidAmountBdt: 1820000,
          placedAt: new Date('2026-04-22T14:15:00Z').toISOString(),
        },
      ],
    });

    const lot2 = this.lotRepo.create({
      lotNumber: 'ORCH-2026-DINJ-002',
      orchardName: 'Punarbhaba Valley Sweet Bedana Litchi Orchard',
      growerName: 'Alimuddin Master',
      growerPhone: '+8801715889900',
      region: OrchardRegion.DINAJPUR_BIROL_SADAR,
      mouzaPlotNumber: 'Birol Madhabpur Plot #89',
      fruitType: FruitType.LITCHI,
      cultivar: FruitCultivar.DINAJPUR_BEDANA_LITCHI,
      isGiCertified: true,
      giRegistrationNumber: 'BD-GI-CANDIDATE-BEDANA',
      totalTrees: 65,
      estimatedYieldKg: 4600,
      treeAgeYears: 28,
      floweringFruitSetPct: 82.5,
      fruitBaggingStatus: FruitBaggingStatus.PARTIALLY_BAGGED,
      baggedFruitsCount: 14000,
      baseReservePriceBdt: 1250000,
      currentHighestBidBdt: 1380000,
      highestBidderBrokerName: 'Gourmet Agro Global Ltd.',
      highestBidderBrokerPhone: '+8801712001122',
      advanceEscrowPct: 30.0,
      advanceEscrowPaidBdt: 414000,
      status: OrchardAuctionStatus.AUCTION_OPEN,
      auctionClosingDate: new Date('2026-05-10T18:00:00Z'),
      expectedHarvestStartDate: new Date('2026-05-25T00:00:00Z'),
      bids: [
        {
          id: 'bid-201',
          bidderName: 'Gourmet Agro Global Ltd.',
          bidderPhone: '+8801712001122',
          bidAmountBdt: 1380000,
          placedAt: new Date('2026-04-18T09:00:00Z').toISOString(),
        },
      ],
    });

    const lot3 = this.lotRepo.create({
      lotNumber: 'ORCH-2026-RJSH-003',
      orchardName: 'Padma Riverside Langra Mango Grove',
      growerName: 'Anwar Hossain Mondol',
      growerPhone: '+8801714556677',
      region: OrchardRegion.RAJSHAHI_BAGHA_CHARGHAT,
      mouzaPlotNumber: 'Bagha Arani Plot #118',
      fruitType: FruitType.MANGO,
      cultivar: FruitCultivar.LANGRA,
      isGiCertified: false,
      totalTrees: 90,
      estimatedYieldKg: 10200,
      treeAgeYears: 18,
      floweringFruitSetPct: 79.0,
      fruitBaggingStatus: FruitBaggingStatus.BAG_PROTECTED,
      baggedFruitsCount: 26000,
      baseReservePriceBdt: 980000,
      currentHighestBidBdt: 1050000,
      highestBidderBrokerName: 'Northern Fruit Mart',
      highestBidderBrokerPhone: '+8801713449911',
      advanceEscrowPct: 30.0,
      advanceEscrowPaidBdt: 315000,
      status: OrchardAuctionStatus.AUCTION_OPEN,
      auctionClosingDate: new Date('2026-05-20T18:00:00Z'),
      expectedHarvestStartDate: new Date('2026-06-15T00:00:00Z'),
      bids: [
        {
          id: 'bid-301',
          bidderName: 'Northern Fruit Mart',
          bidderPhone: '+8801713449911',
          bidAmountBdt: 1050000,
          placedAt: new Date('2026-04-19T11:45:00Z').toISOString(),
        },
      ],
    });

    const lot4 = this.lotRepo.create({
      lotNumber: 'ORCH-2026-RNPR-004',
      orchardName: 'Mithapukur Poddagag Haribhanga Plantation',
      growerName: 'Mozammel Haque',
      growerPhone: '+8801718112233',
      region: OrchardRegion.RANGPUR_MITHAPUKUR,
      mouzaPlotNumber: 'Poddagag Block #54',
      fruitType: FruitType.MANGO,
      cultivar: FruitCultivar.HARIBHANGA,
      isGiCertified: true,
      giRegistrationNumber: 'BD-GI-007-HARIBHANGA',
      totalTrees: 110,
      estimatedYieldKg: 12500,
      treeAgeYears: 14,
      floweringFruitSetPct: 85.0,
      fruitBaggingStatus: FruitBaggingStatus.BAG_PROTECTED,
      baggedFruitsCount: 32000,
      baseReservePriceBdt: 1350000,
      currentHighestBidBdt: 1350000,
      advanceEscrowPct: 30.0,
      advanceEscrowPaidBdt: 0,
      status: OrchardAuctionStatus.AUCTION_OPEN,
      auctionClosingDate: new Date('2026-06-01T18:00:00Z'),
      expectedHarvestStartDate: new Date('2026-06-25T00:00:00Z'),
      bids: [],
    });

    await this.lotRepo.save([lot1, lot2, lot3, lot4]);

    // Seed HWT Batches
    const hwt1 = this.hwtRepo.create({
      batchNumber: 'HWT-2026-DAE-0042',
      orchardLotId: lot1.id,
      orchardName: 'Mahananda Riverbank Heritage Mango Orchard',
      fruitType: FruitType.MANGO,
      cultivar: FruitCultivar.KHIRSAPAT_HIMSAGAR,
      totalFreshWeightKg: 2400,
      cratesCount: 120,
      hwtFacilityLocation: 'Central Packing House, Shyampur, Dhaka',
      waterTempCelsius: 48.0,
      immersionDurationMinutes: 60,
      fruitCoreTempCelsius: 46.8,
      hydrocoolingTempCelsius: 25.8,
      chemicalMrlStatus: ChemicalMrlStatus.TEST_PASSED_MRL_SAFE,
      pesticideMrlPpm: 0.015,
      quarantinePassIssued: true,
      phytosanitaryCertificateNumber: 'DAE/PQW-2026-0819-EU',
      inspectorName: 'Dr. Md. Nazmul Huda',
      inspectorDesignation: 'Senior Plant Quarantine Entomologist',
      status: HwtTreatmentStatus.QUARANTINE_CERTIFIED_EXPORT,
    });

    const hwt2 = this.hwtRepo.create({
      batchNumber: 'HWT-2026-DAE-0043',
      orchardLotId: lot2.id,
      orchardName: 'Punarbhaba Valley Sweet Bedana Litchi Orchard',
      fruitType: FruitType.LITCHI,
      cultivar: FruitCultivar.DINAJPUR_BEDANA_LITCHI,
      totalFreshWeightKg: 1000,
      cratesCount: 50,
      hwtFacilityLocation: 'Dinajpur Horticultural Export Facility',
      waterTempCelsius: 48.2,
      immersionDurationMinutes: 59,
      fruitCoreTempCelsius: 46.6,
      hydrocoolingTempCelsius: 25.5,
      chemicalMrlStatus: ChemicalMrlStatus.TEST_PASSED_MRL_SAFE,
      pesticideMrlPpm: 0.01,
      quarantinePassIssued: true,
      phytosanitaryCertificateNumber: 'DAE/PQW-2026-0820-ME',
      inspectorName: 'Sharmin Sultana',
      inspectorDesignation: 'Horticultural Quarantine Specialist',
      status: HwtTreatmentStatus.QUARANTINE_CERTIFIED_EXPORT,
    });

    await this.hwtRepo.save([hwt1, hwt2]);

    // Seed Harvest Dispatches
    const disp1 = this.dispatchRepo.create({
      dispatchCode: 'DISP-2026-REEF-088',
      orchardLotId: lot1.id,
      hwtBatchId: hwt1.id,
      fruitType: FruitType.MANGO,
      cultivar: FruitCultivar.KHIRSAPAT_HIMSAGAR,
      dispatchWeightKg: 2000,
      cratesCount: 400,
      packagingType: PackagingType.CORRUGATED_5KG_VENTILATED,
      brixSugarDegree: 18.8,
      gradingQuality: DispatchGradingQuality.EXPORT_GRADE_SUPERIOR,
      reeferVanPlateNumber: 'DHAKA-METRO-TA-14-8890',
      reeferSetpointCelsius: 11.0,
      currentTransitTempCelsius: 11.2,
      currentTransitHumidityPct: 88.5,
      coldChainStatus: ColdChainTransitStatus.OPTIMAL_CHILLED,
      originHub: 'Shibganj Agro-Hub, Chapainawabganj',
      destinationMarket:
        'DAC Hazrat Shahjalal International Airport Air Cargo Terminal',
      status: 'IN_TRANSIT',
    });

    const disp2 = this.dispatchRepo.create({
      dispatchCode: 'DISP-2026-REEF-089',
      orchardLotId: lot2.id,
      hwtBatchId: hwt2.id,
      fruitType: FruitType.LITCHI,
      cultivar: FruitCultivar.DINAJPUR_BEDANA_LITCHI,
      dispatchWeightKg: 800,
      cratesCount: 160,
      packagingType: PackagingType.CORRUGATED_5KG_VENTILATED,
      brixSugarDegree: 19.4,
      gradingQuality: DispatchGradingQuality.EXPORT_GRADE_SUPERIOR,
      reeferVanPlateNumber: 'DINAJPUR-METRO-MA-11-2045',
      reeferSetpointCelsius: 3.0,
      currentTransitTempCelsius: 3.2,
      currentTransitHumidityPct: 92.0,
      coldChainStatus: ColdChainTransitStatus.OPTIMAL_CHILLED,
      originHub: 'Birol Litchi Chilling Hub, Dinajpur',
      destinationMarket: 'Gulshan Premium Retail Logistics Center, Dhaka',
      status: 'IN_TRANSIT',
    });

    await this.dispatchRepo.save([disp1, disp2]);
  }

  // 1. Algorithmic Pre-Harvest Valuation & Yield Calculator
  calculateOrchardValuation(dto: CalculateOrchardValuationDto) {
    const cultivarBasePriceMap: Record<FruitCultivar, number> = {
      [FruitCultivar.KHIRSAPAT_HIMSAGAR]: 120,
      [FruitCultivar.LANGRA]: 100,
      [FruitCultivar.AMRAPALI]: 90,
      [FruitCultivar.FAZLI]: 75,
      [FruitCultivar.HARIBHANGA]: 110,
      [FruitCultivar.GOURMATI]: 220,
      [FruitCultivar.ASHWINA]: 65,
      [FruitCultivar.DINAJPUR_BEDANA_LITCHI]: 280,
      [FruitCultivar.CHINA_3_LITCHI]: 320,
      [FruitCultivar.BOMBAY_LITCHI]: 180,
      [FruitCultivar.MADRAJI_LITCHI]: 150,
    };

    const basePricePerKg = cultivarBasePriceMap[dto.cultivar] || 100;

    // Fruit set factor normalized against standard 80% fruit-set
    const fruitSetFactor = Math.min(
      1.3,
      Math.max(0.6, dto.floweringFruitSetPct / 80.0),
    );

    // Bagging protection premium
    let baggingProtectionBonusPct = 0;
    if (dto.fruitBaggingStatus === FruitBaggingStatus.BAG_PROTECTED) {
      baggingProtectionBonusPct = 15; // 15% higher packout yield, no fruit fly stinging
    } else if (dto.fruitBaggingStatus === FruitBaggingStatus.PARTIALLY_BAGGED) {
      baggingProtectionBonusPct = 5;
    }

    // GI Tag premium bonus
    const giPremiumBonusPct = dto.isGiCertified ? 20 : 0;

    const effectiveYieldKg = Math.round(
      dto.treeCount *
        dto.averageYieldKgPerTree *
        fruitSetFactor *
        (1 + baggingProtectionBonusPct / 100),
    );

    const effectivePricePerKg = Math.round(
      basePricePerKg * (1 + giPremiumBonusPct / 100),
    );

    const recommendedReservePriceBdt = Math.round(
      effectiveYieldKg * effectivePricePerKg,
    );

    // Escrow payment tranches (30% signing, 40% bagging/mid-development, 30% harvest settlement)
    const tranche1SigningBdt = Math.round(recommendedReservePriceBdt * 0.3);
    const tranche2BaggingBdt = Math.round(recommendedReservePriceBdt * 0.4);
    const tranche3HarvestBdt = Math.round(recommendedReservePriceBdt * 0.3);

    return {
      fruitType: dto.fruitType,
      cultivar: dto.cultivar,
      treeCount: dto.treeCount,
      basePricePerKg,
      effectivePricePerKg,
      fruitSetFactor: Number(fruitSetFactor.toFixed(2)),
      baggingProtectionBonusPct,
      giPremiumBonusPct,
      effectiveYieldKg,
      recommendedReservePriceBdt,
      escrowPaymentSchedule: {
        tranche1SigningBdt,
        tranche2BaggingBdt,
        tranche3HarvestBdt,
        tranche1Pct: 30,
        tranche2Pct: 40,
        tranche3Pct: 30,
      },
      exportReadinessNote:
        dto.fruitBaggingStatus === FruitBaggingStatus.BAG_PROTECTED
          ? 'Bagged fruit qualifies for UK/EU MRL & chemical residue safety protocol.'
          : 'Conventional unbagged fruit requires pre-harvest DAE chemical residue clearance.',
    };
  }

  // 2. Hot Water Treatment (HWT) & Cold-Chain Phytosanitary Evaluator
  evaluateHwtQuarantine(dto: EvaluateHwtQuarantineDto) {
    const isWaterTempCompliant =
      dto.waterTempCelsius >= 47.5 && dto.waterTempCelsius <= 48.5;
    const isDurationCompliant =
      dto.immersionDurationMinutes >= 58 && dto.immersionDurationMinutes <= 62;
    const isCoreTempCompliant =
      dto.fruitCoreTempCelsius >= 46.2 && dto.fruitCoreTempCelsius <= 47.5;

    let hwtVerdict = 'HWT_OPTIMAL_PHYTO_PASSED';
    let hwtNotes =
      'Hot water immersion meets EPPO/DAE phytosanitary protocol (48°C for 60 min). Oriental fruit fly eggs and larvae completely inactivated.';

    if (dto.waterTempCelsius < 47.0) {
      hwtVerdict = 'HWT_UNDERHEATED_QUARANTINE_RISK';
      hwtNotes =
        'Water temperature is sub-lethal for Bactrocera dorsalis larvae. Export quarantine pass blocked.';
    } else if (dto.waterTempCelsius > 48.8) {
      hwtVerdict = 'HWT_OVERHEATED_SCALDING_RISK';
      hwtNotes =
        'Water temperature exceeds 48.8°C. High risk of fruit pulp cooking, lenticel spotting, and skin scalding.';
    } else if (!isDurationCompliant) {
      hwtVerdict = 'HWT_DURATION_NON_COMPLIANT';
      hwtNotes = 'Immersion duration must be strictly 60 minutes.';
    }

    // Pesticide MRL Status (EU/BSTI threshold: 0.05 ppm)
    const isMrlSafe = dto.chemicalMrlPpm <= 0.05;
    const mrlVerdict = isMrlSafe ? 'MRL_PASSED_SAFE' : 'MRL_EXCEEDED_FAIL';

    // Cold chain status
    let coldChainStatus = ColdChainTransitStatus.OPTIMAL_CHILLED;
    let coldChainNotes = 'Transit climate within biological optimal bounds.';

    if (dto.fruitType === FruitType.MANGO) {
      // Optimal 10-12°C, 85-90% RH
      if (dto.transitTempCelsius < 8.0) {
        coldChainStatus = ColdChainTransitStatus.TEMPERATURE_SPIKE_ALERT;
        coldChainNotes =
          'Chilling injury warning: Low temperature causes grey scald and inability to ripen.';
      } else if (dto.transitTempCelsius > 14.0) {
        coldChainStatus = ColdChainTransitStatus.WARMING_RISK;
        coldChainNotes =
          'Warm transit risk: Accelerates ethylene ripening and anthracnose rot development.';
      }
    } else {
      // Litchi: Optimal 2-4°C, 90-95% RH
      if (dto.transitTempCelsius > 5.5 || dto.transitHumidityPct < 85.0) {
        coldChainStatus = ColdChainTransitStatus.WARMING_RISK;
        coldChainNotes =
          'Pericarp browning risk: Litchi red skin browns rapidly under warm or low humidity transit.';
      }
    }

    const exportApproved =
      hwtVerdict === 'HWT_OPTIMAL_PHYTO_PASSED' &&
      isMrlSafe &&
      coldChainStatus === ColdChainTransitStatus.OPTIMAL_CHILLED;

    return {
      hwtVerdict,
      hwtNotes,
      mrlVerdict,
      chemicalMrlPpm: dto.chemicalMrlPpm,
      mrlThresholdPpm: 0.05,
      isMrlSafe,
      coldChainStatus,
      coldChainNotes,
      exportApproved,
      recommendation: exportApproved
        ? 'Batch cleared for DAE Phytosanitary Quarantine Certificate and Airport Reefer Dispatch.'
        : 'Batch failed phytosanitary quarantine or cold-chain parameters. Divert to domestic processed pulp/juice channel.',
    };
  }

  // 3. Orchard Auction Lots CRUD & Bidding
  async getAuctionLots(
    region?: OrchardRegion,
    fruitType?: FruitType,
    status?: OrchardAuctionStatus,
  ): Promise<OrchardTreeAuctionLot[]> {
    const qb = this.lotRepo.createQueryBuilder('lot');

    if (region) {
      qb.andWhere('lot.region = :region', { region });
    }
    if (fruitType) {
      qb.andWhere('lot.fruitType = :fruitType', { fruitType });
    }
    if (status) {
      qb.andWhere('lot.status = :status', { status });
    }

    qb.orderBy('lot.createdAt', 'DESC');
    return qb.getMany();
  }

  async getAuctionLotById(id: string): Promise<OrchardTreeAuctionLot> {
    const lot = await this.lotRepo.findOne({ where: { id } });
    if (!lot) {
      throw new NotFoundException(`Orchard auction lot with ID ${id} not found`);
    }
    return lot;
  }

  async createAuctionLot(
    dto: CreateOrchardAuctionLotDto,
  ): Promise<OrchardTreeAuctionLot> {
    const count = await this.lotRepo.count();
    const regionPrefix = dto.region.split('_')[0].slice(0, 4);
    const lotNumber = `ORCH-${new Date().getFullYear()}-${regionPrefix}-${String(count + 1).padStart(3, '0')}`;

    const newLot = this.lotRepo.create({
      ...dto,
      lotNumber,
      currentHighestBidBdt: dto.baseReservePriceBdt,
      advanceEscrowPct: dto.advanceEscrowPct ?? 30.0,
      advanceEscrowPaidBdt: 0,
      status: OrchardAuctionStatus.AUCTION_OPEN,
      bids: [],
      auctionClosingDate: dto.auctionClosingDate
        ? new Date(dto.auctionClosingDate)
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      expectedHarvestStartDate: dto.expectedHarvestStartDate
        ? new Date(dto.expectedHarvestStartDate)
        : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    });

    return this.lotRepo.save(newLot);
  }

  async placeOrchardBid(
    id: string,
    dto: PlaceOrchardBidDto,
  ): Promise<OrchardTreeAuctionLot> {
    const lot = await this.getAuctionLotById(id);

    if (lot.status !== OrchardAuctionStatus.AUCTION_OPEN) {
      throw new BadRequestException(
        `Auction is not open for bidding (current status: ${lot.status})`,
      );
    }

    const minBidRequired = lot.currentHighestBidBdt + 5000;
    if (dto.bidAmountBdt < minBidRequired) {
      throw new BadRequestException(
        `Bid amount ৳${dto.bidAmountBdt.toLocaleString()} is below the minimum next bid required of ৳${minBidRequired.toLocaleString()}`,
      );
    }

    const newBidRecord = {
      id: `bid-${Date.now()}`,
      bidderName: dto.bidderName,
      bidderPhone: dto.bidderPhone,
      bidAmountBdt: dto.bidAmountBdt,
      placedAt: new Date().toISOString(),
    };

    lot.bids = [...(lot.bids || []), newBidRecord];
    lot.currentHighestBidBdt = dto.bidAmountBdt;
    lot.highestBidderBrokerName = dto.bidderName;
    lot.highestBidderBrokerPhone = dto.bidderPhone;
    lot.advanceEscrowPaidBdt = Math.round(
      dto.bidAmountBdt * (lot.advanceEscrowPct / 100),
    );

    return this.lotRepo.save(lot);
  }

  // 4. Hot Water Treatment Batches
  async getHwtBatches(
    fruitType?: FruitType,
    status?: HwtTreatmentStatus,
  ): Promise<PhytosanitaryHwtBatch[]> {
    const qb = this.hwtRepo.createQueryBuilder('hwt');

    if (fruitType) {
      qb.andWhere('hwt.fruitType = :fruitType', { fruitType });
    }
    if (status) {
      qb.andWhere('hwt.status = :status', { status });
    }

    qb.orderBy('hwt.createdAt', 'DESC');
    return qb.getMany();
  }

  async getHwtBatchById(id: string): Promise<PhytosanitaryHwtBatch> {
    const batch = await this.hwtRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`HWT batch with ID ${id} not found`);
    }
    return batch;
  }

  async createHwtBatch(
    dto: CreatePhytosanitaryHwtBatchDto,
  ): Promise<PhytosanitaryHwtBatch> {
    const count = await this.hwtRepo.count();
    const batchNumber = `HWT-${new Date().getFullYear()}-DAE-${String(count + 1).padStart(4, '0')}`;

    const isSafe =
      dto.waterTempCelsius >= 47.5 &&
      dto.waterTempCelsius <= 48.5 &&
      dto.immersionDurationMinutes >= 58 &&
      dto.pesticideMrlPpm <= 0.05;

    const phytosanitaryCertificateNumber = isSafe
      ? `DAE/PQW-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}-EXP`
      : undefined;

    const newBatch = this.hwtRepo.create({
      ...dto,
      batchNumber,
      quarantinePassIssued: isSafe,
      phytosanitaryCertificateNumber,
      status: isSafe
        ? HwtTreatmentStatus.QUARANTINE_CERTIFIED_EXPORT
        : HwtTreatmentStatus.QUARANTINE_REJECTED,
    });

    return this.hwtRepo.save(newBatch);
  }

  // 5. Harvest Cold-Chain Dispatches
  async getDispatches(status?: string): Promise<OrchardHarvestDispatch[]> {
    const qb = this.dispatchRepo.createQueryBuilder('dispatch');

    if (status) {
      qb.andWhere('dispatch.status = :status', { status });
    }

    qb.orderBy('dispatch.createdAt', 'DESC');
    return qb.getMany();
  }

  async getDispatchById(id: string): Promise<OrchardHarvestDispatch> {
    const dispatch = await this.dispatchRepo.findOne({ where: { id } });
    if (!dispatch) {
      throw new NotFoundException(`Dispatch record with ID ${id} not found`);
    }
    return dispatch;
  }

  async createDispatch(
    dto: CreateOrchardHarvestDispatchDto,
  ): Promise<OrchardHarvestDispatch> {
    const count = await this.dispatchRepo.count();
    const dispatchCode = `DISP-${new Date().getFullYear()}-REEF-${String(count + 1).padStart(3, '0')}`;

    let coldChainStatus = ColdChainTransitStatus.OPTIMAL_CHILLED;
    if (dto.fruitType === FruitType.MANGO) {
      if (dto.currentTransitTempCelsius < 8.0) {
        coldChainStatus = ColdChainTransitStatus.TEMPERATURE_SPIKE_ALERT;
      } else if (dto.currentTransitTempCelsius > 14.0) {
        coldChainStatus = ColdChainTransitStatus.WARMING_RISK;
      }
    } else {
      if (
        dto.currentTransitTempCelsius > 5.5 ||
        dto.currentTransitHumidityPct < 85.0
      ) {
        coldChainStatus = ColdChainTransitStatus.WARMING_RISK;
      }
    }

    const newDispatch = this.dispatchRepo.create({
      ...dto,
      dispatchCode,
      coldChainStatus,
      status: 'IN_TRANSIT',
    });

    return this.dispatchRepo.save(newDispatch);
  }

  async updateDispatchColdChain(
    id: string,
    dto: UpdateDispatchColdChainDto,
  ): Promise<OrchardHarvestDispatch> {
    const dispatch = await this.getDispatchById(id);

    dispatch.currentTransitTempCelsius = dto.currentTransitTempCelsius;
    dispatch.currentTransitHumidityPct = dto.currentTransitHumidityPct;

    if (dto.coldChainStatus) {
      dispatch.coldChainStatus = dto.coldChainStatus;
    } else {
      if (dispatch.fruitType === FruitType.MANGO) {
        if (dto.currentTransitTempCelsius < 8.0) {
          dispatch.coldChainStatus =
            ColdChainTransitStatus.TEMPERATURE_SPIKE_ALERT;
        } else if (dto.currentTransitTempCelsius > 14.0) {
          dispatch.coldChainStatus = ColdChainTransitStatus.WARMING_RISK;
        } else {
          dispatch.coldChainStatus = ColdChainTransitStatus.OPTIMAL_CHILLED;
        }
      } else {
        if (
          dto.currentTransitTempCelsius > 5.5 ||
          dto.currentTransitHumidityPct < 85.0
        ) {
          dispatch.coldChainStatus = ColdChainTransitStatus.WARMING_RISK;
        } else {
          dispatch.coldChainStatus = ColdChainTransitStatus.OPTIMAL_CHILLED;
        }
      }
    }

    if (dto.status) {
      dispatch.status = dto.status;
    }

    return this.dispatchRepo.save(dispatch);
  }
}
