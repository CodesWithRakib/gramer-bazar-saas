import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CropInsuranceService } from './crop-insurance.service.js';
import {
  CropType,
  AgriSeason,
  ParametricTriggerType,
  PolicyStatus,
  EnrollmentStatus,
  ClaimDisasterSeverity,
  ClaimPayoutMethod,
} from './enums/insurance.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CropInsuranceService', () => {
  let service: CropInsuranceService;
  let mockPolicyRepo: any;
  let mockEnrollmentRepo: any;
  let mockClaimRepo: any;
  let mockTelemetryRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockPolicyRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'policy-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'policy-uuid-1', ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockEnrollmentRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'enrollment-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'enrollment-uuid-1', ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockClaimRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'claim-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'claim-uuid-1', ...entity })),
      createQueryBuilder: vi.fn(),
    };

    mockTelemetryRepo = {
      create: vi.fn((entity) => ({ id: 'telemetry-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'telemetry-uuid-1', ...entity })),
      find: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    service = new CropInsuranceService(
      mockPolicyRepo,
      mockEnrollmentRepo,
      mockClaimRepo,
      mockTelemetryRepo,
      mockUserRepo,
    );
  });

  describe('createPolicy', () => {
    it('should create policy and compute 50% government subsidy correctly', async () => {
      mockPolicyRepo.findOne.mockResolvedValue(null);

      const policy = await service.createPolicy({
        policyCode: 'POL-BORO-HAOR-2026',
        titleEn: 'Haor Boro Flash Flood Insurance',
        titleBn: 'হাওর বোরো ধান আকস্মিক বন্যা বীমা',
        cropType: CropType.BORO_PADDY,
        season: AgriSeason.RABI,
        targetDistrict: 'Sunamganj',
        sumInsuredPerBigha: 15000,
        premiumPerBigha: 300,
        governmentSubsidyPct: 50.0,
        triggerType: ParametricTriggerType.FLASH_FLOOD,
        triggerThresholdValue: 1.5,
        triggerThresholdUnit: 'danger_mark_meters',
        coverageStartDate: '2026-02-01',
        coverageEndDate: '2026-05-15',
      });

      expect(policy.policyCode).toBe('POL-BORO-HAOR-2026');
      expect(policy.farmerPayablePerBigha).toBe(150); // 300 * (1 - 0.50)
      expect(policy.status).toBe(PolicyStatus.ACTIVE);
    });

    it('should reject policy creation if code already exists', async () => {
      mockPolicyRepo.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.createPolicy({
          policyCode: 'POL-BORO-HAOR-2026',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('enrollFarmer', () => {
    it('should enroll farmer, calculate gross and net premium with subsidy', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'farmer-uuid-1' });
      mockPolicyRepo.findOne.mockResolvedValue({
        id: 'policy-uuid-1',
        policyCode: 'POL-POTATO-2026',
        sumInsuredPerBigha: 20000,
        premiumPerBigha: 400,
        farmerPayablePerBigha: 200,
        status: PolicyStatus.ACTIVE,
      });

      const enrollment = await service.enrollFarmer('farmer-uuid-1', {
        policyId: 'policy-uuid-1',
        farmerName: 'Abdur Rahim',
        farmerPhone: '01711223344',
        plotAddress: 'Field Plot 12, Shibganj',
        plotDistrict: 'Bogura',
        plotUpazila: 'Shibganj',
        landAreaBighas: 2.5,
        payoutMfsNumber: '01711223344',
      });

      expect(enrollment.enrollmentNumber).toMatch(/^INS-\d{4}-[A-Z0-9]{4}$/);
      expect(enrollment.totalSumInsured).toBe(50000); // 20000 * 2.5
      expect(enrollment.grossPremium).toBe(1000); // 400 * 2.5
      expect(enrollment.netPremiumPaid).toBe(500); // 200 * 2.5
      expect(enrollment.subsidyAmount).toBe(500);
      expect(enrollment.status).toBe(EnrollmentStatus.ACTIVE);
    });
  });

  describe('fileManualClaim', () => {
    it('should file manual damage claim and calculate severity payout', async () => {
      mockEnrollmentRepo.findOne.mockResolvedValue({
        id: 'enrollment-uuid-1',
        farmerId: 'farmer-uuid-1',
        farmerName: 'Abdur Rahim',
        totalSumInsured: 50000,
        status: EnrollmentStatus.ACTIVE,
      });

      const claim = await service.fileManualClaim('enrollment-uuid-1', 'farmer-uuid-1', {
        triggerBreachValue: 180,
        disasterSeverity: ClaimDisasterSeverity.PARTIAL_MEDIUM, // 50%
        farmerDamageNotes: 'Severe waterlogging rotted standing potato crop',
      });

      expect(claim.claimNumber).toMatch(/^CLM-\d{4}-[A-Z0-9]{3}$/);
      expect(claim.damagePct).toBe(50);
      expect(claim.payoutAmount).toBe(25000); // 50% of 50,000
      expect(mockEnrollmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: EnrollmentStatus.CLAIM_IN_REVIEW }),
      );
    });
  });

  describe('simulateWeatherTrigger', () => {
    it('should detect river danger breach and auto-disburse parametric compensation', async () => {
      const mockQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([
          {
            id: 'policy-uuid-1',
            triggerThresholdValue: 1.5,
            triggerThresholdUnit: 'danger_mark_meters',
          },
        ]),
      };
      mockPolicyRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      mockEnrollmentRepo.find.mockResolvedValue([
        {
          id: 'enr-1',
          totalSumInsured: 30000,
          status: EnrollmentStatus.ACTIVE,
        },
        {
          id: 'enr-2',
          totalSumInsured: 45000,
          status: EnrollmentStatus.ACTIVE,
        },
      ]);

      const result = await service.simulateWeatherTrigger({
        district: 'Sunamganj',
        upazila: 'Tahirpur',
        stationName: 'Surma River Gauge #4',
        triggerType: ParametricTriggerType.FLASH_FLOOD,
        measuredValue: 1.8, // 1.8m above danger mark (breaches 1.5m threshold!)
        unit: 'danger_mark_meters',
      });

      expect(result.isBreachTriggered).toBe(true);
      expect(result.disbursementsGenerated).toBe(2);
      expect(result.totalCompensationAmount).toBe(75000); // 30,000 + 45,000
    });
  });

  describe('approveDisbursement', () => {
    it('should approve claim and set disbursed timestamp', async () => {
      mockClaimRepo.findOne.mockResolvedValue({
        id: 'claim-uuid-1',
        claimNumber: 'CLM-2026-ABC',
        enrollment: {
          id: 'enrollment-uuid-1',
          totalSumInsured: 40000,
          status: EnrollmentStatus.CLAIM_IN_REVIEW,
        },
      });

      const approved = await service.approveDisbursement('claim-uuid-1', {
        damagePct: 75,
        payoutMethod: ClaimPayoutMethod.BKASH,
        payoutTransactionRef: 'BKASH-DISB-7721',
        adminApprovalNotes: 'Field audit verified 75% crop lodging',
      });

      expect(approved.payoutAmount).toBe(30000); // 75% of 40,000
      expect(approved.payoutTransactionRef).toBe('BKASH-DISB-7721');
      expect(approved.disbursedAt).toBeDefined();
    });
  });
});
