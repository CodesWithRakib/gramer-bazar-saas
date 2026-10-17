import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoultryHatcheryBatch } from './entities/poultry-hatchery-batch.entity.js';
import { BrooderShedTelemetry } from './entities/brooder-shed-telemetry.entity.js';
import { TableEggGradingLot } from './entities/table-egg-grading-lot.entity.js';
import {
  PoultryBreedType,
  HatcheryFlockStage,
  VaccinationStatus,
  BrooderShedAlarmStatus,
  EggQualityGrade,
} from './enums/poultry-hatchery.enum.js';
import {
  CalculateFlockFcrDto,
  EvaluateEggGradingDto,
  CreatePoultryBatchDto,
  RecordBrooderTelemetryDto,
  CreateTableEggLotDto,
} from './dto/poultry-hatchery.dto.js';

@Injectable()
export class PoultryHatcheryService implements OnModuleInit {
  private readonly logger = new Logger(PoultryHatcheryService.name);

  constructor(
    @InjectRepository(PoultryHatcheryBatch)
    private readonly batchRepo: Repository<PoultryHatcheryBatch>,
    @InjectRepository(BrooderShedTelemetry)
    private readonly shedRepo: Repository<BrooderShedTelemetry>,
    @InjectRepository(TableEggGradingLot)
    private readonly eggRepo: Repository<TableEggGradingLot>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  private async seedBaselineData() {
    const batchCount = await this.batchRepo.count();
    if (batchCount === 0) {
      const seedBatches: Partial<PoultryHatcheryBatch>[] = [
        {
          batchCode: 'DOC-SON-GAZ-01',
          hatcheryName: 'গাজীপুর সেন্ট্রাল সোনালী হ্যাচারি',
          breederPhone: '01711223344',
          district: 'গাজীপুর',
          breedType: PoultryBreedType.SONALI_CLASSIC,
          flockStage: HatcheryFlockStage.DAY_OLD_CHICK_DOC,
          hatchDate: '2026-10-15',
          chickCount: 5000,
          averageWeightGrams: 42.0,
          vaccinationStatus: VaccinationStatus.MAREKS_DAY_1_CERTIFIED,
          dlsSurgeonCertificationNo: 'DLS-VET-GAZ-4412',
          unitPriceBdt: 38.0,
          mortalityCount: 45,
          isBiosecureCertified: true,
        },
        {
          batchCode: 'DOC-BRO-BGR-02',
          hatcheryName: 'বগুড়া কব্ব-৫০০ ব্রয়লার প্যারেন্ট হাব',
          breederPhone: '01722334455',
          district: 'বগুড়া',
          breedType: PoultryBreedType.BROILER_COBB_500,
          flockStage: HatcheryFlockStage.DAY_OLD_CHICK_DOC,
          hatchDate: '2026-10-16',
          chickCount: 10000,
          averageWeightGrams: 44.5,
          vaccinationStatus: VaccinationStatus.MAREKS_DAY_1_CERTIFIED,
          dlsSurgeonCertificationNo: 'DLS-VET-BGR-8801',
          unitPriceBdt: 55.0,
          mortalityCount: 80,
          isBiosecureCertified: true,
        },
        {
          batchCode: 'FIN-SON-MYM-03',
          hatcheryName: 'ময়মনসিংহ ভ্যালী সোনালী খামার',
          breederPhone: '01733445566',
          district: 'ময়মনসিংহ',
          breedType: PoultryBreedType.SONALI_CLASSIC,
          flockStage: HatcheryFlockStage.FINISHER_READY_FOR_MARKET,
          hatchDate: '2026-08-10',
          chickCount: 2500,
          averageWeightGrams: 1350.0,
          vaccinationStatus: VaccinationStatus.GUMBORO_IBD_BOOSTER_DONE,
          dlsSurgeonCertificationNo: 'DLS-VET-MYM-1029',
          unitPriceBdt: 280.0,
          mortalityCount: 65,
          isBiosecureCertified: true,
        },
        {
          batchCode: 'DK-BEL-KIS-04',
          hatcheryName: 'কিশোরগঞ্জ হাওর ডাকলিং হ্যাচারি',
          breederPhone: '01744556677',
          district: 'কিশোরগঞ্জ',
          breedType: PoultryBreedType.HAOR_BELGIAN_DUCK,
          flockStage: HatcheryFlockStage.DAY_OLD_CHICK_DOC,
          hatchDate: '2026-10-14',
          chickCount: 3000,
          averageWeightGrams: 48.0,
          vaccinationStatus: VaccinationStatus.RANIKHET_NEWCASTLE_RDV_COMPLETED,
          dlsSurgeonCertificationNo: 'DLS-VET-KIS-9011',
          unitPriceBdt: 45.0,
          mortalityCount: 30,
          isBiosecureCertified: true,
        },
      ];

      for (const batch of seedBatches) {
        await this.batchRepo.save(this.batchRepo.create(batch));
      }
      this.logger.log('Seeded 4 baseline Poultry Hatchery Batches.');
    }

    const shedCount = await this.shedRepo.count();
    if (shedCount === 0) {
      const seedSheds: Partial<BrooderShedTelemetry>[] = [
        {
          shedCode: 'SHED-GAZ-01',
          farmName: 'প্যারাগন এগ্রো ব্রুডার শেড-১',
          district: 'গাজীপুর',
          flockBatchCode: 'DOC-SON-GAZ-01',
          temperatureCelsius: 33.5,
          relativeHumidityPercent: 60.0,
          ammoniaPpm: 12.0,
          exhaustFanState: 'AUTO',
          brooderHeaterState: 'HEATING',
          alarmStatus: BrooderShedAlarmStatus.OPTIMAL_BROODING_ENVIRONMENT,
          alarmMessage: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          shedCode: 'SHED-BGR-02',
          farmName: 'বগুড়া কব্ব মডেল ব্রুডার শেড-২',
          district: 'বগুড়া',
          flockBatchCode: 'DOC-BRO-BGR-02',
          temperatureCelsius: 34.0,
          relativeHumidityPercent: 62.0,
          ammoniaPpm: 14.5,
          exhaustFanState: 'AUTO',
          brooderHeaterState: 'HEATING',
          alarmStatus: BrooderShedAlarmStatus.OPTIMAL_BROODING_ENVIRONMENT,
          alarmMessage: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          shedCode: 'SHED-NRS-03',
          farmName: 'নরসিংদী লেয়ার পাললেট নার্সারি',
          district: 'নরসিংদী',
          flockBatchCode: null,
          temperatureCelsius: 28.5,
          relativeHumidityPercent: 68.0,
          ammoniaPpm: 18.0,
          exhaustFanState: 'OFF',
          brooderHeaterState: 'HEATING',
          alarmStatus: BrooderShedAlarmStatus.TEMPERATURE_COLD_CHILLING_ALERT,
          alarmMessage: 'সতর্কতা: তাপমাত্রা ২৮.৫°C এ নেমে গেছে (আদর্শ ৩২-৩৫°C)। ব্রুডার হিটার বাড়ানো প্রয়োজন।',
          lastRecordedAt: new Date().toISOString(),
        },
      ];

      for (const shed of seedSheds) {
        await this.shedRepo.save(this.shedRepo.create(shed));
      }
      this.logger.log('Seeded 3 baseline Brooder Shed Telemetry Units.');
    }

    const eggCount = await this.eggRepo.count();
    if (eggCount === 0) {
      const seedEggs: Partial<TableEggGradingLot>[] = [
        {
          lotNumber: 'EGG-LYR-NRS-01',
          farmName: 'নরসিংদী গোল্ডেন লেয়ার এগ্রো',
          district: 'নরসিংদী',
          collectionDate: '2026-10-16',
          totalEggsCount: 10800,
          averageEggWeightGrams: 66.5,
          eggGrade: EggQualityGrade.GRADE_AA_JUMBO_OVER_65G,
          uvSanitizationVerified: true,
          crackedEggPercentage: 0.8,
          pricePerHundredBdt: 1200,
          availableCasesCount: 30, // 30 cases * 360 = 10,800 eggs
        },
        {
          lotNumber: 'EGG-LYR-KIS-02',
          farmName: 'কিশোরগঞ্জ হাওর হাঁসের খামার',
          district: 'কিশোরগঞ্জ',
          collectionDate: '2026-10-15',
          totalEggsCount: 7200,
          averageEggWeightGrams: 62.0,
          eggGrade: EggQualityGrade.GRADE_A_LARGE_58_64G,
          uvSanitizationVerified: true,
          crackedEggPercentage: 1.1,
          pricePerHundredBdt: 1350, // Duck eggs have higher market premium
          availableCasesCount: 20,
        },
        {
          lotNumber: 'EGG-LYR-GAZ-03',
          farmName: 'গাজীপুর হাই-লাইন লেয়ার ফার্ম',
          district: 'গাজীপুর',
          collectionDate: '2026-10-16',
          totalEggsCount: 14400,
          averageEggWeightGrams: 59.5,
          eggGrade: EggQualityGrade.GRADE_A_LARGE_58_64G,
          uvSanitizationVerified: true,
          crackedEggPercentage: 0.9,
          pricePerHundredBdt: 1100,
          availableCasesCount: 40,
        },
      ];

      for (const egg of seedEggs) {
        await this.eggRepo.save(this.eggRepo.create(egg));
      }
      this.logger.log('Seeded 3 baseline Table Egg Grading Lots.');
    }
  }

  // --- Overview Dashboard Statistics ---
  async getOverviewStats() {
    const batches = await this.batchRepo.find();
    const sheds = await this.shedRepo.find();
    const eggs = await this.eggRepo.find();

    const totalActiveFlockCount = batches.reduce((acc, b) => acc + (b.chickCount - b.mortalityCount), 0);
    const totalDocProducedCount = batches
      .filter((b) => b.flockStage === HatcheryFlockStage.DAY_OLD_CHICK_DOC)
      .reduce((acc, b) => acc + b.chickCount, 0);

    const totalEggCasesAvailable = eggs.reduce((acc, e) => acc + e.availableCasesCount, 0);
    const totalEggsCount = eggs.reduce((acc, e) => acc + e.totalEggsCount, 0);

    return {
      totalActiveFlockCount,
      totalDocProducedCount,
      totalEggCasesAvailable,
      totalEggsCount,
      activeBrooderShedsCount: sheds.length,
      averageBroilerFcr: 1.58,
      averageSonaliFcr: 2.25,
    };
  }

  // --- FCR & Flock Mortality Calculator ---
  calculateFlockFcrAndMortality(dto: CalculateFlockFcrDto) {
    const initial = dto.initialChickCount;
    const current = dto.currentLiveCount;
    const feedKg = dto.cumulativeFeedConsumedKg;
    const avgWeightG = dto.averageWeightGrams;
    const breed = dto.breedType;

    const deadCount = Math.max(0, initial - current);
    const mortalityPercent = Number(((deadCount / initial) * 100).toFixed(2));

    const totalBiomassKg = Number(((current * avgWeightG) / 1000).toFixed(2));
    const calculatedFcr = totalBiomassKg > 0 ? Number((feedKg / totalBiomassKg).toFixed(2)) : 0;

    let fcrRating: 'EXCELLENT' | 'STANDARD' | 'POOR_FEED_WASTE' = 'STANDARD';
    if (breed === PoultryBreedType.BROILER_COBB_500) {
      if (calculatedFcr <= 1.55) fcrRating = 'EXCELLENT';
      else if (calculatedFcr > 1.75) fcrRating = 'POOR_FEED_WASTE';
    } else {
      // Sonali & others
      if (calculatedFcr <= 2.2) fcrRating = 'EXCELLENT';
      else if (calculatedFcr > 2.5) fcrRating = 'POOR_FEED_WASTE';
    }

    const isMortalityAlarm = mortalityPercent > 3.5;
    const mortalityAlertMessage = isMortalityAlarm
      ? `সতর্কতা: ফ্লকে মৃত্যুর হার ${mortalityPercent}% (স্বাভাবিক সীমা ৩.৫% অতিক্রম)। দ্রুত বায়োসিকিউরিটি ও উপজেলা প্রাণিসম্পদ কর্মকর্তার পরামর্শ নিন।`
      : null;

    // Economic metrics (assuming ৳68/kg feed price)
    const feedCostBdt = Number((feedKg * 68).toFixed(0));
    const feedCostPerKgMeatBdt = totalBiomassKg > 0 ? Number((feedCostBdt / totalBiomassKg).toFixed(1)) : 0;

    return {
      breedType: breed,
      initialChickCount: initial,
      currentLiveCount: current,
      mortalityCount: deadCount,
      mortalityPercentage: mortalityPercent,
      isMortalityAlarm,
      mortalityAlertMessage,
      totalBiomassKg,
      calculatedFcr,
      fcrRating,
      cumulativeFeedConsumedKg: feedKg,
      estimatedFeedCostBdt: feedCostBdt,
      feedCostPerKgMeatBdt,
      fcrBenchmarkExplanation:
        fcrRating === 'EXCELLENT'
          ? 'চমৎকার ফিড কনভার্সন রেশিও! খাদ্য অপচয় সর্বনিম্ন এবং ওজন বৃদ্ধির গতি সন্তোষজনক।'
          : fcrRating === 'STANDARD'
          ? 'মানসম্পন্ন এফসিআর। তবে ব্রুডিং তাপমাত্রা ও ফিডার ম্যানেজমেন্ট উন্নত করলে আরও সাশ্রয় সম্ভব।'
          : 'উচ্চ এফসিআর (খাদ্য অপচয়)। অতিরিক্ত তাপমাত্রা বা অন্ত্রের সংক্রমণ পরীক্ষা করুন।',
    };
  }

  // --- Commercial Table Egg Weight Sorter & Grading ---
  evaluateEggGrading(dto: EvaluateEggGradingDto) {
    const weight = dto.averageEggWeightGrams;
    const totalEggs = dto.totalEggsCount || 3600; // 10 cases default

    let eggGrade: EggQualityGrade;
    let pricePerHundredBdt = 1100;

    if (weight >= 65.0) {
      eggGrade = EggQualityGrade.GRADE_AA_JUMBO_OVER_65G;
      pricePerHundredBdt = 1250;
    } else if (weight >= 58.0) {
      eggGrade = EggQualityGrade.GRADE_A_LARGE_58_64G;
      pricePerHundredBdt = 1150;
    } else if (weight >= 50.0) {
      eggGrade = EggQualityGrade.GRADE_B_MEDIUM_50_57G;
      pricePerHundredBdt = 1020;
    } else {
      eggGrade = EggQualityGrade.GRADE_C_PULLET_UNDER_50G;
      pricePerHundredBdt = 880;
    }

    const casesCount = Math.floor(totalEggs / 360);
    const totalValuationBdt = Number(((totalEggs / 100) * pricePerHundredBdt).toFixed(0));

    return {
      averageEggWeightGrams: weight,
      eggGrade,
      pricePerHundredBdt,
      unitPricePerEggBdt: Number((pricePerHundredBdt / 100).toFixed(2)),
      totalEggsCount: totalEggs,
      commercialCasesCount: casesCount,
      totalValuationBdt,
      uvSanitizationStandard: 'ইউভি-সি (UV-C) ব্যাকটেরিয়া ও সালমোনেলা মুক্ত জীবাণুমুক্তকরণ প্রত্যয়িত।',
    };
  }

  // --- Hatchery Batches CRUD ---
  async getAllBatches() {
    return this.batchRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getBatchById(id: string) {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Poultry hatchery batch with ID ${id} not found.`);
    }
    return batch;
  }

  async createBatch(dto: CreatePoultryBatchDto) {
    const batchCode = `DOC-${dto.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const batch = this.batchRepo.create({
      batchCode,
      hatcheryName: dto.hatcheryName,
      breederPhone: dto.breederPhone,
      district: dto.district,
      breedType: dto.breedType,
      flockStage: dto.flockStage,
      hatchDate: dto.hatchDate,
      chickCount: dto.chickCount,
      averageWeightGrams: dto.averageWeightGrams,
      vaccinationStatus: dto.vaccinationStatus,
      dlsSurgeonCertificationNo: dto.dlsSurgeonCertificationNo || null,
      unitPriceBdt: dto.unitPriceBdt,
      mortalityCount: 0,
      isBiosecureCertified: dto.isBiosecureCertified ?? true,
    });

    const saved = await this.batchRepo.save(batch);
    this.logger.log(`Created Poultry Hatchery Batch ${saved.batchCode} (${saved.chickCount} birds)`);
    return saved;
  }

  // --- Brooder Shed IoT Telemetry ---
  async getAllBrooderTelemetry() {
    return this.shedRepo.find({ order: { createdAt: 'DESC' } });
  }

  async recordBrooderTelemetry(dto: RecordBrooderTelemetryDto) {
    let shed = await this.shedRepo.findOne({ where: { shedCode: dto.shedCode } });

    if (!shed) {
      shed = this.shedRepo.create({
        shedCode: dto.shedCode,
        farmName: `পোল্ট্রি ব্রুডার শেড (${dto.shedCode})`,
        district: 'গাজীপুর',
      });
    }

    shed.temperatureCelsius = dto.temperatureCelsius;
    shed.relativeHumidityPercent = dto.relativeHumidityPercent;
    shed.ammoniaPpm = dto.ammoniaPpm;

    if (dto.flockBatchCode) shed.flockBatchCode = dto.flockBatchCode;

    // Environmental thresholds:
    // Ammonia > 25 ppm: Toxic alert (triggers exhaust fan)
    // Temp < 30°C: Cold chilling alert (triggers heater)
    // Temp > 36°C: Heat stress alert (triggers cooling fan)
    if (dto.ammoniaPpm > 25.0) {
      shed.alarmStatus = BrooderShedAlarmStatus.AMMONIA_TOXIC_SPIKE_ALERT;
      shed.alarmMessage = `বিপদবার্তা: অ্যামোনিয়া গ্যাস ${dto.ammoniaPpm} ppm (সর্বোচ্চ সহনশীল ১৫ ppm)। অবিলম্বে এগজস্ট ফ্যান চালু করুন।`;
      shed.exhaustFanState = 'RUNNING';
    } else if (dto.temperatureCelsius < 30.0) {
      shed.alarmStatus = BrooderShedAlarmStatus.TEMPERATURE_COLD_CHILLING_ALERT;
      shed.alarmMessage = `শীতল ব্রুডার সতর্কতা: তাপমাত্রা ${dto.temperatureCelsius}°C এ নেমে গেছে (আদর্শ ৩২-৩৫°C)। হিটার বাড়ানো প্রয়োজন।`;
      shed.brooderHeaterState = 'HEATING';
    } else if (dto.temperatureCelsius > 36.0) {
      shed.alarmStatus = BrooderShedAlarmStatus.HIGH_HEAT_STRESS_ALERT;
      shed.alarmMessage = `অতিরিক্ত তাপ স্ট্রেস: তাপমাত্রা ${dto.temperatureCelsius}°C ছাড়িয়ে গেছে। কুলিং ফ্যান অন করুন।`;
      shed.exhaustFanState = 'RUNNING';
    } else {
      shed.alarmStatus = BrooderShedAlarmStatus.OPTIMAL_BROODING_ENVIRONMENT;
      shed.alarmMessage = null;
      shed.exhaustFanState = dto.exhaustFanState || 'AUTO';
      shed.brooderHeaterState = dto.brooderHeaterState || 'HEATING';
    }

    shed.lastRecordedAt = new Date().toISOString();
    return this.shedRepo.save(shed);
  }

  // --- Table Egg Grading Lots ---
  async getAllEggLots() {
    return this.eggRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createEggLot(dto: CreateTableEggLotDto) {
    const lotNumber = `EGG-${dto.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const gradeCalc = this.evaluateEggGrading({
      averageEggWeightGrams: dto.averageEggWeightGrams,
      totalEggsCount: dto.totalEggsCount,
    });

    const lot = this.eggRepo.create({
      lotNumber,
      farmName: dto.farmName,
      district: dto.district,
      collectionDate: dto.collectionDate,
      totalEggsCount: dto.totalEggsCount,
      averageEggWeightGrams: dto.averageEggWeightGrams,
      eggGrade: gradeCalc.eggGrade,
      uvSanitizationVerified: true,
      crackedEggPercentage: dto.crackedEggPercentage ?? 0.8,
      pricePerHundredBdt: dto.pricePerHundredBdt,
      availableCasesCount: dto.availableCasesCount,
    });

    const saved = await this.eggRepo.save(lot);
    this.logger.log(`Created Table Egg Lot ${saved.lotNumber} (${saved.totalEggsCount} eggs)`);
    return saved;
  }
}
