import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CropInsurancePolicy } from './entities/crop-insurance-policy.entity.js';
import { FarmerInsuranceEnrollment } from './entities/farmer-insurance-enrollment.entity.js';
import { ParametricClaimDisbursement } from './entities/parametric-claim-disbursement.entity.js';
import { WeatherTriggerTelemetry } from './entities/weather-trigger-telemetry.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  EnrollmentStatus,
  PolicyStatus,
  ClaimDisasterSeverity,
  ClaimPayoutMethod,
} from './enums/insurance.enum.js';
import {
  ApproveDisbursementDto,
  CreateCropInsurancePolicyDto,
  EnrollCropInsuranceDto,
  FileInsuranceClaimDto,
  QueryPolicyDto,
  SimulateTelemetryTriggerDto,
  UpdateCropInsurancePolicyDto,
} from './dto/insurance.dto.js';

@Injectable()
export class CropInsuranceService {
  private readonly logger = new Logger(CropInsuranceService.name);

  constructor(
    @InjectRepository(CropInsurancePolicy)
    private readonly policyRepo: Repository<CropInsurancePolicy>,
    @InjectRepository(FarmerInsuranceEnrollment)
    private readonly enrollmentRepo: Repository<FarmerInsuranceEnrollment>,
    @InjectRepository(ParametricClaimDisbursement)
    private readonly claimRepo: Repository<ParametricClaimDisbursement>,
    @InjectRepository(WeatherTriggerTelemetry)
    private readonly telemetryRepo: Repository<WeatherTriggerTelemetry>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // --- Policy Administration ---

  async createPolicy(dto: CreateCropInsurancePolicyDto): Promise<CropInsurancePolicy> {
    const existing = await this.policyRepo.findOne({ where: { policyCode: dto.policyCode } });
    if (existing) {
      throw new BadRequestException(`Policy code ${dto.policyCode} already exists`);
    }

    const subsidyPct = dto.governmentSubsidyPct !== undefined ? Number(dto.governmentSubsidyPct) : 50.0;
    const premiumPerBigha = Number(dto.premiumPerBigha);
    const farmerPayablePerBigha = Number((premiumPerBigha * (1 - subsidyPct / 100)).toFixed(2));

    const policy = this.policyRepo.create({
      ...dto,
      sumInsuredPerBigha: Number(dto.sumInsuredPerBigha),
      premiumPerBigha,
      governmentSubsidyPct: subsidyPct,
      farmerPayablePerBigha,
      triggerThresholdValue: Number(dto.triggerThresholdValue),
      coverageStartDate: new Date(dto.coverageStartDate),
      coverageEndDate: new Date(dto.coverageEndDate),
      status: PolicyStatus.ACTIVE,
    });

    const saved = await this.policyRepo.save(policy);
    this.logger.log(`Created Parametric Crop Insurance Policy: ${saved.policyCode} (${saved.cropType})`);
    return saved;
  }

  async updatePolicy(id: string, dto: UpdateCropInsurancePolicyDto): Promise<CropInsurancePolicy> {
    const policy = await this.policyRepo.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    if (dto.premiumPerBigha !== undefined || dto.governmentSubsidyPct !== undefined) {
      const premium = dto.premiumPerBigha !== undefined ? Number(dto.premiumPerBigha) : Number(policy.premiumPerBigha);
      const subsidy =
        dto.governmentSubsidyPct !== undefined
          ? Number(dto.governmentSubsidyPct)
          : Number(policy.governmentSubsidyPct);
      policy.farmerPayablePerBigha = Number((premium * (1 - subsidy / 100)).toFixed(2));
    }

    Object.assign(policy, {
      ...dto,
      sumInsuredPerBigha:
        dto.sumInsuredPerBigha !== undefined ? Number(dto.sumInsuredPerBigha) : policy.sumInsuredPerBigha,
      premiumPerBigha:
        dto.premiumPerBigha !== undefined ? Number(dto.premiumPerBigha) : policy.premiumPerBigha,
      governmentSubsidyPct:
        dto.governmentSubsidyPct !== undefined
          ? Number(dto.governmentSubsidyPct)
          : policy.governmentSubsidyPct,
      triggerThresholdValue:
        dto.triggerThresholdValue !== undefined
          ? Number(dto.triggerThresholdValue)
          : policy.triggerThresholdValue,
    });

    return await this.policyRepo.save(policy);
  }

  async getPolicies(query: QueryPolicyDto): Promise<{ items: CropInsurancePolicy[]; total: number; page: number; limit: number }> {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const qb = this.policyRepo.createQueryBuilder('policy');

    if (query.status) {
      qb.andWhere('policy.status = :status', { status: query.status });
    } else {
      qb.andWhere('policy.status = :status', { status: PolicyStatus.ACTIVE });
    }

    if (query.cropType) {
      qb.andWhere('policy.cropType = :cropType', { cropType: query.cropType });
    }

    if (query.season) {
      qb.andWhere('policy.season = :season', { season: query.season });
    }

    if (query.district) {
      qb.andWhere('LOWER(policy.targetDistrict) = LOWER(:district)', { district: query.district.trim() });
    }

    qb.orderBy('policy.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async getPolicyById(id: string): Promise<CropInsurancePolicy> {
    const policy = await this.policyRepo.findOne({
      where: { id },
      relations: ['enrollments'],
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }
    return policy;
  }

  // --- Farmer Enrollment ---

  async enrollFarmer(farmerId: string, dto: EnrollCropInsuranceDto): Promise<FarmerInsuranceEnrollment> {
    const farmer = await this.userRepo.findOne({ where: { id: farmerId } });
    if (!farmer) {
      throw new NotFoundException('Farmer account not found');
    }

    const policy = await this.getPolicyById(dto.policyId);
    if (policy.status !== PolicyStatus.ACTIVE) {
      throw new BadRequestException('This insurance policy is not active for enrollment');
    }

    const landArea = Number(dto.landAreaBighas);
    if (landArea <= 0) {
      throw new BadRequestException('Insured land area must be greater than 0');
    }

    const totalSumInsured = Number((Number(policy.sumInsuredPerBigha) * landArea).toFixed(2));
    const grossPremium = Number((Number(policy.premiumPerBigha) * landArea).toFixed(2));
    const netPremiumPaid = Number((Number(policy.farmerPayablePerBigha) * landArea).toFixed(2));
    const subsidyAmount = Number((grossPremium - netPremiumPaid).toFixed(2));

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const enrollmentNumber = `INS-${new Date().getFullYear()}-${randomSuffix}`;

    const enrollment = this.enrollmentRepo.create({
      enrollmentNumber,
      policyId: policy.id,
      farmerId,
      farmerName: dto.farmerName,
      farmerPhone: dto.farmerPhone,
      farmerNid: dto.farmerNid || null,
      plotAddress: dto.plotAddress,
      plotDistrict: dto.plotDistrict,
      plotUpazila: dto.plotUpazila,
      plotUnion: dto.plotUnion || null,
      plotVillage: dto.plotVillage || null,
      plotDagNo: dto.plotDagNo || null,
      plotGpsLat: dto.plotGpsLat !== undefined ? Number(dto.plotGpsLat) : null,
      plotGpsLng: dto.plotGpsLng !== undefined ? Number(dto.plotGpsLng) : null,
      landAreaBighas: landArea,
      totalSumInsured,
      grossPremium,
      subsidyAmount,
      netPremiumPaid,
      payoutMfsNumber: dto.payoutMfsNumber,
      status: EnrollmentStatus.ACTIVE,
    });

    const saved = await this.enrollmentRepo.save(enrollment);
    this.logger.log(`Farmer ${dto.farmerName} enrolled in ${policy.policyCode} (Coverage: ৳${totalSumInsured})`);
    return saved;
  }

  async getMyEnrollments(farmerId: string): Promise<FarmerInsuranceEnrollment[]> {
    return await this.enrollmentRepo.find({
      where: { farmerId },
      relations: ['policy', 'claims'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEnrollmentById(id: string, userId?: string, isAdmin = false): Promise<FarmerInsuranceEnrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id },
      relations: ['policy', 'farmer', 'claims'],
    });

    if (!enrollment) {
      throw new NotFoundException('Insurance enrollment certificate not found');
    }

    if (userId && !isAdmin && enrollment.farmerId !== userId) {
      throw new ForbiddenException('Unauthorized access to policy enrollment');
    }

    return enrollment;
  }

  // --- Manual Claim Submission with Geo-Tagged Evidence ---

  async fileManualClaim(
    enrollmentId: string,
    farmerId: string,
    dto: FileInsuranceClaimDto,
  ): Promise<ParametricClaimDisbursement> {
    const enrollment = await this.getEnrollmentById(enrollmentId, farmerId);

    if (enrollment.status === EnrollmentStatus.CLAIM_PAID || enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException(`Cannot file claim on policy in status: ${enrollment.status}`);
    }

    let damagePct = 100;
    switch (dto.disasterSeverity) {
      case ClaimDisasterSeverity.PARTIAL_LOW:
        damagePct = 25;
        break;
      case ClaimDisasterSeverity.PARTIAL_MEDIUM:
        damagePct = 50;
        break;
      case ClaimDisasterSeverity.SEVERE_HIGH:
        damagePct = 75;
        break;
      case ClaimDisasterSeverity.TOTAL_LOSS:
      default:
        damagePct = 100;
        break;
    }

    const payoutAmount = Number(((Number(enrollment.totalSumInsured) * damagePct) / 100).toFixed(2));
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const claimNumber = `CLM-${new Date().getFullYear()}-${randomSuffix}`;

    const claim = this.claimRepo.create({
      claimNumber,
      enrollmentId: enrollment.id,
      triggerBreachValue: Number(dto.triggerBreachValue),
      triggerBreachDate: dto.triggerBreachDate ? new Date(dto.triggerBreachDate) : new Date(),
      disasterSeverity: dto.disasterSeverity,
      damagePct,
      payoutAmount,
      payoutMethod: dto.payoutMethod || ClaimPayoutMethod.BKASH,
      payoutTransactionRef: null,
      isAutomatedTrigger: false,
      farmerDamageNotes: dto.farmerDamageNotes || null,
      damagePhotos: dto.damagePhotos || [],
      adminApprovalNotes: null,
      disbursedAt: null,
    });

    const savedClaim = await this.claimRepo.save(claim);

    enrollment.status = EnrollmentStatus.CLAIM_IN_REVIEW;
    await this.enrollmentRepo.save(enrollment);

    this.logger.log(`Manual Disaster Claim filed: ${savedClaim.claimNumber} (৳${payoutAmount}) for ${enrollment.farmerName}`);
    return savedClaim;
  }

  // --- Automated Parametric Trigger Breach Engine ---

  async simulateWeatherTrigger(dto: SimulateTelemetryTriggerDto): Promise<{
    telemetry: WeatherTriggerTelemetry;
    isBreachTriggered: boolean;
    affectedPoliciesCount: number;
    disbursementsGenerated: number;
    totalCompensationAmount: number;
  }> {
    const measuredValue = Number(dto.measuredValue);

    // Save Telemetry reading
    const telemetry = this.telemetryRepo.create({
      district: dto.district,
      upazila: dto.upazila,
      stationName: dto.stationName,
      triggerType: dto.triggerType,
      measuredValue,
      unit: dto.unit,
      isBreach: false,
    });

    // Find active policies in this district with matching trigger type
    const matchingPolicies = await this.policyRepo
      .createQueryBuilder('p')
      .where('LOWER(p.targetDistrict) = LOWER(:district)', { district: dto.district.trim() })
      .andWhere('p.triggerType = :triggerType', { triggerType: dto.triggerType })
      .andWhere('p.status = :status', { status: PolicyStatus.ACTIVE })
      .getMany();

    let isBreachTriggered = false;
    let disbursementsGenerated = 0;
    let totalCompensationAmount = 0;

    for (const policy of matchingPolicies) {
      if (measuredValue >= Number(policy.triggerThresholdValue)) {
        isBreachTriggered = true;

        // Fetch all active enrollments for this policy in the district
        const enrollments = await this.enrollmentRepo.find({
          where: {
            policyId: policy.id,
            status: EnrollmentStatus.ACTIVE,
          },
        });

        for (const enrollment of enrollments) {
          const payoutAmount = Number(enrollment.totalSumInsured);
          const claimNumber = `CLM-AUTO-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const payoutTrx = `MFS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          const autoClaim = this.claimRepo.create({
            claimNumber,
            enrollmentId: enrollment.id,
            triggerBreachValue: measuredValue,
            triggerBreachDate: new Date(),
            disasterSeverity: ClaimDisasterSeverity.TOTAL_LOSS,
            damagePct: 100,
            payoutAmount,
            payoutMethod: ClaimPayoutMethod.BKASH,
            payoutTransactionRef: payoutTrx,
            isAutomatedTrigger: true,
            farmerDamageNotes: `Automated station breach: ${dto.stationName} recorded ${measuredValue} ${dto.unit} (Threshold: ${policy.triggerThresholdValue} ${policy.triggerThresholdUnit})`,
            damagePhotos: [],
            adminApprovalNotes: 'Automated Parametric Smart Payout Executed',
            disbursedAt: new Date(),
          });

          await this.claimRepo.save(autoClaim);

          enrollment.status = EnrollmentStatus.CLAIM_PAID;
          await this.enrollmentRepo.save(enrollment);

          disbursementsGenerated++;
          totalCompensationAmount += payoutAmount;
        }
      }
    }

    telemetry.isBreach = isBreachTriggered;
    const savedTelemetry = await this.telemetryRepo.save(telemetry);

    this.logger.log(
      `Weather Telemetry recorded for ${dto.district}: breach=${isBreachTriggered}, payouts=${disbursementsGenerated}, total=৳${totalCompensationAmount}`,
    );

    return {
      telemetry: savedTelemetry,
      isBreachTriggered,
      affectedPoliciesCount: matchingPolicies.length,
      disbursementsGenerated,
      totalCompensationAmount,
    };
  }

  // --- Admin Claim Review & Disbursement ---

  async approveDisbursement(
    claimId: string,
    dto: ApproveDisbursementDto,
  ): Promise<ParametricClaimDisbursement> {
    const claim = await this.claimRepo.findOne({
      where: { id: claimId },
      relations: ['enrollment'],
    });

    if (!claim) {
      throw new NotFoundException('Claim record not found');
    }

    const damagePct = Number(dto.damagePct);
    const payoutAmount = Number(((Number(claim.enrollment.totalSumInsured) * damagePct) / 100).toFixed(2));

    claim.damagePct = damagePct;
    claim.payoutAmount = payoutAmount;
    claim.payoutMethod = dto.payoutMethod;
    claim.payoutTransactionRef = dto.payoutTransactionRef;
    claim.adminApprovalNotes = dto.adminApprovalNotes || 'Approved by Agricultural Insurance Board';
    claim.disbursedAt = new Date();

    const saved = await this.claimRepo.save(claim);

    claim.enrollment.status = EnrollmentStatus.CLAIM_PAID;
    await this.enrollmentRepo.save(claim.enrollment);

    this.logger.log(`Claim ${claim.claimNumber} approved and disbursed (৳${payoutAmount}) via ${dto.payoutMethod}`);
    return saved;
  }

  async getAllEnrollments(query?: { district?: string }): Promise<FarmerInsuranceEnrollment[]> {
    const qb = this.enrollmentRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.policy', 'policy')
      .leftJoinAndSelect('e.farmer', 'farmer')
      .leftJoinAndSelect('e.claims', 'claims');

    if (query?.district) {
      qb.where('LOWER(e.plotDistrict) = LOWER(:district)', { district: query.district.trim() });
    }

    qb.orderBy('e.createdAt', 'DESC');
    return await qb.getMany();
  }

  async getAllClaims(): Promise<ParametricClaimDisbursement[]> {
    return await this.claimRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.policy', 'policy')
      .leftJoinAndSelect('enrollment.farmer', 'farmer')
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  async getRecentTelemetry(limit = 20): Promise<WeatherTriggerTelemetry[]> {
    return await this.telemetryRepo.find({
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }
}
