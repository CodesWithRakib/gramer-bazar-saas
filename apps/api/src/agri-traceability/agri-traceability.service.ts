import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProduceBatch,
  VisualAssessmentData,
  CheckpointLog,
} from './entities/produce-batch.entity.js';
import {
  CropType,
  ProduceGrade,
  PesticideUsage,
  BatchStatus,
  CheckpointStage,
} from './enums/produce-traceability.enum.js';
import { User } from '../users/entities/user.entity.js';
import { WarehouseHub } from '../inventory/entities/warehouse-hub.entity.js';
import {
  CreateProduceBatchDto,
  AddCheckpointLogDto,
  ReassessQualityDto,
} from './dto/produce-batch.dto.js';

export interface QualityGradingInput {
  uniformityScore?: number;
  surfaceDefectScore?: number;
  colorScore?: number;
  moistureScore?: number;
  organicCertified?: boolean;
  pesticideProfile?: PesticideUsage;
}

export interface GradingEvaluationResult {
  grade: ProduceGrade;
  score: number;
  defectPercentage: number;
  visualAssessment: VisualAssessmentData;
}

@Injectable()
export class AgriTraceabilityService {
  constructor(
    @InjectRepository(ProduceBatch)
    private readonly batchRepository: Repository<ProduceBatch>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WarehouseHub)
    private readonly hubRepository: Repository<WarehouseHub>,
  ) {}

  /**
   * Evaluates produce quality and determines grade tiering, defect %, and price premium
   */
  evaluateProduceQuality(input: QualityGradingInput): GradingEvaluationResult {
    const uniformity = Number(input.uniformityScore ?? 80);
    const surfaceDefect = Number(input.surfaceDefectScore ?? 85);
    const color = Number(input.colorScore ?? 80);
    const moisture = Number(input.moistureScore ?? 80);

    // Weighted composite quality score (0 to 100)
    let compositeScore =
      0.3 * uniformity + 0.35 * surfaceDefect + 0.2 * color + 0.15 * moisture;

    // Organic certification boost
    if (input.organicCertified) {
      compositeScore = Math.min(100, compositeScore + 5);
    }

    // Pesticide safety penalties
    if (input.pesticideProfile === PesticideUsage.THRESHOLD_EXCEEDED) {
      compositeScore = Math.min(48, compositeScore - 30);
    }

    const finalScore = Math.round(compositeScore);
    const defectPct = Math.max(
      0.5,
      Math.min(100, Math.round((100 - surfaceDefect) * 0.45 * 10) / 10),
    );

    let grade: ProduceGrade;
    let recommendationEn: string;
    let recommendationBn: string;
    let pricePremiumPercent: number;

    if (finalScore >= 85) {
      grade = ProduceGrade.GRADE_A;
      recommendationEn =
        'Premium export/urban grade. High size uniformity and flawless skin. Recommended +15% to +20% mandi price premium.';
      recommendationBn =
        'প্রিমিয়াম রপ্তানি ও সুপারমার্কেট গ্রেড। আকার চমৎকার ও দাগহীন। বাজারদরের চেয়ে ১৫-২০% বেশি দামে বিক্রির উপযোগী।';
      pricePremiumPercent = 18;
    } else if (finalScore >= 70) {
      grade = ProduceGrade.GRADE_B;
      recommendationEn =
        'Standard wholesale grade. Suitable for direct mandi sales and urban grocery distribution.';
      recommendationBn =
        'স্ট্যান্ডার্ড পাইকারি গ্রেড। সরাসরি হাট-বাজার ও সাধারণ খুচরা বিক্রির জন্য চমৎকার।';
      pricePremiumPercent = 5;
    } else if (finalScore >= 50) {
      grade = ProduceGrade.GRADE_C;
      recommendationEn =
        'Commercial processing grade. Recommended for food processing (purees, chips, packaging) or local wholesale.';
      recommendationBn =
        'প্রক্রিয়াজাতকরণ গ্রেড। চিপস, পিউরি বা প্রক্রিয়াজাত খাদ্য কারখানায় সরবরাহের জন্য উপযোগী।';
      pricePremiumPercent = -10;
    } else {
      grade = ProduceGrade.REJECTED;
      recommendationEn =
        'Substandard quality or significant spoilage detected. Not recommended for commercial food sales without secondary sorting.';
      recommendationBn =
        'মানসম্মত নয় বা অতিরিক্ত দাগযুক্ত। বাছাইকরণ ছাড়া সরাসরি বাণিজ্যিক বিক্রির জন্য অনুপযুক্ত।';
      pricePremiumPercent = -35;
    }

    return {
      grade,
      score: finalScore,
      defectPercentage: defectPct,
      visualAssessment: {
        uniformityScore: uniformity,
        surfaceDefectScore: surfaceDefect,
        colorScore: color,
        moistureScore: moisture,
        recommendationEn,
        recommendationBn,
        pricePremiumPercent,
      },
    };
  }

  /**
   * Create a new produce batch with AI quality assessment and initial trace timeline
   */
  async createProduceBatch(sellerId: string, dto: CreateProduceBatchDto): Promise<ProduceBatch> {
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new NotFoundException('Seller profile not found.');
    }

    let hub: WarehouseHub | null = null;
    if (dto.storageHubId) {
      hub = await this.hubRepository.findOne({ where: { id: dto.storageHubId } });
    }

    // Run automated quality grading
    const evaluation = this.evaluateProduceQuality({
      uniformityScore: dto.uniformityScore,
      surfaceDefectScore: dto.surfaceDefectScore,
      colorScore: dto.colorScore,
      moistureScore: dto.moistureScore,
      organicCertified: dto.organicCertified,
      pesticideProfile: dto.pesticideProfile,
    });

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const distCode = (dto.district || 'BD').substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const batchNumber = `BATCH-${datePrefix}-${distCode}-${randomSuffix}`;
    const qrPayload = `/trace/${batchNumber}`;

    const nowIso = new Date().toISOString();
    const sellerFullName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Producer';

    const initialCheckpoints: CheckpointLog[] = [
      {
        stage: CheckpointStage.HARVEST,
        timestamp: new Date(dto.harvestDate).toISOString(),
        location: dto.farmLocation,
        handlerName: sellerFullName,
        notes: `Harvest of ${dto.harvestYieldKg} kg ${dto.variety} ${dto.cropType} recorded at farm site.`,
      },
      {
        stage: CheckpointStage.AI_QUALITY_INSPECTION,
        timestamp: nowIso,
        location: `${dto.district} Quality Verification Point`,
        handlerName: 'Gramer Bazar Computer Vision Grading Engine',
        notes: `Automated produce grading completed: ${evaluation.grade} (Quality Score: ${evaluation.score}/100, Defect: ${evaluation.defectPercentage}%).`,
      },
    ];

    if (hub) {
      initialCheckpoints.push({
        stage: CheckpointStage.COLD_STORAGE_DEPOSIT,
        timestamp: nowIso,
        location: hub.name || `${hub.district} Hub`,
        handlerName: 'Logistics Warehouse Operator',
        notes: `Produce batch deposited at ${hub.name || 'Regional Hub'} cold storage facility.`,
      });
    }

    const batch = this.batchRepository.create({
      batchNumber,
      sellerId,
      cropType: dto.cropType,
      variety: dto.variety,
      harvestDate: new Date(dto.harvestDate),
      farmLocation: dto.farmLocation,
      division: dto.division,
      district: dto.district,
      upazila: dto.upazila,
      harvestYieldKg: dto.harvestYieldKg,
      availableKg: dto.harvestYieldKg,
      qualityGrade: evaluation.grade,
      qualityScore: evaluation.score,
      defectPercentage: evaluation.defectPercentage,
      visualAssessment: evaluation.visualAssessment,
      organicCertified: !!dto.organicCertified,
      pesticideProfile: dto.pesticideProfile || PesticideUsage.INTEGRATED_PEST_MANAGEMENT,
      storageHubId: dto.storageHubId || null,
      status: hub ? BatchStatus.IN_COLD_STORAGE : BatchStatus.GRADED,
      qrCodePayload: qrPayload,
      checkpoints: initialCheckpoints,
    });

    return this.batchRepository.save(batch);
  }

  /**
   * Get all batches for a specific seller
   */
  async getSellerBatches(sellerId: string, page = 1, limit = 20, cropType?: CropType) {
    const query = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.storageHub', 'hub')
      .where('batch.sellerId = :sellerId', { sellerId })
      .orderBy('batch.createdAt', 'DESC');

    if (cropType) {
      query.andWhere('batch.cropType = :cropType', { cropType });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single batch by UUID
   */
  async getBatchById(id: string, sellerId?: string): Promise<ProduceBatch> {
    const query = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.seller', 'seller')
      .leftJoinAndSelect('batch.storageHub', 'hub')
      .where('batch.id = :id', { id });

    if (sellerId) {
      query.andWhere('batch.sellerId = :sellerId', { sellerId });
    }

    const batch = await query.getOne();
    if (!batch) {
      throw new NotFoundException('Produce batch record not found.');
    }
    return batch;
  }

  /**
   * Public traceability passport query by batchNumber (for QR scanner)
   */
  async getPublicBatchPassport(batchNumber: string) {
    const batch = await this.batchRepository.findOne({
      where: { batchNumber },
      relations: ['seller', 'storageHub'],
    });

    if (!batch) {
      throw new NotFoundException(`No agricultural produce found with batch passport '${batchNumber}'.`);
    }

    // Mask phone number for privacy e.g. 0171****567
    const rawPhone = batch.seller?.phone || '';
    const maskedPhone =
      rawPhone.length >= 8
        ? `${rawPhone.slice(0, 4)}****${rawPhone.slice(-3)}`
        : 'Registered Farmer';

    return {
      batchNumber: batch.batchNumber,
      cropType: batch.cropType,
      variety: batch.variety,
      harvestDate: batch.harvestDate,
      farmLocation: batch.farmLocation,
      region: `${batch.upazila}, ${batch.district}, ${batch.division}`,
      producer: {
        name: `${batch.seller?.firstName || ''} ${batch.seller?.lastName || ''}`.trim() || 'Verified Farmer',
        contactPhone: maskedPhone,
      },
      quality: {
        grade: batch.qualityGrade,
        score: batch.qualityScore,
        defectPercentage: batch.defectPercentage,
        organicCertified: batch.organicCertified,
        pesticideProfile: batch.pesticideProfile,
        assessmentDetails: batch.visualAssessment,
      },
      storage: batch.storageHub
        ? {
            hubName: batch.storageHub.name || `${batch.storageHub.district} Hub`,
            address: batch.storageHub.address,
            district: batch.storageHub.district,
          }
        : null,
      yieldKg: batch.harvestYieldKg,
      availableKg: batch.availableKg,
      status: batch.status,
      qrVerificationUrl: batch.qrCodePayload,
      timeline: batch.checkpoints || [],
      verifiedAt: batch.createdAt,
    };
  }

  /**
   * Add a handover checkpoint to the produce journey
   */
  async addCheckpointEvent(
    id: string,
    dto: AddCheckpointLogDto,
    sellerId?: string,
  ): Promise<ProduceBatch> {
    const batch = await this.getBatchById(id, sellerId);

    const newLog: CheckpointLog = {
      stage: dto.stage,
      timestamp: new Date().toISOString(),
      location: dto.location,
      handlerName: dto.handlerName,
      temperatureC: dto.temperatureC,
      humidity: dto.humidity,
      notes: dto.notes,
    };

    batch.checkpoints = [...(batch.checkpoints || []), newLog];

    // Transition status based on stage
    if (dto.stage === CheckpointStage.COLD_STORAGE_DEPOSIT) {
      batch.status = BatchStatus.IN_COLD_STORAGE;
    } else if (dto.stage === CheckpointStage.DISPATCH_IN_TRANSIT) {
      batch.status = BatchStatus.IN_TRANSIT;
    } else if (dto.stage === CheckpointStage.DELIVERED_TO_BUYER) {
      batch.status = BatchStatus.DISTRIBUTED;
    }

    return this.batchRepository.save(batch);
  }

  /**
   * Reassess quality grading scores
   */
  async reassessQuality(
    id: string,
    dto: ReassessQualityDto,
    sellerId?: string,
  ): Promise<ProduceBatch> {
    const batch = await this.getBatchById(id, sellerId);

    const evaluation = this.evaluateProduceQuality({
      uniformityScore: dto.uniformityScore ?? batch.visualAssessment?.uniformityScore,
      surfaceDefectScore: dto.surfaceDefectScore ?? batch.visualAssessment?.surfaceDefectScore,
      colorScore: dto.colorScore ?? batch.visualAssessment?.colorScore,
      moistureScore: dto.moistureScore ?? batch.visualAssessment?.moistureScore,
      organicCertified: batch.organicCertified,
      pesticideProfile: batch.pesticideProfile,
    });

    batch.qualityGrade = evaluation.grade;
    batch.qualityScore = evaluation.score;
    batch.defectPercentage = evaluation.defectPercentage;
    batch.visualAssessment = evaluation.visualAssessment;

    batch.checkpoints = [
      ...(batch.checkpoints || []),
      {
        stage: CheckpointStage.AI_QUALITY_INSPECTION,
        timestamp: new Date().toISOString(),
        location: `${batch.district} Quality Verification Point`,
        handlerName: 'Produce Inspection Auditor',
        notes: `Quality re-assessed: Grade ${evaluation.grade} (Score: ${evaluation.score}/100, Defect: ${evaluation.defectPercentage}%).`,
      },
    ];

    return this.batchRepository.save(batch);
  }
}
