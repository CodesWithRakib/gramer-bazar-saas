import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgriTraceabilityService } from './agri-traceability.service.js';
import {
  CropType,
  ProduceGrade,
  PesticideUsage,
  BatchStatus,
  CheckpointStage,
} from './enums/produce-traceability.enum.js';

describe('AgriTraceabilityService', () => {
  let service: AgriTraceabilityService;
  let mockBatchRepo: any;
  let mockUserRepo: any;
  let mockHubRepo: any;

  beforeEach(() => {
    mockBatchRepo = {
      create: vi.fn((dto) => ({ id: 'batch-uuid', ...dto })),
      save: vi.fn(async (b) => ({ id: b.id || 'batch-uuid', ...b })),
      findOne: vi.fn(),
      createQueryBuilder: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    mockHubRepo = {
      findOne: vi.fn(),
    };

    service = new AgriTraceabilityService(mockBatchRepo, mockUserRepo, mockHubRepo);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateProduceQuality', () => {
    it('should assign GRADE_A with price premium for high uniformity and low surface defects', () => {
      const result = service.evaluateProduceQuality({
        uniformityScore: 92,
        surfaceDefectScore: 90,
        colorScore: 95,
        moistureScore: 90,
        organicCertified: true,
      });

      expect(result.grade).toBe(ProduceGrade.GRADE_A);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.defectPercentage).toBeLessThan(10);
      expect(result.visualAssessment.pricePremiumPercent).toBe(18);
    });

    it('should assign GRADE_B for standard wholesale scores', () => {
      const result = service.evaluateProduceQuality({
        uniformityScore: 75,
        surfaceDefectScore: 78,
        colorScore: 70,
        moistureScore: 72,
      });

      expect(result.grade).toBe(ProduceGrade.GRADE_B);
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(result.score).toBeLessThan(85);
    });

    it('should penalize produce when pesticide threshold is exceeded', () => {
      const result = service.evaluateProduceQuality({
        uniformityScore: 95,
        surfaceDefectScore: 95,
        pesticideProfile: PesticideUsage.THRESHOLD_EXCEEDED,
      });

      expect(result.grade).toBe(ProduceGrade.REJECTED);
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('createProduceBatch', () => {
    it('should create batch with generated batch number, grade, and initial checkpoints', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'seller-1',
        firstName: 'Mokbul',
        lastName: 'Hossain',
      });

      const batch = await service.createProduceBatch('seller-1', {
        cropType: CropType.POTATO,
        variety: 'Diamond',
        harvestDate: '2026-10-15',
        farmLocation: 'Purba Birganj, Dinajpur',
        division: 'Rangpur',
        district: 'Dinajpur',
        upazila: 'Birganj',
        harvestYieldKg: 2000,
        uniformityScore: 90,
        surfaceDefectScore: 92,
        colorScore: 88,
        moistureScore: 85,
      });

      expect(batch).toBeDefined();
      expect(batch.batchNumber).toMatch(/^BATCH-\d{8}-DIN-\d{4}$/);
      expect(batch.qualityGrade).toBe(ProduceGrade.GRADE_A);
      expect(batch.checkpoints).toHaveLength(2);
      expect(batch.checkpoints[0].stage).toBe(CheckpointStage.HARVEST);
      expect(batch.checkpoints[1].stage).toBe(CheckpointStage.AI_QUALITY_INSPECTION);
    });
  });

  describe('getPublicBatchPassport', () => {
    it('should return public verifiable transparency passport with masked phone', async () => {
      const mockBatch = {
        batchNumber: 'BATCH-20261016-DIN-1234',
        cropType: CropType.POTATO,
        variety: 'Diamond',
        harvestDate: new Date('2026-10-15'),
        farmLocation: 'Birganj, Dinajpur',
        division: 'Rangpur',
        district: 'Dinajpur',
        upazila: 'Birganj',
        harvestYieldKg: 2000,
        availableKg: 2000,
        qualityGrade: ProduceGrade.GRADE_A,
        qualityScore: 91,
        defectPercentage: 4.5,
        organicCertified: true,
        pesticideProfile: PesticideUsage.ZERO_PESTICIDE_ORGANIC,
        status: BatchStatus.GRADED,
        qrCodePayload: '/trace/BATCH-20261016-DIN-1234',
        checkpoints: [{ stage: CheckpointStage.HARVEST, timestamp: '2026-10-15T00:00:00Z', location: 'Birganj', handlerName: 'Mokbul' }],
        seller: {
          firstName: 'Mokbul',
          lastName: 'Hossain',
          phone: '01711223344',
        },
        storageHub: null,
      };

      mockBatchRepo.findOne.mockResolvedValue(mockBatch);

      const passport = await service.getPublicBatchPassport('BATCH-20261016-DIN-1234');

      expect(passport.batchNumber).toBe('BATCH-20261016-DIN-1234');
      expect(passport.producer.name).toBe('Mokbul Hossain');
      expect(passport.producer.contactPhone).toBe('0171****344');
      expect(passport.quality.grade).toBe(ProduceGrade.GRADE_A);
      expect(passport.timeline).toHaveLength(1);
    });
  });

  describe('addCheckpointEvent', () => {
    it('should append handover checkpoint and transition status to IN_COLD_STORAGE', async () => {
      const mockBatch = {
        id: 'batch-1',
        sellerId: 'seller-1',
        checkpoints: [],
        status: BatchStatus.GRADED,
      };

      mockBatchRepo.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockBatch),
      });

      const updated = await service.addCheckpointEvent(
        'batch-1',
        {
          stage: CheckpointStage.COLD_STORAGE_DEPOSIT,
          location: 'Dinajpur Cold Storage Facility',
          handlerName: 'Warehouse Staff',
          temperatureC: 4.0,
          humidity: 85,
        },
        'seller-1',
      );

      expect(updated.status).toBe(BatchStatus.IN_COLD_STORAGE);
      expect(updated.checkpoints).toHaveLength(1);
      expect(updated.checkpoints[0].stage).toBe(CheckpointStage.COLD_STORAGE_DEPOSIT);
      expect(updated.checkpoints[0].temperatureC).toBe(4.0);
    });
  });
});
