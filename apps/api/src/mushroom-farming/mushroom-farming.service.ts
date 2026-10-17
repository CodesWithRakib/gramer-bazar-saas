import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MushroomSpawnBatch } from './entities/mushroom-spawn-batch.entity.js';
import { FruitingChamberTelemetry } from './entities/fruiting-chamber-telemetry.entity.js';
import { DehydratedMushroomLot } from './entities/dehydrated-mushroom-lot.entity.js';
import {
  MushroomVariety,
  SpawnGenerationStage,
  MushroomProductForm,
  SubstrateSterilizationStatus,
  FruitingChamberAlarmStatus,
} from './enums/mushroom-farming.enum.js';
import {
  CalculateDehydrationYieldDto,
  CalculateChamberClimateDto,
  CreateSpawnBatchDto,
  RecordChamberTelemetryDto,
  CreateDehydratedLotDto,
} from './dto/mushroom-farming.dto.js';

@Injectable()
export class MushroomFarmingService implements OnModuleInit {
  private readonly logger = new Logger(MushroomFarmingService.name);

  constructor(
    @InjectRepository(MushroomSpawnBatch)
    private readonly spawnRepo: Repository<MushroomSpawnBatch>,
    @InjectRepository(FruitingChamberTelemetry)
    private readonly chamberRepo: Repository<FruitingChamberTelemetry>,
    @InjectRepository(DehydratedMushroomLot)
    private readonly lotRepo: Repository<DehydratedMushroomLot>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineData();
  }

  private async seedBaselineData() {
    const spawnCount = await this.spawnRepo.count();
    if (spawnCount === 0) {
      const seedSpawns: Partial<MushroomSpawnBatch>[] = [
        {
          batchNumber: 'SPAWN-OYS-SVR-01',
          labName: 'সাভার জাতীয় মাশরুম উন্নয়ন ইনস্টিটিউট ল্যাব',
          growerPhone: '01711334455',
          district: 'ঢাকা (সাভার)',
          variety: MushroomVariety.OYSTER_WHITE_PO2,
          generationStage: SpawnGenerationStage.PRIMARY_GRAIN_SPAWN,
          inoculationDate: '2026-10-01',
          packetsCount: 1500,
          sterilizationMethod: SubstrateSterilizationStatus.AUTOCLAVE_PRESSURE_STERILIZED,
          autoclaveTempCelsius: 121.0,
          autoclavePressurePsi: 15.0,
          nmdiLabCertificationNo: 'NMDI-LAB-SAV-2026-881',
          pricePerPacketBdt: 45.0,
          isContaminationFreeCertified: true,
        },
        {
          batchNumber: 'SPAWN-OYS-DIN-02',
          labName: 'দিনাজপুর আঞ্চলিক মাশরুম রিসার্চ সেন্টার',
          growerPhone: '01722445566',
          district: 'দিনাজপুর',
          variety: MushroomVariety.OYSTER_GREY_HK51,
          generationStage: SpawnGenerationStage.COMMERCIAL_SAWDUST_CYLINDER,
          inoculationDate: '2026-10-05',
          packetsCount: 2000,
          sterilizationMethod: SubstrateSterilizationStatus.AUTOCLAVE_PRESSURE_STERILIZED,
          autoclaveTempCelsius: 121.0,
          autoclavePressurePsi: 15.0,
          nmdiLabCertificationNo: 'NMDI-LAB-DIN-9012',
          pricePerPacketBdt: 42.0,
          isContaminationFreeCertified: true,
        },
        {
          batchNumber: 'SPAWN-GAN-GAZ-03',
          labName: 'গাজীপুর বায়োটেক ঔষধি রেইশি হাব',
          growerPhone: '01733556677',
          district: 'গাজীপুর',
          variety: MushroomVariety.GANODERMA_REISHI_MEDICINAL,
          generationStage: SpawnGenerationStage.MOTHER_TISSUE_CULTURE_SLANT,
          inoculationDate: '2026-09-20',
          packetsCount: 800,
          sterilizationMethod: SubstrateSterilizationStatus.AUTOCLAVE_PRESSURE_STERILIZED,
          autoclaveTempCelsius: 121.0,
          autoclavePressurePsi: 15.0,
          nmdiLabCertificationNo: 'NMDI-LAB-GAZ-4411',
          pricePerPacketBdt: 95.0,
          isContaminationFreeCertified: true,
        },
        {
          batchNumber: 'SPAWN-MIL-BGR-04',
          labName: 'বগুড়া পল্লি মাশরুম এগ্রো সেন্টার',
          growerPhone: '01744667788',
          district: 'বগুড়া',
          variety: MushroomVariety.MILKY_WHITE_SUMMER,
          generationStage: SpawnGenerationStage.COMMERCIAL_SAWDUST_CYLINDER,
          inoculationDate: '2026-10-08',
          packetsCount: 1200,
          sterilizationMethod: SubstrateSterilizationStatus.AUTOCLAVE_PRESSURE_STERILIZED,
          autoclaveTempCelsius: 121.0,
          autoclavePressurePsi: 15.0,
          nmdiLabCertificationNo: 'NMDI-LAB-BGR-7722',
          pricePerPacketBdt: 50.0,
          isContaminationFreeCertified: true,
        },
      ];

      for (const spawn of seedSpawns) {
        await this.spawnRepo.save(this.spawnRepo.create(spawn));
      }
      this.logger.log('Seeded 4 baseline Mushroom Spawn Batches.');
    }

    const chamberCount = await this.chamberRepo.count();
    if (chamberCount === 0) {
      const seedChambers: Partial<FruitingChamberTelemetry>[] = [
        {
          chamberCode: 'CHAMBER-SVR-01',
          farmName: 'সাভার মডেল ফ্রুটিং হাউজ-১',
          district: 'ঢাকা (সাভার)',
          activeBatchNumber: 'SPAWN-OYS-SVR-01',
          temperatureCelsius: 24.0,
          relativeHumidityPercent: 86.0,
          co2Ppm: 820.0,
          foggerMistState: 'AUTO',
          freshAirDamperState: 'AUTO',
          alarmStatus: FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE,
          alarmMessage: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          chamberCode: 'CHAMBER-DIN-02',
          farmName: 'দিনাজপুর শীতকালীন গ্রোয়ার শেড-২',
          district: 'দিনাজপুর',
          activeBatchNumber: 'SPAWN-OYS-DIN-02',
          temperatureCelsius: 23.5,
          relativeHumidityPercent: 88.0,
          co2Ppm: 780.0,
          foggerMistState: 'AUTO',
          freshAirDamperState: 'AUTO',
          alarmStatus: FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE,
          alarmMessage: null,
          lastRecordedAt: new Date().toISOString(),
        },
        {
          chamberCode: 'CHAMBER-GAZ-03',
          farmName: 'গাজীপুর ভেষজ রেইশি চেম্বার-৩',
          district: 'গাজীপুর',
          activeBatchNumber: 'SPAWN-GAN-GAZ-03',
          temperatureCelsius: 26.5,
          relativeHumidityPercent: 84.0,
          co2Ppm: 890.0,
          foggerMistState: 'AUTO',
          freshAirDamperState: 'AUTO',
          alarmStatus: FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE,
          alarmMessage: null,
          lastRecordedAt: new Date().toISOString(),
        },
      ];

      for (const chamber of seedChambers) {
        await this.chamberRepo.save(this.chamberRepo.create(chamber));
      }
      this.logger.log('Seeded 3 baseline Fruiting Chamber Telemetries.');
    }

    const lotCount = await this.lotRepo.count();
    if (lotCount === 0) {
      const seedLots: Partial<DehydratedMushroomLot>[] = [
        {
          lotCode: 'DRY-OYS-DHK-01',
          processorName: 'সাভার অর্গানিক মাশরুম ফুডস',
          district: 'ঢাকা (সাভার)',
          variety: MushroomVariety.OYSTER_WHITE_PO2,
          productForm: MushroomProductForm.DEHYDRATED_DRIED_SLICES,
          processingDate: '2026-10-14',
          freshWeightKg: 250.0,
          dryWeightKg: 25.0,
          moisturePercentage: 8.2,
          polysaccharideBetaGlucanPercent: null,
          isHermeticNitrogenSealed: true,
          pricePerKgBdt: 1600.0,
          availableStockKg: 25.0,
        },
        {
          lotCode: 'DRY-GAN-GAZ-02',
          processorName: 'গাজীপুর রেইশি সুপারফুড ল্যাব',
          district: 'গাজীপুর',
          variety: MushroomVariety.GANODERMA_REISHI_MEDICINAL,
          productForm: MushroomProductForm.MEDICINAL_EXTRACT_POWDER,
          processingDate: '2026-10-12',
          freshWeightKg: 120.0,
          dryWeightKg: 30.0,
          moisturePercentage: 7.5,
          polysaccharideBetaGlucanPercent: 28.5,
          isHermeticNitrogenSealed: true,
          pricePerKgBdt: 3800.0,
          availableStockKg: 30.0,
        },
        {
          lotCode: 'FRSH-OYS-DIN-03',
          processorName: 'দিনাজপুর মাশরুম এগ্রো ফার্মগেট',
          district: 'দিনাজপুর',
          variety: MushroomVariety.OYSTER_GREY_HK51,
          productForm: MushroomProductForm.FRESH_HARVEST_CRATES,
          processingDate: '2026-10-16',
          freshWeightKg: 500.0,
          dryWeightKg: 50.0,
          moisturePercentage: 89.0,
          polysaccharideBetaGlucanPercent: null,
          isHermeticNitrogenSealed: false,
          pricePerKgBdt: 240.0,
          availableStockKg: 150.0,
        },
      ];

      for (const lot of seedLots) {
        await this.lotRepo.save(this.lotRepo.create(lot));
      }
      this.logger.log('Seeded 3 baseline Dehydrated & Fresh Mushroom Lots.');
    }
  }

  // --- Overview Dashboard Statistics ---
  async getOverviewStats() {
    const spawns = await this.spawnRepo.find();
    const chambers = await this.chamberRepo.find();
    const lots = await this.lotRepo.find();

    const totalActiveSpawnPacketsCount = spawns.reduce((acc, s) => acc + s.packetsCount, 0);
    const totalDehydratedStockKg = lots
      .filter((l) => l.productForm === MushroomProductForm.DEHYDRATED_DRIED_SLICES || l.productForm === MushroomProductForm.MEDICINAL_EXTRACT_POWDER)
      .reduce((acc, l) => acc + Number(l.availableStockKg), 0);

    const totalFreshHarvestCapacityKg = lots
      .reduce((acc, l) => acc + Number(l.freshWeightKg), 0);

    const avgHumidity =
      chambers.length > 0
        ? Number(
            (
              chambers.reduce((acc, c) => acc + Number(c.relativeHumidityPercent), 0) /
              chambers.length
            ).toFixed(1)
          )
        : 85.0;

    return {
      totalActiveSpawnPacketsCount,
      totalDehydratedStockKg: Number(totalDehydratedStockKg.toFixed(1)),
      totalFreshHarvestCapacityKg: Number(totalFreshHarvestCapacityKg.toFixed(1)),
      activeFruitingChambersCount: chambers.length,
      averageChamberHumidityPercent: avgHumidity,
      averageDehydrationYieldPercent: 10.0, // standard 10% dry yield
    };
  }

  // --- Dehydration Yield & Moisture Loss Calculator ---
  calculateDehydrationYield(dto: CalculateDehydrationYieldDto) {
    const fresh = dto.freshWeightKg;
    const variety = dto.variety;
    const targetMoisture = dto.targetMoisturePercentage ?? 8.5;

    // Standard fresh-to-dry conversion ratios (kg fresh : 1 kg dry):
    // Oyster: 10:1 (10% yield)
    // Milky: 11:1 (9.1% yield)
    // Button: 12:1 (8.3% yield)
    // Ganoderma (Reishi): 4:1 (25% yield, woody bracket fungus)
    // Shiitake: 8:1 (12.5% yield)
    let freshToDryRatio = 10.0;
    let wholesalePricePerKgBdt = 1600;

    switch (variety) {
      case MushroomVariety.OYSTER_WHITE_PO2:
      case MushroomVariety.OYSTER_GREY_HK51:
        freshToDryRatio = 10.0;
        wholesalePricePerKgBdt = 1600;
        break;
      case MushroomVariety.MILKY_WHITE_SUMMER:
        freshToDryRatio = 11.0;
        wholesalePricePerKgBdt = 1750;
        break;
      case MushroomVariety.BUTTON_AGARICUS_WINTER:
        freshToDryRatio = 12.0;
        wholesalePricePerKgBdt = 2200;
        break;
      case MushroomVariety.GANODERMA_REISHI_MEDICINAL:
        freshToDryRatio = 4.0;
        wholesalePricePerKgBdt = 3800; // High value medicinal mushroom
        break;
      case MushroomVariety.SHIITAKE_LENTINULA:
        freshToDryRatio = 8.0;
        wholesalePricePerKgBdt = 2800;
        break;
    }

    const estimatedDryWeightKg = Number((fresh / freshToDryRatio).toFixed(2));
    const moistureLossKg = Number((fresh - estimatedDryWeightKg).toFixed(2));
    const yieldPercentage = Number(((estimatedDryWeightKg / fresh) * 100).toFixed(1));
    const estimatedValuationBdt = Number((estimatedDryWeightKg * wholesalePricePerKgBdt).toFixed(0));

    return {
      variety,
      freshWeightKg: fresh,
      freshToDryRatio: `${freshToDryRatio}:1`,
      estimatedDryWeightKg,
      moistureLossKg,
      yieldPercentage,
      targetMoisturePercentage: targetMoisture,
      estimatedWholesaleRatePerKgBdt: wholesalePricePerKgBdt,
      estimatedGrossValuationBdt: estimatedValuationBdt,
      shelfLifeComparison:
        'তাজা মাশরুমের আয়ুষ্কাল ৩–৫ দিন, যেখানে নাইট্রোজেন ফ্লাশ ও ১০% আর্দ্রতায় ভ্যাকুয়াম সিল করা ড্রাই মাশরুমের মেয়াদ ১২–১৮ মাস।',
      storageRecommendation:
        'খাদ্য গ্রেড ডিহাইড্রেটরে ৪৫°C–৫৫°C তাপমাত্রায় ৬–৮ ঘণ্টা ড্রায়িং নিশ্চিত করুন যাতে পলিফেনল ও প্রোটিন অক্ষুণ্ণ থাকে।',
    };
  }

  // --- Fruiting Chamber Climate Analyzer ---
  evaluateChamberClimate(dto: CalculateChamberClimateDto) {
    const temp = dto.temperatureCelsius;
    const hum = dto.relativeHumidityPercent;
    const co2 = dto.co2Ppm;

    let alarmStatus: FruitingChamberAlarmStatus = FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE;
    let alarmMessage: string | null = null;
    let recommendedDamperState = 'AUTO';
    let recommendedFoggerState = 'AUTO';

    if (co2 > 1000.0) {
      alarmStatus = FruitingChamberAlarmStatus.HIGH_CO2_SUFFOCATION_ALERT;
      alarmMessage = `উচ্চ CO₂ গ্যাস সতর্কতা: কার্বন-ডাই-অক্সাইড ${co2} ppm (অনুকূল সীমা < ১০০০ ppm)। অবিলম্বে ফ্রেশ এয়ার ড্যাম্পার খুলে অক্সিজেন সরবরাহ করুন।`;
      recommendedDamperState = 'OPEN_VENTILATING';
    } else if (hum < 80.0) {
      alarmStatus = FruitingChamberAlarmStatus.LOW_HUMIDITY_DRYOUT_ALERT;
      alarmMessage = `শুষ্ক আর্দ্রতা সতর্কতা: আপেক্ষিক আর্দ্রতা ${hum}% এ নেমে গেছে (অনুকূল ৮০–৯০%)। পিনহেড শুকিয়ে যাওয়া রোধে আল্ট্রাসনিক ফগার মিস্ট চালু করুন।`;
      recommendedFoggerState = 'RUNNING';
    } else if (temp > 28.0) {
      alarmStatus = FruitingChamberAlarmStatus.TEMPERATURE_HEAT_STRESS_ALERT;
      alarmMessage = `উচ্চ তাপ সতর্কতা: চেম্বারের তাপমাত্রা ${temp}°C (অনুকূল ২২–২৬°C)। কুলিং প্যাড ও পানি স্প্রে সক্রিয় করুন।`;
      recommendedDamperState = 'OPEN_VENTILATING';
    }

    return {
      temperatureCelsius: temp,
      relativeHumidityPercent: hum,
      co2Ppm: co2,
      alarmStatus,
      alarmMessage,
      recommendedDamperState,
      recommendedFoggerState,
      climateEvaluationNote:
        alarmStatus === FruitingChamberAlarmStatus.OPTIMAL_GROWTH_CLIMATE
          ? 'আদর্শ ফলন পরিবেশ। তাপমাত্রা, আর্দ্রতা ও CO₂ অনুপাত স্বাভাবিক থাকায় মাশরুম ক্যাপ ও ফ্রুটিং বডির সুষম বৃদ্ধি বজায় থাকবে।'
          : alarmMessage,
    };
  }

  // --- Spawn Batches CRUD ---
  async getAllSpawnBatches() {
    return this.spawnRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getSpawnBatchById(id: string) {
    const spawn = await this.spawnRepo.findOne({ where: { id } });
    if (!spawn) {
      throw new NotFoundException(`Mushroom spawn batch with ID ${id} not found.`);
    }
    return spawn;
  }

  async createSpawnBatch(dto: CreateSpawnBatchDto) {
    const batchNumber = `SPAWN-${dto.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const batch = this.spawnRepo.create({
      batchNumber,
      labName: dto.labName,
      growerPhone: dto.growerPhone,
      district: dto.district,
      variety: dto.variety,
      generationStage: dto.generationStage,
      inoculationDate: dto.inoculationDate,
      packetsCount: dto.packetsCount,
      sterilizationMethod: dto.sterilizationMethod,
      autoclaveTempCelsius: dto.autoclaveTempCelsius,
      autoclavePressurePsi: dto.autoclavePressurePsi,
      nmdiLabCertificationNo: dto.nmdiLabCertificationNo || null,
      pricePerPacketBdt: dto.pricePerPacketBdt,
      isContaminationFreeCertified: dto.isContaminationFreeCertified ?? true,
    });

    const saved = await this.spawnRepo.save(batch);
    this.logger.log(`Created Mushroom Spawn Batch ${saved.batchNumber} (${saved.packetsCount} packets)`);
    return saved;
  }

  // --- Fruiting Chamber IoT Telemetry ---
  async getAllChambers() {
    return this.chamberRepo.find({ order: { createdAt: 'DESC' } });
  }

  async recordChamberTelemetry(dto: RecordChamberTelemetryDto) {
    let chamber = await this.chamberRepo.findOne({ where: { chamberCode: dto.chamberCode } });

    if (!chamber) {
      chamber = this.chamberRepo.create({
        chamberCode: dto.chamberCode,
        farmName: `মাশরুম ফ্রুটিং হাউজ (${dto.chamberCode})`,
        district: 'ঢাকা (সাভার)',
      });
    }

    chamber.temperatureCelsius = dto.temperatureCelsius;
    chamber.relativeHumidityPercent = dto.relativeHumidityPercent;
    chamber.co2Ppm = dto.co2Ppm;

    if (dto.activeBatchNumber) chamber.activeBatchNumber = dto.activeBatchNumber;

    const evaluation = this.evaluateChamberClimate({
      temperatureCelsius: dto.temperatureCelsius,
      relativeHumidityPercent: dto.relativeHumidityPercent,
      co2Ppm: dto.co2Ppm,
    });

    chamber.alarmStatus = evaluation.alarmStatus;
    chamber.alarmMessage = evaluation.alarmMessage;
    chamber.foggerMistState = dto.foggerMistState || evaluation.recommendedFoggerState;
    chamber.freshAirDamperState = dto.freshAirDamperState || evaluation.recommendedDamperState;

    chamber.lastRecordedAt = new Date().toISOString();
    return this.chamberRepo.save(chamber);
  }

  // --- Dehydrated Lots CRUD ---
  async getAllDehydratedLots() {
    return this.lotRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createDehydratedLot(dto: CreateDehydratedLotDto) {
    const lotCode = `DRY-${dto.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const lot = this.lotRepo.create({
      lotCode,
      processorName: dto.processorName,
      district: dto.district,
      variety: dto.variety,
      productForm: dto.productForm,
      processingDate: dto.processingDate,
      freshWeightKg: dto.freshWeightKg,
      dryWeightKg: dto.dryWeightKg,
      moisturePercentage: dto.moisturePercentage,
      polysaccharideBetaGlucanPercent: dto.polysaccharideBetaGlucanPercent || null,
      isHermeticNitrogenSealed: dto.isHermeticNitrogenSealed ?? true,
      pricePerKgBdt: dto.pricePerKgBdt,
      availableStockKg: dto.availableStockKg,
    });

    const saved = await this.lotRepo.save(lot);
    this.logger.log(`Created Dehydrated Mushroom Lot ${saved.lotCode} (${saved.dryWeightKg} kg)`);
    return saved;
  }
}
