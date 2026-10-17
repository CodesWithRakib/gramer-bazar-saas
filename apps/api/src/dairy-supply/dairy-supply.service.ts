import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DairyMilkCollectionEntry } from './entities/dairy-milk-collection-entry.entity.js';
import { MilkChillingVatTelemetry } from './entities/milk-chilling-vat-telemetry.entity.js';
import { LivestockFeedGroupBuyPool } from './entities/livestock-feed-group-buy-pool.entity.js';
import {
  MilkType,
  MilkShift,
  MilkQualityGrade,
  ChillingVatStatus,
  FeedCategory,
  PaymentSettlementStatus,
} from './enums/dairy-supply.enum.js';
import {
  CalculateMilkRateDto,
  CalculateFeedSavingsDto,
  CreateMilkCollectionDto,
  RecordChillingTelemetryDto,
  CreateFeedPoolDto,
  JoinFeedPoolDto,
} from './dto/dairy-supply.dto.js';

@Injectable()
export class DairySupplyService {
  private readonly logger = new Logger(DairySupplyService.name);

  constructor(
    @InjectRepository(DairyMilkCollectionEntry)
    private readonly collectionRepo: Repository<DairyMilkCollectionEntry>,
    @InjectRepository(MilkChillingVatTelemetry)
    private readonly vatRepo: Repository<MilkChillingVatTelemetry>,
    @InjectRepository(LivestockFeedGroupBuyPool)
    private readonly feedPoolRepo: Repository<LivestockFeedGroupBuyPool>,
  ) {
    this.seedBaselineData().catch((err) =>
      this.logger.error('Failed to seed baseline dairy supply chain data', err),
    );
  }

  private async seedBaselineData(): Promise<void> {
    const vatCount = await this.vatRepo.count();
    if (vatCount === 0) {
      this.logger.log('Seeding baseline Bulk Milk Cooler (BMC) IoT chilling vats...');
      const seedVats: Partial<MilkChillingVatTelemetry>[] = [
        {
          vatCode: 'BMC-BAG-01',
          chillingCenterId: 'chilling-baghabari-01',
          chillingCenterName: 'বাঘাবাড়ি মিল্ক চিলিং প্ল্যান্ট',
          district: 'Sirajganj',
          capacityLiters: 5000,
          currentVolumeLiters: 4150,
          currentTemperatureCelsius: 3.8,
          agitatorRpm: 32,
          compressorStatus: 'RUNNING',
          vatStatus: ChillingVatStatus.OPTIMAL_CHILLED_4C,
          isAlarmActive: false,
          alarmReason: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          vatCode: 'BMC-BERA-02',
          chillingCenterId: 'chilling-bera-02',
          chillingCenterName: 'বেড়া দুগ্ধ সমবায় ও চিলিং সেন্টার',
          district: 'Pabna',
          capacityLiters: 3000,
          currentVolumeLiters: 2480,
          currentTemperatureCelsius: 4.1,
          agitatorRpm: 30,
          compressorStatus: 'RUNNING',
          vatStatus: ChillingVatStatus.OPTIMAL_CHILLED_4C,
          isAlarmActive: false,
          alarmReason: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          vatCode: 'BMC-GURU-03',
          chillingCenterId: 'chilling-gurudaspur-03',
          chillingCenterName: 'গুরুদাসপুর চিলিং সেন্টার',
          district: 'Natore',
          capacityLiters: 3000,
          currentVolumeLiters: 1920,
          currentTemperatureCelsius: 4.0,
          agitatorRpm: 32,
          compressorStatus: 'RUNNING',
          vatStatus: ChillingVatStatus.OPTIMAL_CHILLED_4C,
          isAlarmActive: false,
          alarmReason: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          vatCode: 'BMC-TALA-04',
          chillingCenterId: 'chilling-tala-04',
          chillingCenterName: 'তালা মহিষ ও ডেইরি ক্লাস্টার চিলিং পয়েন্ট',
          district: 'Satkhira',
          capacityLiters: 2000,
          currentVolumeLiters: 1650,
          currentTemperatureCelsius: 4.2,
          agitatorRpm: 30,
          compressorStatus: 'RUNNING',
          vatStatus: ChillingVatStatus.OPTIMAL_CHILLED_4C,
          isAlarmActive: false,
          alarmReason: null,
          lastRecordedAt: new Date().toISOString(),
        },
      ];

      for (const v of seedVats) {
        await this.vatRepo.save(this.vatRepo.create(v));
      }
      this.logger.log('Seeded 4 baseline Bulk Milk Cooler IoT vats.');
    }

    const collectionCount = await this.collectionRepo.count();
    if (collectionCount === 0) {
      this.logger.log('Seeding baseline dairy milk collection passbook entries...');
      const seedEntries: Partial<DairyMilkCollectionEntry>[] = [
        {
          collectionVoucherNo: 'MLK-BAG-2026-081',
          farmerId: 'farmer-dairy-01',
          farmerName: 'মোঃ আব্দুর রহিম',
          farmerPhone: '01711122233',
          cooperativeCenterId: 'chilling-baghabari-01',
          cooperativeName: 'বাঘাবাড়ি মিল্ক চিলিং প্ল্যান্ট',
          milkType: MilkType.COW_MILK,
          collectionShift: MilkShift.MORNING_SHIFT,
          volumeLiters: 25.0,
          lactometerReadingCorrected: 29.5,
          fatPercentage: 4.3,
          snfPercentage: 8.6,
          mbrtHours: 4.5,
          qualityGrade: MilkQualityGrade.GRADE_A_PREMIUM_CHILLED,
          ratePerLiterBdt: 72.5,
          totalPayoutAmountBdt: 1812.5,
          paymentStatus: PaymentSettlementStatus.DISBURSED_MFS_WALLET,
          collectionDate: '2026-10-16',
          adulterationNotes: null,
        },
        {
          collectionVoucherNo: 'MLK-BERA-2026-082',
          farmerId: 'farmer-dairy-02',
          farmerName: 'করিম শেখ',
          farmerPhone: '01822334455',
          cooperativeCenterId: 'chilling-bera-02',
          cooperativeName: 'বেড়া দুগ্ধ সমবায় ও চিলিং সেন্টার',
          milkType: MilkType.COW_MILK,
          collectionShift: MilkShift.MORNING_SHIFT,
          volumeLiters: 18.5,
          lactometerReadingCorrected: 30.0,
          fatPercentage: 4.6,
          snfPercentage: 8.8,
          mbrtHours: 5.0,
          qualityGrade: MilkQualityGrade.GRADE_A_PREMIUM_CHILLED,
          ratePerLiterBdt: 74.5,
          totalPayoutAmountBdt: 1378.25,
          paymentStatus: PaymentSettlementStatus.DISBURSED_MFS_WALLET,
          collectionDate: '2026-10-16',
          adulterationNotes: null,
        },
        {
          collectionVoucherNo: 'MLK-TALA-2026-083',
          farmerId: 'farmer-dairy-03',
          farmerName: 'সুফিয়া খাতুন (মহিষ খামারী)',
          farmerPhone: '01933445566',
          cooperativeCenterId: 'chilling-tala-04',
          cooperativeName: 'তালা মহিষ ও ডেইরি ক্লাস্টার চিলিং পয়েন্ট',
          milkType: MilkType.BUFFALO_MILK,
          collectionShift: MilkShift.MORNING_SHIFT,
          volumeLiters: 22.0,
          lactometerReadingCorrected: 31.0,
          fatPercentage: 6.8,
          snfPercentage: 9.47,
          mbrtHours: 5.5,
          qualityGrade: MilkQualityGrade.GRADE_A_PREMIUM_CHILLED,
          ratePerLiterBdt: 95.0,
          totalPayoutAmountBdt: 2090.0,
          paymentStatus: PaymentSettlementStatus.PAYMENT_PENDING,
          collectionDate: '2026-10-17',
          adulterationNotes: null,
        },
      ];

      for (const e of seedEntries) {
        await this.collectionRepo.save(this.collectionRepo.create(e));
      }
      this.logger.log('Seeded 3 baseline dairy milk collection entries.');
    }

    const feedPoolCount = await this.feedPoolRepo.count();
    if (feedPoolCount === 0) {
      this.logger.log('Seeding baseline Livestock Feed Group Buy Pools...');
      const seedFeedPools: Partial<LivestockFeedGroupBuyPool>[] = [
        {
          poolCode: 'FEED-POOL-SIRAJ-01',
          feedCategory: FeedCategory.MUSTARD_OIL_CAKE,
          feedBrandOrMillName: 'পাবনা খাঁটি সরিষার খৈল (High Protein 34%)',
          targetVolumeKg: 6000,
          committedVolumeKg: 4200,
          discountedPricePerKgBdt: 37.5,
          retailMarketPricePerKgBdt: 48.0,
          minimumFarmerParticipants: 5,
          currentParticipantsCount: 14,
          deliveryHubLocation: 'বাঘাবাড়ি ফিড ডিপো ও সমবায় ভবন',
          poolClosingDate: '2026-10-25',
          isClosedAndOrdered: false,
        },
        {
          poolCode: 'FEED-POOL-NATORE-02',
          feedCategory: FeedCategory.CORN_SILAGE_FERMENTED,
          feedBrandOrMillName: 'সবুজ ভুট্টা সাইলেজ (অ্যানারোবিক ফার্মেন্টেড)',
          targetVolumeKg: 10000,
          committedVolumeKg: 7800,
          discountedPricePerKgBdt: 11.5,
          retailMarketPricePerKgBdt: 16.0,
          minimumFarmerParticipants: 6,
          currentParticipantsCount: 18,
          deliveryHubLocation: 'গুরুদাসপুর সমবায় গোডাউন',
          poolClosingDate: '2026-10-22',
          isClosedAndOrdered: false,
        },
        {
          poolCode: 'FEED-POOL-PABNA-03',
          feedCategory: FeedCategory.WHEAT_BRAN_COARSE,
          feedBrandOrMillName: 'মোটা গমের লাল ভুষি (ফাইবার সমৃদ্ধ)',
          targetVolumeKg: 5000,
          committedVolumeKg: 3100,
          discountedPricePerKgBdt: 41.0,
          retailMarketPricePerKgBdt: 52.0,
          minimumFarmerParticipants: 5,
          currentParticipantsCount: 11,
          deliveryHubLocation: 'বেড়া ঘাট সমবায় পয়েন্ট',
          poolClosingDate: '2026-10-24',
          isClosedAndOrdered: false,
        },
      ];

      for (const fp of seedFeedPools) {
        await this.feedPoolRepo.save(this.feedPoolRepo.create(fp));
      }
      this.logger.log('Seeded 3 baseline Livestock Feed Group Buy Pools.');
    }
  }

  // --- Lactometer & SNF Quality Rate Calculations ---
  calculateMilkRate(dto: CalculateMilkRateDto) {
    const milkType = dto.milkType || MilkType.COW_MILK;
    const clr = dto.lactometerReadingCorrected;
    const fat = dto.fatPercentage;

    // Richmond's formula: SNF % = (CLR / 4) + (0.2 * Fat) + 0.36
    const snf = Number(((clr / 4) + (0.2 * fat) + 0.36).toFixed(2));

    // Base pricing standards in Bangladesh:
    // Cow milk baseline: 3.5% fat, 8.0% SNF = 65 BDT/L
    // Buffalo milk baseline: 6.0% fat, 9.0% SNF = 85 BDT/L
    const baseRate = milkType === MilkType.BUFFALO_MILK ? 85.0 : 65.0;
    const baseFat = milkType === MilkType.BUFFALO_MILK ? 6.0 : 3.5;
    const baseSnf = milkType === MilkType.BUFFALO_MILK ? 9.0 : 8.0;

    // Incentives: +3.5 BDT per 0.5% fat increment, +2.0 BDT per 0.5% SNF increment
    const fatDiff = fat - baseFat;
    const snfDiff = snf - baseSnf;

    const fatBonus = Number(((fatDiff / 0.5) * 3.5).toFixed(2));
    const snfBonus = Number(((snfDiff / 0.5) * 2.0).toFixed(2));

    let calculatedRate = Number((baseRate + fatBonus + snfBonus).toFixed(2));

    // Adulteration & Quality checks
    let qualityGrade = MilkQualityGrade.GRADE_B_STANDARD;
    let adulterationWarning: string | null = null;

    if (clr < 26.0) {
      qualityGrade = MilkQualityGrade.GRADE_C_SUBSTANDARD;
      adulterationWarning = 'সতর্কতা: ল্যাকটোমিটার রিডিং ২৬-এর নিচে। পানিতে দুধ পাতলা করা (Water Dilution) শনাক্ত হয়েছে।';
      calculatedRate = Math.max(45.0, calculatedRate - 15.0);
    } else if (clr > 33.0 && fat < 3.0) {
      qualityGrade = MilkQualityGrade.REJECTED_CURDLED_OR_ADULTERATED;
      adulterationWarning = 'সতর্কতা: কৃত্রিম স্টার্চ বা স্কিম মিল্ক পাউডার মিশ্রণ সন্দেহজনক।';
      calculatedRate = 0;
    } else if (fat >= (milkType === MilkType.BUFFALO_MILK ? 6.5 : 4.2) && snf >= 8.5) {
      qualityGrade = MilkQualityGrade.GRADE_A_PREMIUM_CHILLED;
    }

    const volume = dto.volumeLiters || 1.0;
    const totalPayoutAmount = Number((calculatedRate * volume).toFixed(2));

    return {
      milkType,
      volumeLiters: volume,
      fatPercentage: fat,
      lactometerReadingCorrected: clr,
      calculatedSnfPercentage: snf,
      qualityGrade,
      baseRatePerLiterBdt: baseRate,
      fatBonusBdt: fatBonus,
      snfBonusBdt: snfBonus,
      ratePerLiterBdt: calculatedRate,
      totalPayoutAmountBdt: totalPayoutAmount,
      adulterationWarning,
      verdictBn:
        qualityGrade === MilkQualityGrade.GRADE_A_PREMIUM_CHILLED
          ? `প্রিমিয়াম এ-গ্রেড দুধ (ফ্যাট ${fat}%, এসএনএফ ${snf}%)। প্রতি লিটারে ৳${calculatedRate} পাওনা নির্ধারিত হয়েছে।`
          : qualityGrade === MilkQualityGrade.GRADE_B_STANDARD
            ? `স্ট্যান্ডার্ড গ্রেড বি দুধ। নির্ধারিত দর প্রতি লিটারে ৳${calculatedRate}।`
            : adulterationWarning || 'দুধের ঘনত্ব ও ফ্যাট পরিমাণের পুনঃপরীক্ষা প্রয়োজন।',
    };
  }

  // --- Livestock Feed Bulk Pooling Savings Calculator ---
  calculateFeedSavings(dto: CalculateFeedSavingsDto) {
    let retailPrice = 48.0;
    let poolPrice = 37.5;
    let defaultMonthlyKg = 90;

    switch (dto.feedCategory) {
      case FeedCategory.MUSTARD_OIL_CAKE:
        retailPrice = 48.0;
        poolPrice = 37.5;
        defaultMonthlyKg = 90; // ~3 kg/day
        break;
      case FeedCategory.CORN_SILAGE_FERMENTED:
        retailPrice = 16.0;
        poolPrice = 11.5;
        defaultMonthlyKg = 360; // ~12 kg/day
        break;
      case FeedCategory.WHEAT_BRAN_COARSE:
        retailPrice = 52.0;
        poolPrice = 41.0;
        defaultMonthlyKg = 120; // ~4 kg/day
        break;
      case FeedCategory.PELLETTED_DAIRY_FEED:
        retailPrice = 45.0;
        poolPrice = 36.0;
        defaultMonthlyKg = 150;
        break;
      case FeedCategory.CALCIUM_MINERAL_PREMIX:
        retailPrice = 140.0;
        poolPrice = 105.0;
        defaultMonthlyKg = 5;
        break;
    }

    const monthlyKgPerCow = dto.monthlyConsumptionKgPerCow || defaultMonthlyKg;
    const totalMonthlyKg = dto.herdCowsCount * monthlyKgPerCow;

    const retailCostTotal = Math.round(totalMonthlyKg * retailPrice);
    const pooledCostTotal = Math.round(totalMonthlyKg * poolPrice);
    const netSavingsBdt = retailCostTotal - pooledCostTotal;
    const savingsPercentage = Math.round((netSavingsBdt / retailCostTotal) * 100);

    return {
      feedCategory: dto.feedCategory,
      herdCowsCount: dto.herdCowsCount,
      monthlyKgPerCow,
      totalMonthlyVolumeKg: totalMonthlyKg,
      retailPricePerKgBdt: retailPrice,
      pooledPricePerKgBdt: poolPrice,
      retailCostTotalBdt: retailCostTotal,
      pooledCostTotalBdt: pooledCostTotal,
      netMonthlySavingsBdt: netSavingsBdt,
      savingsPercentage,
      savingsRecommendationBn: `সমবায় বাল্ক অর্ডারে ${dto.herdCowsCount}টি গাভীর জন্য মাসে ৳${netSavingsBdt.toLocaleString()} টাকা সাশ্রয় হবে (${savingsPercentage}% কম খরচ)।`,
    };
  }

  // --- Overview Statistics ---
  async getOverviewStats() {
    const collections = await this.collectionRepo.find({ order: { createdAt: 'DESC' } });
    const totalCollectedLiters = collections.reduce((acc, c) => acc + Number(c.volumeLiters), 0);
    const avgFat = collections.length > 0
      ? Number((collections.reduce((acc, c) => acc + Number(c.fatPercentage), 0) / collections.length).toFixed(2))
      : 4.2;

    const vats = await this.vatRepo.find({ order: { createdAt: 'DESC' } });
    const totalChilledLiters = vats.reduce((acc, v) => acc + Number(v.currentVolumeLiters), 0);
    const activeAlarmsCount = vats.filter((v) => v.isAlarmActive).length;

    const pools = await this.feedPoolRepo.find({ order: { createdAt: 'DESC' } });
    const totalFeedCommittedKg = pools.reduce((acc, p) => acc + p.committedVolumeKg, 0);

    return {
      totalCollectedLiters: Math.round(totalCollectedLiters),
      averageFatPercentage: avgFat,
      totalChilledVatsCount: vats.length,
      totalCurrentChilledLiters: Math.round(totalChilledLiters),
      activeChillingAlarmsCount: activeAlarmsCount,
      activeFeedPoolsCount: pools.length,
      totalFeedCommittedKg,
    };
  }

  // --- Collection Ledger Entries ---
  async createCollectionEntry(farmerId: string, dto: CreateMilkCollectionDto) {
    const rateCalc = this.calculateMilkRate({
      fatPercentage: dto.fatPercentage,
      lactometerReadingCorrected: dto.lactometerReadingCorrected,
      milkType: dto.milkType,
      volumeLiters: dto.volumeLiters,
    });

    const voucherNo = `MLK-${Date.now().toString().slice(-6)}`;

    const entry = this.collectionRepo.create({
      collectionVoucherNo: voucherNo,
      farmerId,
      farmerName: dto.farmerName,
      farmerPhone: dto.farmerPhone,
      cooperativeCenterId: dto.cooperativeCenterId,
      cooperativeName: dto.cooperativeName,
      milkType: dto.milkType,
      collectionShift: dto.collectionShift,
      volumeLiters: dto.volumeLiters,
      lactometerReadingCorrected: dto.lactometerReadingCorrected,
      fatPercentage: dto.fatPercentage,
      snfPercentage: rateCalc.calculatedSnfPercentage,
      mbrtHours: dto.mbrtHours ?? 4.5,
      qualityGrade: rateCalc.qualityGrade,
      ratePerLiterBdt: rateCalc.ratePerLiterBdt,
      totalPayoutAmountBdt: rateCalc.totalPayoutAmountBdt,
      paymentStatus: PaymentSettlementStatus.PAYMENT_PENDING,
      collectionDate: dto.collectionDate,
      adulterationNotes: rateCalc.adulterationWarning || dto.adulterationNotes || null,
    });

    const saved = await this.collectionRepo.save(entry);
    this.logger.log(`Created milk collection entry ${saved.collectionVoucherNo} for ${saved.farmerName} (৳${saved.totalPayoutAmountBdt})`);
    return saved;
  }

  async getMyCollections(farmerId: string) {
    return this.collectionRepo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCollectionsByCenter(centerId: string) {
    return this.collectionRepo.find({
      where: { cooperativeCenterId: centerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllAdminCollections() {
    return this.collectionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async disbursePayment(id: string) {
    const entry = await this.collectionRepo.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`Collection entry with ID "${id}" was not found.`);
    }

    entry.paymentStatus = PaymentSettlementStatus.DISBURSED_MFS_WALLET;
    const saved = await this.collectionRepo.save(entry);
    this.logger.log(`Disbursed payout ৳${entry.totalPayoutAmountBdt} to farmer ${entry.farmerName}`);
    return saved;
  }

  // --- Bulk Milk Cooler (BMC) IoT Telemetry ---
  async getChillingVats() {
    return this.vatRepo.find({ order: { createdAt: 'DESC' } });
  }

  async recordChillingTelemetry(dto: RecordChillingTelemetryDto) {
    let vat = await this.vatRepo.findOne({ where: { vatCode: dto.vatCode } });
    if (!vat) {
      throw new NotFoundException(`Chilling vat with code "${dto.vatCode}" was not found.`);
    }

    vat.currentVolumeLiters = dto.currentVolumeLiters;
    vat.currentTemperatureCelsius = dto.currentTemperatureCelsius;

    if (dto.agitatorRpm !== undefined) {
      vat.agitatorRpm = dto.agitatorRpm;
    }
    if (dto.compressorStatus) {
      vat.compressorStatus = dto.compressorStatus;
    }

    // High temperature alert threshold: strictly 7.0°C to prevent bacterial souring
    if (dto.currentTemperatureCelsius > 7.0) {
      vat.vatStatus = ChillingVatStatus.TEMPERATURE_ALARM_HIGH;
      vat.isAlarmActive = true;
      vat.alarmReason = `সতর্কবার্তা: তাপমাত্রা ${dto.currentTemperatureCelsius}°C এ পৌঁছেছে (আদর্শ ৪.০°C অতিক্রম)। দ্রুত কম্প্রেশার ও পাওয়ার চেক করুন।`;
      this.logger.warn(`CRITICAL CHILLING ALERT: Vat ${vat.vatCode} temp is ${dto.currentTemperatureCelsius}°C!`);
    } else {
      vat.vatStatus = dto.vatStatus || ChillingVatStatus.OPTIMAL_CHILLED_4C;
      vat.isAlarmActive = dto.isAlarmActive ?? false;
      vat.alarmReason = dto.alarmReason || null;
    }

    vat.lastRecordedAt = new Date().toISOString();
    return this.vatRepo.save(vat);
  }

  // --- Livestock Feed Group Buy Pools ---
  async getFeedPools() {
    return this.feedPoolRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createFeedPool(dto: CreateFeedPoolDto) {
    const poolCode = `FEED-POOL-${Date.now().toString().slice(-6)}`;

    const pool = this.feedPoolRepo.create({
      poolCode,
      feedCategory: dto.feedCategory,
      feedBrandOrMillName: dto.feedBrandOrMillName,
      targetVolumeKg: dto.targetVolumeKg,
      committedVolumeKg: 0,
      discountedPricePerKgBdt: dto.discountedPricePerKgBdt,
      retailMarketPricePerKgBdt: dto.retailMarketPricePerKgBdt,
      minimumFarmerParticipants: dto.minimumFarmerParticipants ?? 5,
      currentParticipantsCount: 0,
      deliveryHubLocation: dto.deliveryHubLocation,
      poolClosingDate: dto.poolClosingDate,
      isClosedAndOrdered: false,
    });

    return this.feedPoolRepo.save(pool);
  }

  async joinFeedPool(dto: JoinFeedPoolDto) {
    const pool = await this.feedPoolRepo.findOne({ where: { id: dto.poolId } });
    if (!pool) {
      throw new NotFoundException(`Feed pool with ID "${dto.poolId}" was not found.`);
    }

    pool.committedVolumeKg += dto.orderedKg;
    pool.currentParticipantsCount += 1;

    if (pool.committedVolumeKg >= pool.targetVolumeKg) {
      pool.isClosedAndOrdered = true;
    }

    const saved = await this.feedPoolRepo.save(pool);
    this.logger.log(`Farmer joined feed pool ${pool.poolCode} (+${dto.orderedKg} kg). Total: ${pool.committedVolumeKg} kg`);
    return saved;
  }
}
