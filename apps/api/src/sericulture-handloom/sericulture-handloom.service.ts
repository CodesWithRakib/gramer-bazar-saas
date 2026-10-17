import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HandloomArtisanProduct } from './entities/handloom-artisan-product.entity.js';
import { SericultureCocoonBatch } from './entities/sericulture-cocoon-batch.entity.js';
import { ArtisanCustomOrder } from './entities/artisan-custom-order.entity.js';
import {
  SericultureCraftType,
  SilkGrade,
  YarnMaterial,
  AuthenticityStatus,
  WeavingLoomType,
  CocoonType,
  ArtisanOrderEscrowStatus,
} from './enums/sericulture-handloom.enum.js';
import {
  QueryArtisanProductsDto,
  CalculateCocoonReelingDto,
  CalculateFairWageDto,
  CreateHandloomProductDto,
  CreateCocoonBatchDto,
  CreateCustomOrderDto,
  UpdateLoomProgressDto,
} from './dto/sericulture-handloom.dto.js';

@Injectable()
export class SericultureHandloomService {
  private readonly logger = new Logger(SericultureHandloomService.name);

  constructor(
    @InjectRepository(HandloomArtisanProduct)
    private readonly productRepo: Repository<HandloomArtisanProduct>,
    @InjectRepository(SericultureCocoonBatch)
    private readonly cocoonRepo: Repository<SericultureCocoonBatch>,
    @InjectRepository(ArtisanCustomOrder)
    private readonly orderRepo: Repository<ArtisanCustomOrder>,
  ) {
    this.seedBaselineData().catch((err) =>
      this.logger.error('Failed to seed baseline sericulture handloom data', err),
    );
  }

  private async seedBaselineData(): Promise<void> {
    const productCount = await this.productRepo.count();
    if (productCount === 0) {
      this.logger.log('Seeding baseline Heritage Silk & Handloom catalog...');
      const seedProducts: Partial<HandloomArtisanProduct>[] = [
        {
          artisanId: 'artisan-raj-01',
          artisanName: 'মোঃ আব্দুল কুদ্দুস রেশম শিল্পী',
          craftType: SericultureCraftType.RAJSHAHI_MULBERRY_SILK,
          titleBn: 'ঐতিহ্যবাহী রাজশাহী খাঁটি মালবেরি রেশম সিল্ক শাড়ি (Sopura Pure Silk)',
          titleEn: 'Rajshahi Pure Mulberry Silk Heritage Saree',
          originDistrict: 'Rajshahi',
          weavingVillage: 'Sopura Silk Industrial Zone',
          loomType: WeavingLoomType.FLY_SHUTTLE_FRAME_LOOM,
          yarnMaterial: YarnMaterial.PURE_MULBERRY_SILK_100,
          threadCountWarp: 120,
          threadCountWeft: 120,
          silkGrade: SilkGrade.GRADE_A_PREMIUM_EXPORT,
          authenticityStatus: AuthenticityStatus.BSDB_BHB_CERTIFIED,
          giCertificateNumber: 'GI-BD-SILK-001',
          weavingDurationDays: 12,
          artisanWageBdt: 9600,
          priceBdt: 18500,
          stockQuantity: 4,
          mediaGalleryUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
          burnTestResultNotes: 'ল্যাব বার্ন টেস্ট সম্পন্ন: ধীরে জ্বলে, পোড়া চুলের গন্ধ নিঃসৃত হয় এবং ভঙ্গুর কালো ছাই তৈরি হয় (১০০% খাঁটি মালবেরি প্রোটিন ফিলামেন্ট)।',
          dimensionsLengthMeters: 5.5,
          dimensionsWidthInches: 46,
          isCustomOrderAvailable: true,
        },
        {
          artisanId: 'artisan-jam-02',
          artisanName: 'ওস্তাদ মোবারক হোসেন জামদানি তন্তুবায়',
          craftType: SericultureCraftType.NARAYANGANJ_DHAKAI_JAMDANI,
          titleBn: 'রূপগঞ্জ ঐতিহ্যবাহী ফুলওয়ার নকশা ঢাকাই জামদানি শাড়ি',
          titleEn: 'Traditional Handspun Rupganj Dhakai Jamdani Saree',
          originDistrict: 'Narayanganj',
          weavingVillage: 'Noapara, Rupganj',
          loomType: WeavingLoomType.TRADITIONAL_PIT_LOOM,
          yarnMaterial: YarnMaterial.FINE_KHADI_COTTON_COUNT_100,
          threadCountWarp: 100,
          threadCountWeft: 100,
          silkGrade: SilkGrade.GRADE_A_PREMIUM_EXPORT,
          authenticityStatus: AuthenticityStatus.GI_REGISTERED_ORIGIN,
          giCertificateNumber: 'GI-BD-JAMDANI-002',
          weavingDurationDays: 28,
          artisanWageBdt: 22400,
          priceBdt: 34000,
          stockQuantity: 2,
          mediaGalleryUrls: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'],
          burnTestResultNotes: '১০০ কাউন্ট হস্তকাটা ফাইন কটন ও রূপালী জরি সুতা সমন্বয়ে বোনা ইউনেস্কো ইনট্যানজিবল কালচারাল হেরিটেজ জিআই জামদানি।',
          dimensionsLengthMeters: 5.5,
          dimensionsWidthInches: 46,
          isCustomOrderAvailable: true,
        },
        {
          artisanId: 'artisan-tan-03',
          artisanName: 'শ্রী দিলীপ বসাক তাঁতি সমবায়',
          craftType: SericultureCraftType.TANGAIL_HANDLOOM_TAANT,
          titleBn: 'টাঙ্গাইল পাথরাইল নরম সুতি ডুরে ও আঁচল তাঁত শাড়ি',
          titleEn: 'Tangail Pathrail Fine Cotton Handloom Saree',
          originDistrict: 'Tangail',
          weavingVillage: 'Pathrail, Delduar',
          loomType: WeavingLoomType.TRADITIONAL_PIT_LOOM,
          yarnMaterial: YarnMaterial.GASSED_MERCERIZED_COTTON,
          threadCountWarp: 80,
          threadCountWeft: 80,
          silkGrade: SilkGrade.GRADE_B_DOMESTIC_STANDARD,
          authenticityStatus: AuthenticityStatus.GI_REGISTERED_ORIGIN,
          giCertificateNumber: 'GI-BD-TANGAIL-004',
          weavingDurationDays: 4,
          artisanWageBdt: 3200,
          priceBdt: 5800,
          stockQuantity: 8,
          mediaGalleryUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'],
          burnTestResultNotes: 'মার্সারাইজড ৮০ কাউন্ট সুতি সুতা, প্রাকৃতিক উদ্ভিজ্জ রঙ ও খাঁটি হস্তচালিত তাঁতের টানা-পোড়েন।',
          dimensionsLengthMeters: 5.5,
          dimensionsWidthInches: 48,
          isCustomOrderAvailable: true,
        },
        {
          artisanId: 'artisan-cht-04',
          artisanName: 'রঙ্গিলা চাকমা পাহাড়ি বুনন শিল্পী',
          craftType: SericultureCraftType.HILL_TRACTS_CHAKMA_PINON_HADI,
          titleBn: 'রাঙ্গামাটি আদিবাসী পাহাড়ি কোমর তাঁত পিনন হাদি চাদর ও থামি',
          titleEn: 'Chakma Indigenous Backstrap Loom Pinon Hadi Wrap',
          originDistrict: 'Rangamati',
          weavingVillage: 'Sapchhari Tribal Village',
          loomType: WeavingLoomType.INDIGENOUS_BACKSTRAP_LOOM,
          yarnMaterial: YarnMaterial.SILK_COTTON_BLEND,
          threadCountWarp: 60,
          threadCountWeft: 60,
          silkGrade: SilkGrade.GRADE_A_PREMIUM_EXPORT,
          authenticityStatus: AuthenticityStatus.BSDB_BHB_CERTIFIED,
          giCertificateNumber: null,
          weavingDurationDays: 14,
          artisanWageBdt: 11200,
          priceBdt: 16500,
          stockQuantity: 3,
          mediaGalleryUrls: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
          burnTestResultNotes: 'ঐতিহ্যবাহী কোমর তাঁত (ব্যাকস্ট্র্যাপ লুম) ও জুম তুলার রঙে বোনা আদিবাসী জ্যামিতিক নকশার চাদর।',
          dimensionsLengthMeters: 2.4,
          dimensionsWidthInches: 38,
          isCustomOrderAvailable: true,
        },
        {
          artisanId: 'artisan-bho-05',
          artisanName: 'ভোলাহাট এরি সিল্ক তাঁতি সমিতি',
          craftType: SericultureCraftType.ENDI_ERI_SILK,
          titleBn: 'চাঁপাইনবাবগঞ্জ খাঁটি এন্ডি রেশম অহিংসা শাল (Eri Silk Wrap)',
          titleEn: 'Chapainawabganj Pure Endi Eri Silk Winter Shawl',
          originDistrict: 'Chapainawabganj',
          weavingVillage: 'Bholahat Sericulture Cluster',
          loomType: WeavingLoomType.FLY_SHUTTLE_FRAME_LOOM,
          yarnMaterial: YarnMaterial.PURE_ENDI_SILK_100,
          threadCountWarp: 70,
          threadCountWeft: 70,
          silkGrade: SilkGrade.GRADE_A_PREMIUM_EXPORT,
          authenticityStatus: AuthenticityStatus.BSDB_BHB_CERTIFIED,
          giCertificateNumber: 'GI-BD-ERI-008',
          weavingDurationDays: 6,
          artisanWageBdt: 4800,
          priceBdt: 9500,
          stockQuantity: 5,
          mediaGalleryUrls: ['https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80'],
          burnTestResultNotes: 'অহিংসা এরি রেশম (কীট অক্ষত রেখে সংগৃহীত কোকুন), শীতকালে প্রাকৃতিকভাবে উষ্ণ ও আরামদায়ক টেক্সচার।',
          dimensionsLengthMeters: 2.2,
          dimensionsWidthInches: 42,
          isCustomOrderAvailable: false,
        },
      ];

      for (const p of seedProducts) {
        await this.productRepo.save(this.productRepo.create(p));
      }
      this.logger.log('Seeded 5 baseline Handloom Artisan Products.');
    }

    const cocoonCount = await this.cocoonRepo.count();
    if (cocoonCount === 0) {
      this.logger.log('Seeding baseline Sericulture Cocoon Batches...');
      const seedCocoons: Partial<SericultureCocoonBatch>[] = [
        {
          lotNumber: 'BSDB-LOT-RAJ-2026-01',
          farmerId: 'farmer-silk-01',
          farmerName: 'মোঃ শফিকুল ইসলাম (রেশম চাষী)',
          farmingDistrict: 'Bholahat, Chapainawabganj',
          mulberryVariety: 'BM-4 (হাইব্রিড তুঁত পাতা)',
          cocoonType: CocoonType.BIVOLTINE,
          freshCocoonWeightKg: 125.0,
          shellRatioPercentage: 22.4,
          estimatedRawSilkFilamentKg: 14.7, // 125 / 8.5
          reelingFactoryName: 'রাজশাহী সরকারি রেশম কারখানা (BSDB Reeling Center)',
          pricePerKgBdt: 680,
          isInspectedByBSDB: true,
          bsdbInspectorName: 'ড. আব্দুর রাজ্জাক (BSDB টেকনিক্যাল অফিসার)',
          harvestDate: '2026-10-10',
        },
        {
          lotNumber: 'BSDB-LOT-SHIB-2026-02',
          farmerId: 'farmer-silk-02',
          farmerName: 'আলতাফ হোসেন',
          farmingDistrict: 'Shibganj, Chapainawabganj',
          mulberryVariety: 'BM-11',
          cocoonType: CocoonType.BIVOLTINE,
          freshCocoonWeightKg: 85.0,
          shellRatioPercentage: 21.0,
          estimatedRawSilkFilamentKg: 10.0,
          reelingFactoryName: 'সোপুরা সিল্ক স্পিনিং মিলস',
          pricePerKgBdt: 660,
          isInspectedByBSDB: true,
          bsdbInspectorName: 'মোঃ জাহিদ হাসান',
          harvestDate: '2026-10-12',
        },
        {
          lotNumber: 'BSDB-LOT-NAT-2026-03',
          farmerId: 'farmer-silk-03',
          farmerName: 'নাটোর রেশম চাষী সমবায় সমিতি',
          farmingDistrict: 'Natore Sadar',
          mulberryVariety: 'BM-4',
          cocoonType: CocoonType.MULTIVOLTINE,
          freshCocoonWeightKg: 160.0,
          shellRatioPercentage: 19.5,
          estimatedRawSilkFilamentKg: 17.8,
          reelingFactoryName: 'নাটোর সিল্ক ফিলামেন্ট ডায়ের',
          pricePerKgBdt: 610,
          isInspectedByBSDB: true,
          bsdbInspectorName: 'নাজমুল আলম',
          harvestDate: '2026-10-14',
        },
      ];

      for (const c of seedCocoons) {
        await this.cocoonRepo.save(this.cocoonRepo.create(c));
      }
      this.logger.log('Seeded 3 baseline Sericulture Cocoon Batches.');
    }

    const orderCount = await this.orderRepo.count();
    if (orderCount === 0) {
      this.logger.log('Seeding sample Custom Weaving Orders with Escrow...');
      const seedOrders: Partial<ArtisanCustomOrder>[] = [
        {
          orderNumber: 'HND-ORD-2026-091',
          buyerId: 'buyer-user-01',
          buyerName: 'ফারহানা আহমেদ',
          buyerPhone: '01711223344',
          buyerEmail: 'farhana.ahmed@example.com',
          artisanId: 'artisan-jam-02',
          artisanName: 'ওস্তাদ মোবারক হোসেন জামদানি তন্তুবায়',
          craftType: SericultureCraftType.NARAYANGANJ_DHAKAI_JAMDANI,
          customMotifDescription: 'গাঢ় নীল (Royal Navy) জমিনে খাঁটি রূপালী জরির ময়ূরপঙ্খী বুটা ও টানা-পোড়েনে বিশেষ বুনন',
          primaryColorHex: '#002366',
          zariSpecification: 'PURE_SILVER_ZARI_TESTED',
          agreedPriceBdt: 42000,
          advanceEscrowBdt: 21000, // 50% escrow
          estimatedDeliveryDays: 30,
          orderStatus: ArtisanOrderEscrowStatus.IN_WEAVING_PROGRESS,
          weftProgressPercentage: 45,
          inspectionNotes: 'তাঁতে টানা প্রস্তুত ও ২৫ ইঞ্চি আঁচলের বুটা নিখুঁতভাবে শেষ হয়েছে।',
          dispatchedTrackingNumber: null,
        },
      ];

      for (const o of seedOrders) {
        await this.orderRepo.save(this.orderRepo.create(o));
      }
      this.logger.log('Seeded sample Custom Weaving Order.');
    }
  }

  // --- Reeling & Conversion Calculations ---
  calculateCocoonReeling(dto: CalculateCocoonReelingDto) {
    const shellRatio = dto.shellRatioPercentage || (dto.cocoonType === CocoonType.BIVOLTINE ? 22.0 : 19.5);
    // Standard Renditta: kilograms of fresh cocoons required to produce 1 kg of raw silk filament
    // High grade bivoltine (22% shell) has renditta ~8.2, multivoltine has renditta ~9.2
    const renditta = Number(((100 / shellRatio) * 1.8).toFixed(2));
    const estimatedRawSilkFilamentKg = Number((dto.freshCocoonWeightKg / renditta).toFixed(2));

    const avgCocoonFarmgateRate = dto.cocoonType === CocoonType.BIVOLTINE ? 680 : 610; // BDT/kg
    const avgReeledRawSilkRate = 7800; // BDT/kg of high-denier Grade A Mulberry silk

    const cocoonFarmgateTotalBdt = Math.round(dto.freshCocoonWeightKg * avgCocoonFarmgateRate);
    const reeledRawSilkValueBdt = Math.round(estimatedRawSilkFilamentKg * avgReeledRawSilkRate);
    const chrysalisPupaeKg = Number((dto.freshCocoonWeightKg * 0.62).toFixed(2));
    const chrysalisProteinValueBdt = Math.round(chrysalisPupaeKg * 80); // Fish/poultry feed by-product

    const netValueAddedBdt = (reeledRawSilkValueBdt + chrysalisProteinValueBdt) - cocoonFarmgateTotalBdt;
    const valueAdditionPercentage = Math.round((netValueAddedBdt / cocoonFarmgateTotalBdt) * 100);

    return {
      freshCocoonWeightKg: dto.freshCocoonWeightKg,
      cocoonType: dto.cocoonType || CocoonType.BIVOLTINE,
      shellRatioPercentage: shellRatio,
      rendittaRatio: renditta,
      rendittaExplanation: `${renditta} কেজি কাঁচা গুটি থেকে গড়ে ১ কেজি খাঁটি রেশম সুতা (Raw Silk Filament) উৎপন্ন হয়।`,
      estimatedRawSilkFilamentKg,
      chrysalisPupaeByProductKg: chrysalisPupaeKg,
      cocoonFarmgateTotalBdt,
      reeledRawSilkValueBdt,
      chrysalisProteinValueBdt,
      netValueAddedBdt,
      valueAdditionPercentage,
      recommendationBn:
        valueAdditionPercentage > 25
          ? `কাঁচা গুটি স্থানীয় ফড়িয়াদের কাছে বিক্রি না করে রিলিং সেন্টারে সুতা কেটে সরবরাহ করলে ${valueAdditionPercentage}% অতিরিক্ত মুনাফা অর্জিত হয়।`
          : 'গুটির শেল রেশিও আরও উন্নত করতে মালবেরি BM-4 জাতের তুঁত পাতা ও সঠিক তাপমাত্রা বজায় রাখুন।',
    };
  }

  // --- Fair-Wage Calculator ---
  calculateFairWage(dto: CalculateFairWageDto) {
    let yarnPricePerKg = 4500;
    let yarnWeightGrams = 450;

    switch (dto.craftType) {
      case SericultureCraftType.RAJSHAHI_MULBERRY_SILK:
        yarnPricePerKg = 8200;
        yarnWeightGrams = 420;
        break;
      case SericultureCraftType.NARAYANGANJ_DHAKAI_JAMDANI:
        yarnPricePerKg = 4800;
        yarnWeightGrams = 320;
        break;
      case SericultureCraftType.TANGAIL_HANDLOOM_TAANT:
        yarnPricePerKg = 1800;
        yarnWeightGrams = 550;
        break;
      case SericultureCraftType.ENDI_ERI_SILK:
        yarnPricePerKg = 6200;
        yarnWeightGrams = 480;
        break;
      case SericultureCraftType.HILL_TRACTS_CHAKMA_PINON_HADI:
        yarnPricePerKg = 3200;
        yarnWeightGrams = 520;
        break;
      default:
        yarnPricePerKg = 4000;
        yarnWeightGrams = 450;
    }

    const rawYarnCostBdt = Math.round((yarnWeightGrams / 1000) * yarnPricePerKg);
    const zariCostBdt = dto.zariType?.includes('SILVER') ? 3500 : dto.zariType?.includes('ZARI') ? 1800 : 800;
    const loomWarpingPrepCostBdt = 1200;

    const dailyArtisanFairWageBdt = 850; // BDT/day fair wage standard
    const totalArtisanWageBdt = dto.weavingDays * dailyArtisanFairWageBdt;

    const netProductionCostBdt = rawYarnCostBdt + zariCostBdt + loomWarpingPrepCostBdt + totalArtisanWageBdt;
    const cooperativeFairMarginBdt = Math.round(netProductionCostBdt * 0.15); // 15% cooperative operations
    const fairTransparentRetailPriceBdt = netProductionCostBdt + cooperativeFairMarginBdt;

    // Traditional middleman/mahajan pays weaver only ~300 BDT/day and inflates retail markup
    const exploitativeTraditionalWageBdt = dto.weavingDays * 300;
    const directBenefitIncreasePercentage = Math.round(
      ((totalArtisanWageBdt - exploitativeTraditionalWageBdt) / exploitativeTraditionalWageBdt) * 100,
    );

    return {
      craftType: dto.craftType,
      weavingDays: dto.weavingDays,
      dailyArtisanFairWageBdt,
      totalArtisanWageBdt,
      rawYarnCostBdt,
      zariCostBdt,
      loomWarpingPrepCostBdt,
      netProductionCostBdt,
      cooperativeFairMarginBdt,
      fairTransparentRetailPriceBdt,
      artisanWageSharePercentage: Math.round((totalArtisanWageBdt / fairTransparentRetailPriceBdt) * 100),
      directBenefitIncreasePercentage,
      wageVerdictBn: `সরাসরি ই-কমার্স সংযোগের ফলে তাঁতি মধ্যস্বত্বভোগী দাদন ছাড়াই দৈনিক ৮৫০ টাকা ন্যায্য পারিশ্রমিকে মোট ৳${totalArtisanWageBdt.toLocaleString()} পাবেন (+${directBenefitIncreasePercentage}% বৃদ্ধি)।`,
    };
  }

  // --- Catalog & Products ---
  async getCatalog(query: QueryArtisanProductsDto) {
    const qb = this.productRepo.createQueryBuilder('p');

    if (query.craftType) {
      qb.andWhere('p.craftType = :craftType', { craftType: query.craftType });
    }
    if (query.originDistrict) {
      qb.andWhere('LOWER(p.originDistrict) LIKE LOWER(:district)', { district: `%${query.originDistrict}%` });
    }
    if (query.silkGrade) {
      qb.andWhere('p.silkGrade = :silkGrade', { silkGrade: query.silkGrade });
    }
    if (query.loomType) {
      qb.andWhere('p.loomType = :loomType', { loomType: query.loomType });
    }
    if (query.search) {
      qb.andWhere('(LOWER(p.titleBn) LIKE LOWER(:s) OR LOWER(p.titleEn) LIKE LOWER(:s) OR LOWER(p.weavingVillage) LIKE LOWER(:s))', {
        s: `%${query.search}%`,
      });
    }

    qb.orderBy('p.createdAt', 'DESC');
    return qb.getMany();
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Handloom product with ID "${id}" was not found.`);
    }
    return product;
  }

  async getOverviewStats() {
    const totalProducts = await this.productRepo.count();
    const cocoonBatches = await this.cocoonRepo.find();
    const totalCocoonWeightKg = cocoonBatches.reduce((acc, c) => acc + Number(c.freshCocoonWeightKg), 0);
    const activeOrders = await this.orderRepo.find();
    const totalEscrowLockedBdt = activeOrders.reduce((acc, o) => acc + Number(o.advanceEscrowBdt), 0);

    return {
      totalArtisanProducts: totalProducts,
      totalCocoonBatches: cocoonBatches.length,
      totalCocoonWeightKg: Math.round(totalCocoonWeightKg),
      totalActiveCustomOrders: activeOrders.length,
      totalEscrowLockedBdt: Math.round(totalEscrowLockedBdt),
      registeredGIProductsCount: 4,
    };
  }

  async createProduct(artisanId: string, artisanName: string, dto: CreateHandloomProductDto) {
    const product = this.productRepo.create({
      artisanId,
      artisanName,
      craftType: dto.craftType,
      titleBn: dto.titleBn,
      titleEn: dto.titleEn,
      originDistrict: dto.originDistrict,
      weavingVillage: dto.weavingVillage,
      loomType: dto.loomType,
      yarnMaterial: dto.yarnMaterial,
      threadCountWarp: dto.threadCountWarp,
      threadCountWeft: dto.threadCountWeft,
      silkGrade: dto.silkGrade,
      authenticityStatus: dto.authenticityStatus,
      giCertificateNumber: dto.giCertificateNumber || null,
      weavingDurationDays: dto.weavingDurationDays,
      artisanWageBdt: dto.artisanWageBdt,
      priceBdt: dto.priceBdt,
      stockQuantity: dto.stockQuantity ?? 1,
      mediaGalleryUrls: dto.mediaGalleryUrls || [],
      burnTestResultNotes: dto.burnTestResultNotes || null,
      dimensionsLengthMeters: dto.dimensionsLengthMeters ?? 5.5,
      dimensionsWidthInches: dto.dimensionsWidthInches ?? 46,
      isCustomOrderAvailable: dto.isCustomOrderAvailable ?? true,
    });

    const saved = await this.productRepo.save(product);
    this.logger.log(`Created handloom artisan product ${saved.id} (${saved.titleBn})`);
    return saved;
  }

  async updateProduct(id: string, dto: Partial<CreateHandloomProductDto>) {
    const product = await this.getProductById(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  // --- Sericulture Cocoon Batches ---
  async getCocoonBatches() {
    return this.cocoonRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createCocoonBatch(farmerId: string, dto: CreateCocoonBatchDto) {
    const renditta = dto.cocoonType === CocoonType.BIVOLTINE ? 8.5 : 9.0;
    const estimatedRawSilk = Number((dto.freshCocoonWeightKg / renditta).toFixed(2));
    const lotNumber = `BSDB-LOT-${Date.now().toString().slice(-6)}`;

    const batch = this.cocoonRepo.create({
      lotNumber,
      farmerId,
      farmerName: dto.farmerName,
      farmingDistrict: dto.farmingDistrict,
      mulberryVariety: dto.mulberryVariety || 'BM-4',
      cocoonType: dto.cocoonType,
      freshCocoonWeightKg: dto.freshCocoonWeightKg,
      shellRatioPercentage: dto.shellRatioPercentage ?? 21.0,
      estimatedRawSilkFilamentKg: estimatedRawSilk,
      reelingFactoryName: dto.reelingFactoryName || null,
      pricePerKgBdt: dto.pricePerKgBdt,
      isInspectedByBSDB: dto.isInspectedByBSDB ?? true,
      bsdbInspectorName: dto.bsdbInspectorName || null,
      harvestDate: dto.harvestDate,
    });

    return this.cocoonRepo.save(batch);
  }

  // --- Custom Commissions & Escrow ---
  async createCustomOrder(buyerId: string, buyerName: string, buyerPhone: string, dto: CreateCustomOrderDto) {
    const orderNumber = `HND-ORD-${Date.now().toString().slice(-6)}`;
    const advanceEscrowBdt = Math.round(dto.agreedPriceBdt * 0.5); // 50% upfront escrow

    const order = this.orderRepo.create({
      orderNumber,
      buyerId,
      buyerName,
      buyerPhone,
      artisanId: dto.artisanId,
      artisanName: dto.artisanName,
      craftType: dto.craftType,
      customMotifDescription: dto.customMotifDescription,
      primaryColorHex: dto.primaryColorHex || '#800020',
      zariSpecification: dto.zariSpecification || 'PURE_SILVER_ZARI',
      agreedPriceBdt: dto.agreedPriceBdt,
      advanceEscrowBdt,
      estimatedDeliveryDays: dto.estimatedDeliveryDays || 21,
      orderStatus: ArtisanOrderEscrowStatus.ORDER_PLACED_ESCROW_LOCKED,
      weftProgressPercentage: 5,
    });

    const saved = await this.orderRepo.save(order);
    this.logger.log(`Created custom order ${saved.orderNumber} with 50% escrow (৳${advanceEscrowBdt})`);
    return saved;
  }

  async getMyCustomOrders(buyerId: string) {
    return this.orderRepo.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getArtisanOrders(artisanId: string) {
    return this.orderRepo.find({
      where: { artisanId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllAdminOrders() {
    return this.orderRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateLoomProgress(id: string, dto: UpdateLoomProgressDto) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" was not found.`);
    }

    if (dto.orderStatus) {
      order.orderStatus = dto.orderStatus;
    }
    if (dto.weftProgressPercentage !== undefined) {
      order.weftProgressPercentage = dto.weftProgressPercentage;
    }
    if (dto.inspectionNotes !== undefined) {
      order.inspectionNotes = dto.inspectionNotes;
    }
    if (dto.dispatchedTrackingNumber !== undefined) {
      order.dispatchedTrackingNumber = dto.dispatchedTrackingNumber;
    }

    return this.orderRepo.save(order);
  }

  async settleCustomOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" was not found.`);
    }

    order.orderStatus = ArtisanOrderEscrowStatus.ESCROW_RELEASED_TO_WEAVER;
    order.weftProgressPercentage = 100;
    order.inspectionNotes = 'ক্রেতা দ্বারা পণ্য প্রাপ্তি ও তাঁত বোর্ডের মান নিরীক্ষা নিশ্চিত। সম্পূর্ণ অর্থ তাঁতির অ্যাকাউন্টে পরিশোধিত।';

    const saved = await this.orderRepo.save(order);
    this.logger.log(`Released escrow ৳${order.agreedPriceBdt} for order ${order.orderNumber} to weaver ${order.artisanName}`);
    return saved;
  }
}
