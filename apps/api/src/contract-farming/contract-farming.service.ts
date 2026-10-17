import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';
import { ContractFarmingCampaign } from './entities/contract-farming-campaign.entity.js';
import { ContractFarmingAgreement } from './entities/contract-farming-agreement.entity.js';
import { ContractMilestoneInspection } from './entities/contract-milestone-inspection.entity.js';
import { ContractHarvestDelivery } from './entities/contract-harvest-delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  AgreementStatus,
  CampaignStatus,
  ContractCropType,
  DeliveryGrade,
  MilestoneStage,
} from './enums/contract-farming.enum.js';
import {
  ApplyContractAgreementDto,
  CreateContractCampaignDto,
  QueryContractCampaignDto,
  RecordHarvestDeliveryDto,
  SettleAgreementFinalEscrowDto,
  SubmitMilestoneInspectionDto,
  UpdateAgreementStatusDto,
  UpdateContractCampaignDto,
} from './dto/contract-farming.dto.js';

@Injectable()
export class ContractFarmingService {
  constructor(
    @InjectRepository(ContractFarmingCampaign)
    private readonly campaignRepo: Repository<ContractFarmingCampaign>,
    @InjectRepository(ContractFarmingAgreement)
    private readonly agreementRepo: Repository<ContractFarmingAgreement>,
    @InjectRepository(ContractMilestoneInspection)
    private readonly inspectionRepo: Repository<ContractMilestoneInspection>,
    @InjectRepository(ContractHarvestDelivery)
    private readonly deliveryRepo: Repository<ContractHarvestDelivery>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // --- Campaign Management ---

  async createCampaign(buyerId: string, dto: CreateContractCampaignDto): Promise<ContractFarmingCampaign> {
    const buyer = await this.userRepo.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException('Corporate buyer account not found');
    }

    const campaignCode = dto.campaignCode || `CFC-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const campaign = this.campaignRepo.create({
      ...dto,
      buyerId,
      campaignCode,
      targetTotalAcres: Number(dto.targetTotalAcres),
      currentEnrolledAcres: 0,
      guaranteedFloorPricePerKg: Number(dto.guaranteedFloorPricePerKg),
      advanceInputCashPct: dto.advanceInputCashPct !== undefined ? Number(dto.advanceInputCashPct) : 25.0,
      estimatedYieldPerBighaKg: Number(dto.estimatedYieldPerBighaKg),
      status: CampaignStatus.ENROLLING,
    });

    return await this.campaignRepo.save(campaign);
  }

  async updateCampaign(
    buyerId: string,
    campaignId: string,
    dto: UpdateContractCampaignDto,
    isAdmin = false,
  ): Promise<ContractFarmingCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (!isAdmin && campaign.buyerId !== buyerId) {
      throw new ForbiddenException('You can only modify your own contract campaigns');
    }

    Object.assign(campaign, {
      ...dto,
      targetTotalAcres: dto.targetTotalAcres !== undefined ? Number(dto.targetTotalAcres) : campaign.targetTotalAcres,
      guaranteedFloorPricePerKg:
        dto.guaranteedFloorPricePerKg !== undefined
          ? Number(dto.guaranteedFloorPricePerKg)
          : campaign.guaranteedFloorPricePerKg,
      advanceInputCashPct:
        dto.advanceInputCashPct !== undefined ? Number(dto.advanceInputCashPct) : campaign.advanceInputCashPct,
      estimatedYieldPerBighaKg:
        dto.estimatedYieldPerBighaKg !== undefined
          ? Number(dto.estimatedYieldPerBighaKg)
          : campaign.estimatedYieldPerBighaKg,
    });

    return await this.campaignRepo.save(campaign);
  }

  async findAllCampaigns(query: QueryContractCampaignDto): Promise<{
    items: ContractFarmingCampaign[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<ContractFarmingCampaign> = {};

    if (query.cropType) {
      where.cropType = query.cropType;
    }
    if (query.targetDistrict && query.targetDistrict !== 'ALL') {
      where.targetDistrict = query.targetDistrict;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await this.campaignRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['buyer'],
    });

    // If database is empty, seed initial representative campaigns
    if (total === 0 && !query.cropType && !query.targetDistrict) {
      const seeded = await this.seedDefaultCampaigns();
      return {
        items: seeded,
        total: seeded.length,
        page: 1,
        limit,
      };
    }

    return { items, total, page, limit };
  }

  async findCampaignById(id: string): Promise<ContractFarmingCampaign> {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['buyer', 'agreements', 'agreements.farmer'],
    });

    if (!campaign) {
      throw new NotFoundException('Contract farming campaign not found');
    }

    return campaign;
  }

  // --- Agreement Operations (Farmer Application & Forward Purchase) ---

  async applyForAgreement(farmerId: string, dto: ApplyContractAgreementDto): Promise<ContractFarmingAgreement> {
    const campaign = await this.campaignRepo.findOne({ where: { id: dto.campaignId } });
    if (!campaign) {
      throw new NotFoundException('Contract campaign not found');
    }

    if (campaign.status !== CampaignStatus.ENROLLING) {
      throw new BadRequestException('This campaign is currently not accepting new farmer agreements');
    }

    const landArea = Number(dto.landAreaBighas);
    const estimatedProduction = landArea * Number(campaign.estimatedYieldPerBighaKg);
    const floorPrice = Number(campaign.guaranteedFloorPricePerKg);
    const totalEstValue = estimatedProduction * floorPrice;

    const agreementNumber = `AGR-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const agreement = this.agreementRepo.create({
      ...dto,
      farmerId,
      agreementNumber,
      landAreaBighas: landArea,
      committedEstProductionKg: estimatedProduction,
      floorPricePerKg: floorPrice,
      totalEstAgreementValue: totalEstValue,
      advanceWorkingCapitalDisbursed: 0,
      deliveredTotalKg: 0,
      finalSettledValue: 0,
      balancePayable: 0,
      status: AgreementStatus.APPLIED,
    });

    const saved = await this.agreementRepo.save(agreement);

    // Increment enrolled acres (1 acre ≈ 3 bighas in BD)
    campaign.currentEnrolledAcres = Number(campaign.currentEnrolledAcres) + Number((landArea / 3).toFixed(2));
    await this.campaignRepo.save(campaign);

    return saved;
  }

  async getFarmerAgreements(farmerId: string): Promise<ContractFarmingAgreement[]> {
    return await this.agreementRepo.find({
      where: { farmerId },
      relations: ['campaign', 'inspections', 'deliveries'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBuyerAgreements(buyerId: string): Promise<ContractFarmingAgreement[]> {
    return await this.agreementRepo
      .createQueryBuilder('agr')
      .leftJoinAndSelect('agr.campaign', 'campaign')
      .leftJoinAndSelect('agr.farmer', 'farmer')
      .leftJoinAndSelect('agr.inspections', 'inspections')
      .leftJoinAndSelect('agr.deliveries', 'deliveries')
      .where('campaign.buyerId = :buyerId', { buyerId })
      .orderBy('agr.createdAt', 'DESC')
      .getMany();
  }

  async getAllAgreements(): Promise<ContractFarmingAgreement[]> {
    return await this.agreementRepo.find({
      relations: ['campaign', 'farmer', 'inspections', 'deliveries'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getAgreementById(id: string): Promise<ContractFarmingAgreement> {
    const agreement = await this.agreementRepo.findOne({
      where: { id },
      relations: ['campaign', 'farmer', 'inspections', 'inspections.inspector', 'deliveries'],
    });

    if (!agreement) {
      throw new NotFoundException('Contract farming agreement not found');
    }

    return agreement;
  }

  async updateAgreementStatus(
    id: string,
    dto: UpdateAgreementStatusDto,
    _actorId?: string,
    _isAdmin = false,
  ): Promise<ContractFarmingAgreement> {
    const agreement = await this.agreementRepo.findOne({
      where: { id },
      relations: ['campaign'],
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    agreement.status = dto.status;

    // When agreement advances to ACTIVE_PLANTED, calculate and disburse advance working capital
    if (dto.status === AgreementStatus.ACTIVE_PLANTED) {
      const advancePct = Number(agreement.campaign?.advanceInputCashPct || 25);
      const calculatedAdvance = (Number(agreement.totalEstAgreementValue) * advancePct) / 100;
      agreement.advanceWorkingCapitalDisbursed =
        dto.advanceWorkingCapitalDisbursed !== undefined
          ? Number(dto.advanceWorkingCapitalDisbursed)
          : calculatedAdvance;
    }

    return await this.agreementRepo.save(agreement);
  }

  // --- Pre-Harvest Milestone Inspections ---

  async submitMilestoneInspection(
    agreementId: string,
    inspectorId: string,
    dto: SubmitMilestoneInspectionDto,
  ): Promise<ContractMilestoneInspection> {
    const agreement = await this.agreementRepo.findOne({ where: { id: agreementId } });
    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    const inspection = this.inspectionRepo.create({
      ...dto,
      agreementId,
      inspectorId,
      cropHealthScore: Number(dto.cropHealthScore),
      germinationRatePct: dto.germinationRatePct !== undefined ? Number(dto.germinationRatePct) : null,
      pestInfestationLevel: dto.pestInfestationLevel || 'NONE',
      inspectionPhotos: dto.inspectionPhotos || [],
    });

    const saved = await this.inspectionRepo.save(inspection);

    // If maturity inspection passed, update agreement status
    if (dto.milestoneStage === MilestoneStage.PRE_HARVEST_MATURITY && dto.isPassed) {
      agreement.status = AgreementStatus.MILESTONES_VERIFIED;
      await this.agreementRepo.save(agreement);
    }

    return saved;
  }

  // --- Weighbridge Harvest Deliveries & Automated Grading ---

  async recordHarvestDelivery(
    agreementId: string,
    dto: RecordHarvestDeliveryDto,
  ): Promise<ContractHarvestDelivery> {
    const agreement = await this.agreementRepo.findOne({
      where: { id: agreementId },
      relations: ['campaign'],
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    const gross = Number(dto.grossWeightKg);
    const tare = Number(dto.tareWeightKg);
    if (gross <= tare) {
      throw new BadRequestException('Gross weight must be strictly greater than tare weight');
    }

    const netWeight = Number((gross - tare).toFixed(2));
    const baseFloorPrice = Number(agreement.floorPricePerKg);

    // Quality grading calculation
    let gradeMultiplier = 1.0;
    if (dto.acceptedGrade === DeliveryGrade.GRADE_A) {
      gradeMultiplier = 1.1; // +10% premium bonus
    } else if (dto.acceptedGrade === DeliveryGrade.GRADE_B) {
      gradeMultiplier = 1.0; // standard 100%
    } else if (dto.acceptedGrade === DeliveryGrade.GRADE_C) {
      gradeMultiplier = 0.85; // -15% standard discount
    } else if (dto.acceptedGrade === DeliveryGrade.REJECTED) {
      gradeMultiplier = 0;
    }

    const finalPrice = Number((baseFloorPrice * gradeMultiplier).toFixed(2));
    const payableBatch = Number((netWeight * finalPrice).toFixed(2));

    const deliveryVoucherNo =
      dto.deliveryVoucherNo || `VCH-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const delivery = this.deliveryRepo.create({
      ...dto,
      agreementId,
      deliveryVoucherNo,
      grossWeightKg: gross,
      tareWeightKg: tare,
      netWeightKg: netWeight,
      qualityMoisturePct: dto.qualityMoisturePct !== undefined ? Number(dto.qualityMoisturePct) : null,
      finalPricePerKg: finalPrice,
      payableBatchAmount: payableBatch,
      isDisbursed: true,
    });

    const savedDelivery = await this.deliveryRepo.save(delivery);

    // Update agreement cumulative figures
    agreement.deliveredTotalKg = Number(agreement.deliveredTotalKg) + netWeight;
    agreement.finalSettledValue = Number(agreement.finalSettledValue) + payableBatch;
    agreement.balancePayable = Math.max(
      0,
      Number(agreement.finalSettledValue) - Number(agreement.advanceWorkingCapitalDisbursed),
    );
    agreement.status = AgreementStatus.DELIVERING;

    await this.agreementRepo.save(agreement);

    return savedDelivery;
  }

  // --- Final Escrow Settlement ---

  async settleAgreementFinalEscrow(
    agreementId: string,
    _dto: SettleAgreementFinalEscrowDto,
  ): Promise<ContractFarmingAgreement> {
    const agreement = await this.agreementRepo.findOne({
      where: { id: agreementId },
      relations: ['deliveries'],
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (!agreement.deliveries || agreement.deliveries.length === 0) {
      throw new BadRequestException('Cannot settle agreement without any recorded harvest deliveries');
    }

    agreement.balancePayable = Math.max(
      0,
      Number(agreement.finalSettledValue) - Number(agreement.advanceWorkingCapitalDisbursed),
    );
    agreement.status = AgreementStatus.SETTLED;

    return await this.agreementRepo.save(agreement);
  }

  // --- Platform Analytics & Overview ---

  async getPlatformStats(): Promise<{
    totalCampaigns: number;
    totalAgreements: number;
    totalEnrolledAcres: number;
    totalAdvanceDisbursed: number;
    totalDeliveredKg: number;
    totalSettledValue: number;
  }> {
    const totalCampaigns = await this.campaignRepo.count();
    const totalAgreements = await this.agreementRepo.count();

    const statsRaw = await this.agreementRepo
      .createQueryBuilder('a')
      .select('SUM(a.landAreaBighas)', 'totalBighas')
      .addSelect('SUM(a.advanceWorkingCapitalDisbursed)', 'totalAdvance')
      .addSelect('SUM(a.deliveredTotalKg)', 'totalDelivered')
      .addSelect('SUM(a.finalSettledValue)', 'totalSettled')
      .getRawOne();

    const totalBighas = Number(statsRaw?.totalBighas || 0);
    const totalEnrolledAcres = Number((totalBighas / 3).toFixed(2));
    const totalAdvanceDisbursed = Number(Number(statsRaw?.totalAdvance || 0).toFixed(2));
    const totalDeliveredKg = Number(Number(statsRaw?.totalDelivered || 0).toFixed(2));
    const totalSettledValue = Number(Number(statsRaw?.totalSettled || 0).toFixed(2));

    return {
      totalCampaigns,
      totalAgreements,
      totalEnrolledAcres,
      totalAdvanceDisbursed,
      totalDeliveredKg,
      totalSettledValue,
    };
  }

  // --- Initial Seed Provider for Instant Out-of-the-Box Experience ---

  private async seedDefaultCampaigns(): Promise<ContractFarmingCampaign[]> {
    // Find or create a default buyer user for seeds
    let buyer = await this.userRepo.findOne({ where: { email: 'pran.agro@gramerbazar.com' } });
    if (!buyer) {
      const existingUser = await this.userRepo.findOne({ where: {} });
      if (existingUser) {
        buyer = existingUser;
      }
    }

    if (!buyer) {
      return [];
    }

    const seeds: Partial<ContractFarmingCampaign>[] = [
      {
        campaignCode: 'CFC-2026-PRAN01',
        buyerId: buyer.id,
        buyerCompanyName: 'PRAN Agro Business Ltd.',
        titleEn: 'Export-Grade Lady Rosetta Potato Buyback Campaign 2026',
        titleBn: 'রপ্তানি মান লেডি রোসেটা চিপস আলু সরাসরি ক্রয় চুক্তি ২০২৬',
        descriptionEn:
          'Guaranteed buyback contract for processing-grade Lady Rosetta potatoes with 25% upfront input advance disbursement, dedicated field agronomy assistance, and direct delivery to Bogura aggregation hub.',
        descriptionBn:
          'লেডি রোসেটা চিপস আলুর নিশ্চিত ক্রয় চুক্তি। বীজ বপনের সাথে সাথে ২৫% ইনপুট মূলধন অগ্রিম প্রদান, মাঠ পরিদর্শন এবং বগুড়া ওয়্যারহাউসে সরাসরি ওজন পরিমাপের পর তাৎক্ষণিক বকেয়া নিষ্পত্তি।',
        cropType: ContractCropType.POTATO_PROCESSING,
        targetSeason: 'Rabi 2026',
        targetDistrict: 'Bogura',
        targetUpazila: 'Shibganj',
        targetTotalAcres: 500,
        currentEnrolledAcres: 142.5,
        guaranteedFloorPricePerKg: 28.5,
        advanceInputCashPct: 25.0,
        estimatedYieldPerBighaKg: 3200,
        qualityStandardSpecs: 'Diameter: 45mm-75mm, dry matter content > 21%, moisture < 18%, free from scab.',
        intakeDropWarehouseName: 'PRAN Central Weighbridge Station, Bogura Bypass Road',
        status: CampaignStatus.ENROLLING,
      },
      {
        campaignCode: 'CFC-2026-SQUARE02',
        buyerId: buyer.id,
        buyerCompanyName: 'Square Food & Beverage Ltd. (Radhuni)',
        titleEn: 'Aromatic Chinigura Paddy Forward Purchase Contract',
        titleBn: 'সুগন্ধি চিনিগুঁড়া ধান অগ্রিম মূল্য নিশ্চয়তা চুক্তি ২০২৬',
        descriptionEn:
          'Long-term forward purchase agreement for export aromatic Chinigura rice in Dinajpur. Guaranteed minimum price floor of ৳85/kg regardless of market crash.',
        descriptionBn:
          'দিনাজপুরের সুগন্ধি চিনিগুঁড়া ধানের জন্য স্কয়ার ফুড অ্যান্ড বেভারেজের দীর্ঘমেয়াদী চুক্তি। বাজার দর কমলেও সর্বনিম্ন ৮৫ টাকা কেজি দর নিশ্চিত।',
        cropType: ContractCropType.CHINIGURA_AROMATIC_RICE,
        targetSeason: 'Aman 2026',
        targetDistrict: 'Dinajpur',
        targetUpazila: 'Kaharole',
        targetTotalAcres: 350,
        currentEnrolledAcres: 88.0,
        guaranteedFloorPricePerKg: 85.0,
        advanceInputCashPct: 30.0,
        estimatedYieldPerBighaKg: 850,
        qualityStandardSpecs: 'Aroma: Grade A authentic, moisture content <= 14%, broken grain < 2%.',
        intakeDropWarehouseName: 'Square Agro Intake Complex, Dinajpur',
        status: CampaignStatus.ENROLLING,
      },
      {
        campaignCode: 'CFC-2026-SHWAPNO03',
        buyerId: buyer.id,
        buyerCompanyName: 'Shwapno Supermarket Agri-Sourcing',
        titleEn: 'Residue-Free Roma Tomato Contract Farming for Retail Network',
        titleBn: 'কীটনাশকমুক্ত রোমা টমেটো কন্ট্রাক্ট ফার্মিং (স্বপ্ন সুপারশপ)',
        descriptionEn:
          'Controlled-farming agreement for pesticide-residue-free Roma and Cherry tomatoes for high-end retail distribution in Dhaka and Chattogram outlets.',
        descriptionBn:
          'স্বপ্ন সুপারশপের আউটলেটে সরবরাহের জন্য নিরাপদ ও কীটনাশকমুক্ত রোমা টমেটো উৎপাদন চুক্তি। ফুল আসার পর থেকে নিয়মিত অডিট এবং প্রিমিয়াম গ্রেড বোনাস।',
        cropType: ContractCropType.TOMATO_PROCESSING,
        targetSeason: 'Winter 2026',
        targetDistrict: 'Jashore',
        targetUpazila: 'Jhikargacha',
        targetTotalAcres: 200,
        currentEnrolledAcres: 45.0,
        guaranteedFloorPricePerKg: 35.0,
        advanceInputCashPct: 20.0,
        estimatedYieldPerBighaKg: 2400,
        qualityStandardSpecs: 'Firmness: high, uniform red color, GAP certified or zero chemical residue.',
        intakeDropWarehouseName: 'Shwapno Direct Farmer Collection Center, Jashore',
        status: CampaignStatus.ENROLLING,
      },
      {
        campaignCode: 'CFC-2026-KAZI04',
        buyerId: buyer.id,
        buyerCompanyName: 'Kazi Farms Group (Poultry Feed Sourcing)',
        titleEn: 'Yellow Feed Maize Buyback Contract 2026',
        titleBn: 'পোল্ট্রি ফিড হলুদ ভুট্টা নিশ্চিত বায়ব্যাক চুক্তি ২০২৬',
        descriptionEn:
          'Bulk high-yield maize cultivation agreement with guaranteed floor buyback price for feed mills. Fast automated weighbridge voucher payments.',
        descriptionBn:
          'কাজী ফার্মস ফিড মিলের জন্য উচ্চ ফলনশীল হাইব্রিড ভুট্টা ক্রয় চুক্তি। ডিজিটাল ওয়েইব্রিজে ওজন গ্রহণের ২৪ ঘণ্টার মধ্যে একাউন্টে পেমেন্ট।',
        cropType: ContractCropType.MAIZE_POULTRY_FEED,
        targetSeason: 'Rabi 2026',
        targetDistrict: 'Chuadanga',
        targetUpazila: 'Damurhuda',
        targetTotalAcres: 600,
        currentEnrolledAcres: 210.0,
        guaranteedFloorPricePerKg: 24.0,
        advanceInputCashPct: 25.0,
        estimatedYieldPerBighaKg: 1800,
        qualityStandardSpecs: 'Aflatoxin < 20 ppb, moisture content <= 13.5%, free from mold.',
        intakeDropWarehouseName: 'Kazi Feed Mill Intake Silo, Chuadanga',
        status: CampaignStatus.ENROLLING,
      },
    ];

    const entities = this.campaignRepo.create(seeds);
    return await this.campaignRepo.save(entities);
  }
}
