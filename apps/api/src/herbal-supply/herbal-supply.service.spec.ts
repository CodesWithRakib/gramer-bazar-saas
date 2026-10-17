import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HerbalSupplyService } from './herbal-supply.service.js';
import {
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
  GACPStandardGrade,
  LabCertificateStatus,
  SourcingContractStatus,
} from './enums/herbal-supply.enum.js';

describe('HerbalSupplyService', () => {
  let service: HerbalSupplyService;
  let mockBatchRepo: any;
  let mockContractRepo: any;
  let mockAuditRepo: any;

  const mockBatch = {
    id: 'batch-uuid-1',
    growerId: 'grower-100',
    batchNumber: 'HERB-2026-NTR-881',
    species: HerbalSpecies.KALOMEGH,
    plantPart: PlantPartUsed.LEAF_DRIED,
    processingState: ProcessingState.SHADE_DRIED_WHOLE,
    totalWeightKg: 1000,
    moistureContentPercentage: 8.8,
    gacpGrade: GACPStandardGrade.PHARMA_GRADE_A,
    certStatus: LabCertificateStatus.TESTED_COMPLIANT_DGDA,
    pricePerKgBdt: 320,
    isAvailable: true,
  };

  const mockContract = {
    id: 'contract-uuid-1',
    contractNumber: 'PHARMA-CNT-2026-901',
    pharmaCompanyId: 'pharma-1',
    contractStatus: SourcingContractStatus.CONTRACT_ACTIVE,
    acceptedAt: null,
  };

  beforeEach(() => {
    mockBatchRepo = {
      count: vi.fn().mockResolvedValue(0),
      find: vi.fn().mockResolvedValue([mockBatch]),
      findOne: vi.fn().mockImplementation(({ where: { id } }) => {
        if (id === mockBatch.id) return Promise.resolve(mockBatch);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((dto) => ({ id: 'new-batch-id', ...dto })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
      createQueryBuilder: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([mockBatch]),
      }),
    };

    mockContractRepo = {
      find: vi.fn().mockResolvedValue([mockContract]),
      findOne: vi.fn().mockImplementation(({ where: { id } }) => {
        if (id === mockContract.id) return Promise.resolve(mockContract);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((dto) => ({ id: 'new-contract-id', ...dto })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    mockAuditRepo = {
      create: vi.fn().mockImplementation((dto) => ({ id: 'new-audit-id', ...dto })),
      save: vi.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    service = new HerbalSupplyService(
      mockBatchRepo,
      mockContractRepo,
      mockAuditRepo,
    );
  });

  describe('calculateFreshToDryBiomass', () => {
    it('should compute correct dried yield and farmer advantage for leaves (5.5:1 ratio)', () => {
      const calcDto = {
        species: HerbalSpecies.VASAKA,
        plantPart: PlantPartUsed.LEAF_DRIED,
        freshHarvestKg: 1000,
      };

      const result = service.calculateFreshToDryBiomass(calcDto);

      expect(result.freshHarvestKg).toBe(1000);
      expect(result.expectedDryYieldKg).toBeCloseTo(181.82, 1);
      expect(result.conversionRatioText).toContain('5.5:1');
      expect(result.freshFarmgatePriceEstimateBdt).toBe(45000); // 1000 * 45
      expect(result.netFarmerAdvantageBdt).toBeGreaterThan(0);
      expect(result.recommendationBn).toContain('সৌর ড্রায়ারে');
    });

    it('should compute correct dried yield for roots/rhizomes (3.8:1 ratio)', () => {
      const calcDto = {
        species: HerbalSpecies.ASHWAGANDHA,
        plantPart: PlantPartUsed.ROOT_RHIZOME,
        freshHarvestKg: 500,
      };

      const result = service.calculateFreshToDryBiomass(calcDto);

      expect(result.expectedDryYieldKg).toBeCloseTo(131.58, 1);
      expect(result.conversionRatioText).toContain('3.8:1');
    });
  });

  describe('recordMoistureAudit', () => {
    it('should assign PHARMA_GRADE_A and TESTED_COMPLIANT_DGDA when moisture <= 10% and no aflatoxin', async () => {
      const auditDto = {
        batchId: 'batch-uuid-1',
        testedMoisturePercentage: 8.5,
        isAflatoxinDetected: false,
        leadHeavyMetalPpm: 0.04,
        foreignMatterPercentage: 0.1,
        inspectorName: 'Dr. Shahabuddin (DGDA Chemist)',
      };

      const audit = await service.recordMoistureAudit('insp-01', auditDto);

      expect(audit.evaluatedGrade).toBe(GACPStandardGrade.PHARMA_GRADE_A);
      expect(audit.complianceVerdictBn).toContain('ফার্মাকোপিয়া আর্দ্রতা মান (<১০%) উত্তীর্ণ');
      expect(mockBatchRepo.save).toHaveBeenCalled();
    });

    it('should reject batch when moisture > 12%', async () => {
      const auditDto = {
        batchId: 'batch-uuid-1',
        testedMoisturePercentage: 14.5,
        isAflatoxinDetected: false,
        inspectorName: 'Dr. Shahabuddin (DGDA Chemist)',
      };

      const audit = await service.recordMoistureAudit('insp-01', auditDto);

      expect(audit.evaluatedGrade).toBe(GACPStandardGrade.RAW_UNSORTED_C);
      expect(audit.complianceVerdictBn).toContain('অতিরিক্ত আর্দ্রতা');
    });

    it('should reject batch immediately if aflatoxin is detected', async () => {
      const auditDto = {
        batchId: 'batch-uuid-1',
        testedMoisturePercentage: 9.0,
        isAflatoxinDetected: true,
        inspectorName: 'Dr. Shahabuddin (DGDA Chemist)',
      };

      const audit = await service.recordMoistureAudit('insp-01', auditDto);

      expect(audit.evaluatedGrade).toBe(GACPStandardGrade.RAW_UNSORTED_C);
      expect(audit.complianceVerdictBn).toContain('ক্ষতিকর ছত্রাক বা অতিরিক্ত ভারী ধাতু শনাক্ত');
    });
  });

  describe('createPharmaContract', () => {
    it('should compute 30% advance escrow and 100% final settlement properly', async () => {
      const contractDto = {
        buyerCompanyName: 'Square Herbal & Nutraceuticals Ltd.',
        buyerContactPerson: 'Dr. M. A. Hasan',
        buyerPhone: '01713009988',
        sellerCooperativeId: 'grower-natore-001',
        cooperativeName: 'Laxmipur Kholabaria Oushodhi Krishi Samity',
        species: HerbalSpecies.KALOMEGH,
        plantPart: PlantPartUsed.LEAF_DRIED,
        processingState: ProcessingState.SHADE_DRIED_WHOLE,
        targetWeightKg: 1000,
        agreedPricePerKgBdt: 300,
        maxAllowedMoisturePercentage: 10.0,
        deliveryDeadline: '2026-11-20',
        destinationWarehouseDistrict: 'Gazipur',
      };

      const contract = await service.createPharmaContract('pharma-square', contractDto);

      expect(contract.finalSettlementAmountBdt).toBe(300000);
      expect(contract.escrowAdvanceAmountBdt).toBe(90000); // 30% of 300,000
      expect(contract.contractStatus).toBe(SourcingContractStatus.CONTRACT_ACTIVE);
      expect(contract.contractNumber).toMatch(/^PHARMA-CNT-2026-\d{3}$/);
      expect(mockContractRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateContractStatus', () => {
    it('should update status and stamp acceptedAt when fulfilled', async () => {
      const updated = await service.updateContractStatus('contract-uuid-1', SourcingContractStatus.FULFILLED_ACCEPTED);

      expect(updated.contractStatus).toBe(SourcingContractStatus.FULFILLED_ACCEPTED);
      expect(updated.acceptedAt).toBeDefined();
    });
  });
});
