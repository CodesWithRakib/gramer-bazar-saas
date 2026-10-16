import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MandiPriceRecord,
  MandiTrendDirection,
} from './entities/mandi-price.entity.js';
import {
  CreateMandiPriceDto,
  MandiPriceFilterDto,
  FairPriceAdvisoryQueryDto,
} from './dto/mandi-price.dto.js';

export interface FairPriceAdvisoryResult {
  cropName: string;
  cropNameBn: string;
  offeredPrice: number;
  benchmarkModalPrice: number;
  benchmarkMinPrice: number;
  benchmarkMaxPrice: number;
  priceUnit: string;
  marketName: string;
  division: string;
  district: string;
  deviationPercentage: number;
  pricingStatus: 'FAIR_MARKET' | 'BELOW_MARKET' | 'ABOVE_MARKET';
  adviceEn: string;
  adviceBn: string;
}

@Injectable()
export class AgriIntelligenceService implements OnModuleInit {
  private readonly logger = new Logger(AgriIntelligenceService.name);

  constructor(
    @InjectRepository(MandiPriceRecord)
    private readonly mandiRepo: Repository<MandiPriceRecord>,
  ) {}

  async onModuleInit() {
    await this.seedBaselineMandiPrices();
  }

  async seedBaselineMandiPrices() {
    const count = await this.mandiRepo.count();
    if (count > 0) return;

    this.logger.log('Seeding baseline agricultural mandi wholesale rates...');

    const today = new Date().toISOString().slice(0, 10);

    const baselines: Partial<MandiPriceRecord>[] = [
      {
        cropName: 'Miniket Rice',
        cropNameBn: 'মিনিকেট চাল',
        commodityGroup: 'CEREALS',
        division: 'Rajshahi',
        district: 'Bogra',
        marketName: 'Bogra Mohasthangarh Hat',
        minPrice: 68.0,
        maxPrice: 74.0,
        modalPrice: 71.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.STABLE,
        recordedDate: today,
      },
      {
        cropName: 'Nazirshail Rice',
        cropNameBn: 'নাজিরশাইল চাল',
        commodityGroup: 'CEREALS',
        division: 'Rangpur',
        district: 'Dinajpur',
        marketName: 'Dinajpur Railbazar Mandi',
        minPrice: 75.0,
        maxPrice: 84.0,
        modalPrice: 79.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.UP,
        recordedDate: today,
      },
      {
        cropName: 'Potato (Diamond)',
        cropNameBn: 'ডায়মন্ড আলু',
        commodityGroup: 'VEGETABLES',
        division: 'Rangpur',
        district: 'Rangpur',
        marketName: 'Rangpur City Hat',
        minPrice: 28.0,
        maxPrice: 34.0,
        modalPrice: 30.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.DOWN,
        recordedDate: today,
      },
      {
        cropName: 'Deshi Red Onion',
        cropNameBn: 'দেশি লাল পেঁয়াজ',
        commodityGroup: 'SPICES',
        division: 'Dhaka',
        district: 'Faridpur',
        marketName: 'Faridpur Kanaipur Hat',
        minPrice: 85.0,
        maxPrice: 98.0,
        modalPrice: 92.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.UP,
        recordedDate: today,
      },
      {
        cropName: 'Green Chili',
        cropNameBn: 'কাঁচা মরিচ',
        commodityGroup: 'VEGETABLES',
        division: 'Rajshahi',
        district: 'Pabna',
        marketName: 'Pabna Kashinathpur Hat',
        minPrice: 140.0,
        maxPrice: 180.0,
        modalPrice: 160.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.DOWN,
        recordedDate: today,
      },
      {
        cropName: 'Mustard Seed Oil',
        cropNameBn: 'খাঁটি সরিষার তেল',
        commodityGroup: 'OILSEEDS',
        division: 'Khulna',
        district: 'Jessore',
        marketName: 'Jessore Chourasta Arat',
        minPrice: 220.0,
        maxPrice: 250.0,
        modalPrice: 235.0,
        priceUnit: 'litre',
        trendDirection: MandiTrendDirection.STABLE,
        recordedDate: today,
      },
      {
        cropName: 'Deshi Garlic',
        cropNameBn: 'দেশি রসুন',
        commodityGroup: 'SPICES',
        division: 'Rajshahi',
        district: 'Natore',
        marketName: 'Natore Bonpara Hat',
        minPrice: 180.0,
        maxPrice: 220.0,
        modalPrice: 195.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.UP,
        recordedDate: today,
      },
      {
        cropName: 'Raw Jute',
        cropNameBn: 'তোষা পাট',
        commodityGroup: 'FIBRES',
        division: 'Dhaka',
        district: 'Narsingdi',
        marketName: 'Narsingdi Madhabdi Bazar',
        minPrice: 80.0,
        maxPrice: 95.0,
        modalPrice: 88.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.STABLE,
        recordedDate: today,
      },
      {
        cropName: 'Red Lentils (Masoor Dal)',
        cropNameBn: 'মসুর ডাল',
        commodityGroup: 'PULSES',
        division: 'Khulna',
        district: 'Kushtia',
        marketName: 'Kushtia Poradah Bazar',
        minPrice: 130.0,
        maxPrice: 145.0,
        modalPrice: 138.0,
        priceUnit: 'kg',
        trendDirection: MandiTrendDirection.STABLE,
        recordedDate: today,
      },
    ];

    for (const b of baselines) {
      const record = this.mandiRepo.create(b);
      await this.mandiRepo.save(record);
    }

    this.logger.log(`Seeded ${baselines.length} baseline mandi wholesale commodities.`);
  }

  async getMandiPrices(filters: MandiPriceFilterDto): Promise<MandiPriceRecord[]> {
    const qb = this.mandiRepo.createQueryBuilder('mandi');

    if (filters.search) {
      qb.andWhere(
        '(mandi.cropName ILIKE :search OR mandi.cropNameBn ILIKE :search OR mandi.marketName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters.commodityGroup) {
      qb.andWhere('mandi.commodityGroup = :grp', { grp: filters.commodityGroup });
    }
    if (filters.division) {
      qb.andWhere('mandi.division ILIKE :division', { division: `%${filters.division}%` });
    }
    if (filters.district) {
      qb.andWhere('mandi.district ILIKE :district', { district: `%${filters.district}%` });
    }

    return qb.orderBy('mandi.recordedDate', 'DESC').addOrderBy('mandi.cropName', 'ASC').getMany();
  }

  async getFairPriceAdvisory(query: FairPriceAdvisoryQueryDto): Promise<FairPriceAdvisoryResult> {
    const qb = this.mandiRepo.createQueryBuilder('mandi');

    qb.where('(mandi.cropName ILIKE :crop OR mandi.cropNameBn ILIKE :crop)', {
      crop: `%${query.cropName}%`,
    });

    if (query.district) {
      qb.andWhere('mandi.district ILIKE :dist', { dist: `%${query.district}%` });
    }

    let record = await qb.orderBy('mandi.recordedDate', 'DESC').getOne();

    // Fallback if district specific record is not found
    if (!record) {
      record = await this.mandiRepo
        .createQueryBuilder('mandi')
        .where('(mandi.cropName ILIKE :crop OR mandi.cropNameBn ILIKE :crop)', {
          crop: `%${query.cropName}%`,
        })
        .orderBy('mandi.recordedDate', 'DESC')
        .getOne();
    }

    if (!record) {
      return {
        cropName: query.cropName,
        cropNameBn: query.cropName,
        offeredPrice: query.offeredPrice,
        benchmarkModalPrice: query.offeredPrice,
        benchmarkMinPrice: query.offeredPrice * 0.9,
        benchmarkMaxPrice: query.offeredPrice * 1.1,
        priceUnit: 'kg',
        marketName: 'Bangladesh General Market',
        division: 'National',
        district: query.district ?? 'National',
        deviationPercentage: 0,
        pricingStatus: 'FAIR_MARKET',
        adviceEn: 'No historical mandi record found for this exact commodity. Ensure your price covers input and transportation costs.',
        adviceBn: 'এই পণ্যের সুনির্দিষ্ট পাইকারি রেকর্ড পাওয়া যায়নি। আপনার উৎপাদন ও পরিবহন খরচ হিসাব করে মূল্য নির্ধারণ করুন।',
      };
    }

    const modal = Number(record.modalPrice);
    const min = Number(record.minPrice);
    const max = Number(record.maxPrice);
    const offered = Number(query.offeredPrice);

    const deviationPct = Math.round(((offered - modal) / modal) * 1000) / 10;

    let status: 'FAIR_MARKET' | 'BELOW_MARKET' | 'ABOVE_MARKET' = 'FAIR_MARKET';
    let adviceEn = '';
    let adviceBn = '';

    if (Math.abs(deviationPct) <= 10) {
      status = 'FAIR_MARKET';
      adviceEn = `Your price (৳${offered}/${record.priceUnit}) aligns with prevailing wholesale mandi rates in ${record.marketName} (Average: ৳${modal}/${record.priceUnit}). Optimal for high conversion.`;
      adviceBn = `আপনার নির্ধারিত মূল্য (৳${offered}/${record.priceUnit}) ${record.marketName}-এর পাইকারি বাজার দরের (গড়: ৳${modal}/${record.priceUnit}) সাথে সংগতিপূর্ণ। দ্রুত বিক্রির জন্য উপযুক্ত।`;
    } else if (deviationPct < -10) {
      status = 'BELOW_MARKET';
      const absDiff = Math.abs(deviationPct);
      adviceEn = `Your price is ${absDiff}% below prevailing mandi rates (৳${modal}/${record.priceUnit}). Great for clearance, but verify your profit margin.`;
      adviceBn = `আপনার মূল্য বাজার গড়ের চেয়ে ${absDiff}% কম (বাজার দর: ৳${modal}/${record.priceUnit})। খুব দ্রুত বিক্রি হবে, তবে আপনার লাভ নিশ্চিত করুন।`;
    } else {
      status = 'ABOVE_MARKET';
      adviceEn = `Your price is ${deviationPct}% above wholesale rates (৳${modal}/${record.priceUnit}). Recommended for premium organic quality; consider slight reduction for mass turnover.`;
      adviceBn = `আপনার মূল্য পাইকারি দরের চেয়ে ${deviationPct}% বেশি (বাজার দর: ৳${modal}/${record.priceUnit})। প্রিমিয়াম বা অর্গানিক ফসলের জন্য প্রযোজ্য, দ্রুত বিক্রির জন্য সামান্য কমাতে পারেন।`;
    }

    return {
      cropName: record.cropName,
      cropNameBn: record.cropNameBn,
      offeredPrice: offered,
      benchmarkModalPrice: modal,
      benchmarkMinPrice: min,
      benchmarkMaxPrice: max,
      priceUnit: record.priceUnit,
      marketName: record.marketName,
      division: record.division,
      district: record.district,
      deviationPercentage: deviationPct,
      pricingStatus: status,
      adviceEn,
      adviceBn,
    };
  }

  async recordMandiPrice(dto: CreateMandiPriceDto): Promise<MandiPriceRecord> {
    const record = this.mandiRepo.create(dto);
    const saved = await this.mandiRepo.save(record);
    this.logger.log(
      `Recorded mandi spot price for ${record.cropName} in ${record.marketName} (${record.modalPrice} BDT/${record.priceUnit})`,
    );
    return saved;
  }
}
