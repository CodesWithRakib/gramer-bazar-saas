import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContractFarmingService } from './contract-farming.service.js';
import {
  AgreementStatus,
  CampaignStatus,
  ContractCropType,
  DeliveryGrade,
  MilestoneStage,
} from './enums/contract-farming.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ContractFarmingService', () => {
  let service: ContractFarmingService;
  let mockCampaignRepo: any;
  let mockAgreementRepo: any;
  let mockInspectionRepo: any;
  let mockDeliveryRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockCampaignRepo = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
      create: vi.fn((entity) => ({ id: 'campaign-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'campaign-uuid-1', ...entity })),
      count: vi.fn().mockResolvedValue(4),
    };

    mockAgreementRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'agreement-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'agreement-uuid-1', ...entity })),
      count: vi.fn().mockResolvedValue(12),
      createQueryBuilder: vi.fn(() => ({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({
          totalBighas: 60,
          totalAdvance: 150000,
          totalDelivered: 45000,
          totalSettled: 550000,
        }),
      })),
    };

    mockInspectionRepo = {
      create: vi.fn((entity) => ({ id: 'inspection-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'inspection-uuid-1', ...entity })),
      find: vi.fn(),
    };

    mockDeliveryRepo = {
      create: vi.fn((entity) => ({ id: 'delivery-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'delivery-uuid-1', ...entity })),
      find: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    service = new ContractFarmingService(
      mockCampaignRepo,
      mockAgreementRepo,
      mockInspectionRepo,
      mockDeliveryRepo,
      mockUserRepo,
    );
  });

  describe('createCampaign', () => {
    it('should create campaign successfully with floor price and advance percentage', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'buyer-uuid-1', name: 'PRAN Agro' });

      const campaign = await service.createCampaign('buyer-uuid-1', {
        buyerCompanyName: 'PRAN Agro Ltd.',
        titleEn: 'Potato Buyback 2026',
        titleBn: 'আলু ক্রয় চুক্তি',
        descriptionEn: 'Processing potato buyback',
        descriptionBn: 'চিপস আলু ক্রয়',
        cropType: ContractCropType.POTATO_PROCESSING,
        targetSeason: 'Rabi 2026',
        targetDistrict: 'Bogura',
        targetTotalAcres: 500,
        guaranteedFloorPricePerKg: 28.5,
        advanceInputCashPct: 25.0,
        estimatedYieldPerBighaKg: 3200,
        qualityStandardSpecs: 'Diameter > 45mm',
        intakeDropWarehouseName: 'Bogura Hub',
      });

      expect(campaign.buyerCompanyName).toBe('PRAN Agro Ltd.');
      expect(campaign.guaranteedFloorPricePerKg).toBe(28.5);
      expect(campaign.advanceInputCashPct).toBe(25.0);
      expect(campaign.status).toBe(CampaignStatus.ENROLLING);
    });

    it('should throw NotFoundException if buyer does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createCampaign('invalid-user', {
          buyerCompanyName: 'Test Corp',
          titleEn: 'Test',
          titleBn: 'টেস্ট',
          descriptionEn: 'desc',
          descriptionBn: 'desc',
          cropType: ContractCropType.OTHER,
          targetSeason: '2026',
          targetDistrict: 'Dhaka',
          targetTotalAcres: 100,
          guaranteedFloorPricePerKg: 30,
          estimatedYieldPerBighaKg: 1000,
          qualityStandardSpecs: 'Standard',
          intakeDropWarehouseName: 'Hub 1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyForAgreement', () => {
    it('should compute committed production and agreement value accurately', async () => {
      mockCampaignRepo.findOne.mockResolvedValue({
        id: 'campaign-uuid-1',
        status: CampaignStatus.ENROLLING,
        estimatedYieldPerBighaKg: 3000,
        guaranteedFloorPricePerKg: 25.0,
        currentEnrolledAcres: 10.0,
      });

      const agreement = await service.applyForAgreement('farmer-uuid-1', {
        campaignId: 'campaign-uuid-1',
        farmerName: 'Md. Abdul Karim',
        farmerPhone: '01711223344',
        plotAddress: 'Village: Pirgacha, Bogura',
        plotDistrict: 'Bogura',
        plotUpazila: 'Pirgacha',
        landAreaBighas: 3.0,
        farmerPayoutMfsOrBank: 'bKash 01711223344',
      });

      expect(agreement.landAreaBighas).toBe(3.0);
      expect(agreement.committedEstProductionKg).toBe(9000); // 3 * 3000
      expect(agreement.floorPricePerKg).toBe(25.0);
      expect(agreement.totalEstAgreementValue).toBe(225000); // 9000 * 25
      expect(agreement.status).toBe(AgreementStatus.APPLIED);
    });
  });

  describe('updateAgreementStatus & Advance Working Capital', () => {
    it('should disburse 25% advance working capital upon ACTIVE_PLANTED status', async () => {
      mockAgreementRepo.findOne.mockResolvedValue({
        id: 'agreement-uuid-1',
        totalEstAgreementValue: 200000,
        advanceWorkingCapitalDisbursed: 0,
        status: AgreementStatus.APPROVED,
        campaign: {
          advanceInputCashPct: 25.0,
        },
      });

      const updated = await service.updateAgreementStatus('agreement-uuid-1', {
        status: AgreementStatus.ACTIVE_PLANTED,
      });

      expect(updated.status).toBe(AgreementStatus.ACTIVE_PLANTED);
      expect(updated.advanceWorkingCapitalDisbursed).toBe(50000); // 25% of 200,000
    });
  });

  describe('recordHarvestDelivery', () => {
    it('should calculate net weight and apply 10% bonus for Grade A produce', async () => {
      mockAgreementRepo.findOne.mockResolvedValue({
        id: 'agreement-uuid-1',
        floorPricePerKg: 30.0,
        deliveredTotalKg: 0,
        finalSettledValue: 0,
        advanceWorkingCapitalDisbursed: 15000,
        balancePayable: 0,
      });

      const delivery = await service.recordHarvestDelivery('agreement-uuid-1', {
        grossWeightKg: 5000,
        tareWeightKg: 2000,
        acceptedGrade: DeliveryGrade.GRADE_A, // 30 * 1.10 = 33.0 BDT/kg
        weighbridgeOperatorName: 'Station Chief Tariq',
      });

      expect(delivery.netWeightKg).toBe(3000);
      expect(delivery.finalPricePerKg).toBe(33.0);
      expect(delivery.payableBatchAmount).toBe(99000); // 3000 * 33.0
    });

    it('should reject delivery if gross weight is less than or equal to tare weight', async () => {
      mockAgreementRepo.findOne.mockResolvedValue({
        id: 'agreement-uuid-1',
        floorPricePerKg: 30.0,
      });

      await expect(
        service.recordHarvestDelivery('agreement-uuid-1', {
          grossWeightKg: 2000,
          tareWeightKg: 2500, // Invalid: gross < tare
          acceptedGrade: DeliveryGrade.GRADE_B,
          weighbridgeOperatorName: 'Tariq',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('settleAgreementFinalEscrow', () => {
    it('should calculate remaining balance deducting advance payment and mark settled', async () => {
      mockAgreementRepo.findOne.mockResolvedValue({
        id: 'agreement-uuid-1',
        finalSettledValue: 120000,
        advanceWorkingCapitalDisbursed: 30000,
        balancePayable: 0,
        status: AgreementStatus.DELIVERING,
        deliveries: [{ id: 'delivery-1' }],
      });

      const settled = await service.settleAgreementFinalEscrow('agreement-uuid-1', {});

      expect(settled.status).toBe(AgreementStatus.SETTLED);
      expect(settled.balancePayable).toBe(90000); // 120000 - 30000
    });
  });
});
