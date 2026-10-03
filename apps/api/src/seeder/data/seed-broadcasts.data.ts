import {
  BroadcastAudienceType,
  BroadcastProviderName,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from '../../broadcast/enums/broadcast.enums.js';

export interface SeedBroadcastCampaignData {
  title: string;
  templateName: string;
  provider: BroadcastProviderName;
  audienceType: BroadcastAudienceType;
  status: BroadcastStatus;
  targetRole: 'CUSTOMER' | 'SELLER' | 'RIDER';
  scheduledOffsetHours?: number;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  messageTemplateBn: string;
  messageTemplateEn: string;
  variables: Record<string, string>;
}

export const SEED_BROADCAST_CAMPAIGNS: SeedBroadcastCampaignData[] = [
  {
    title: 'Eid-ul-Fitr Mega Grocery & Medicine Discount 2026',
    templateName: '[DEMO] Flash Sale Template (BN)',
    provider: BroadcastProviderName.MOCK,
    audienceType: BroadcastAudienceType.ALL_CUSTOMERS,
    status: BroadcastStatus.COMPLETED,
    targetRole: 'CUSTOMER',
    totalRecipients: 4,
    sentCount: 4,
    deliveredCount: 4,
    readCount: 3,
    failedCount: 0,
    messageTemplateBn:
      'হ্যালো {{customer_name}}, গ্রামের বাজার-এ আজ ঈদ উপলক্ষে নিত্যপ্রয়োজনীয় মুদি ও ঔষধে ২০% বিশেষ ছাড়! এখনই ভিজিট করুন: https://gramerbazar.com/offers?code=EID2026',
    messageTemplateEn:
      'Hello {{customer_name}}, special 20% discount on groceries and essential medicines for Eid at Gramer Bazar! Visit now: https://gramerbazar.com/offers?code=EID2026',
    variables: {
      discount: '20',
      shop_name: 'Gramer Bazar',
      offer_link: 'https://gramerbazar.com/offers?code=EID2026',
    },
  },
  {
    title: 'Monsoon Fresh Vegetables & Healthcare Flash Sale',
    templateName: '[DEMO] Flash Sale Template (BN)',
    provider: BroadcastProviderName.MOCK,
    audienceType: BroadcastAudienceType.ACTIVE_CUSTOMERS,
    status: BroadcastStatus.PROCESSING,
    targetRole: 'CUSTOMER',
    totalRecipients: 3,
    sentCount: 3,
    deliveredCount: 2,
    readCount: 1,
    failedCount: 0,
    messageTemplateBn:
      'প্রিয় {{customer_name}}, সরাসরি গ্রাম থেকে সংগৃহীত তাজা শাকসবজি এবং ফার্স্ট-এইড হেলথকেয়ার পণ্যে আজ ১৫% ক্যাশব্যাক! বিস্তারিত দেখুন: https://gramerbazar.com/offers/monsoon',
    messageTemplateEn:
      'Dear {{customer_name}}, get 15% cashback on fresh farm vegetables and healthcare essentials today! Details: https://gramerbazar.com/offers/monsoon',
    variables: {
      discount: '15',
      shop_name: 'Gramer Bazar Farm Direct',
      offer_link: 'https://gramerbazar.com/offers/monsoon',
    },
  },
  {
    title: 'Pohela Boishakh 1433 Festival Mega Launch',
    templateName: '[DEMO] Coupon Template (EN)',
    provider: BroadcastProviderName.MOCK,
    audienceType: BroadcastAudienceType.ALL_CUSTOMERS,
    status: BroadcastStatus.SCHEDULED,
    scheduledOffsetHours: 48,
    targetRole: 'CUSTOMER',
    totalRecipients: 5,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
    messageTemplateBn:
      'শুভ নববর্ষ ১৪৩৩! {{customer_name}}, পহেলা বৈশাখ উপলক্ষে গ্রামীণ তাঁতের পোশাক ও ঐতিহ্যবাহী খাবারের অর্ডারে BOISHAKHI কোড ব্যবহার করে ২৫% ছাড় উপভোগ করুন।',
    messageTemplateEn:
      'Happy Noboborsho 1433! {{customer_name}}, enjoy 25% discount on rural handloom and traditional sweets with coupon code BOISHAKHI.',
    variables: {
      coupon_code: 'BOISHAKHI',
      discount: '25',
      shop_name: 'Gramer Bazar Heritage',
      offer_link: 'https://gramerbazar.com/boishakhi',
    },
  },
  {
    title: 'Seasonal Organic Mangoes from Rajshahi Pre-Order',
    templateName: '[DEMO] New Product Template (BN)',
    provider: BroadcastProviderName.MOCK,
    audienceType: BroadcastAudienceType.ALL_CUSTOMERS,
    status: BroadcastStatus.DRAFT,
    targetRole: 'CUSTOMER',
    totalRecipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
    messageTemplateBn:
      'প্রিয় {{customer_name}}, রাজশাহীর বাগান থেকে সরাসরি ফরমালিনমুক্ত তাজা হিমসাগর ও ল্যাংড়া আম প্রি-অর্ডার শুরু হচ্ছে খুব শীঘ্রই!',
    messageTemplateEn:
      'Dear {{customer_name}}, formalin-free fresh Himsagar and Langra mangoes directly from Rajshahi orchards opening for pre-order soon!',
    variables: {
      product_name: 'রাজশাহীর তাজা আম',
      price: '১২০ টাকা/কেজি',
      shop_name: 'Gramer Bazar Agro',
      offer_link: 'https://gramerbazar.com/mango',
    },
  },
  {
    title: 'Seller Commission Holiday & Next-Day Payout Notice',
    templateName: '[DEMO] Order Update Template (EN)',
    provider: BroadcastProviderName.MOCK,
    audienceType: BroadcastAudienceType.SELECTED_CUSTOMERS,
    status: BroadcastStatus.COMPLETED,
    targetRole: 'SELLER',
    totalRecipients: 3,
    sentCount: 3,
    deliveredCount: 3,
    readCount: 3,
    failedCount: 0,
    messageTemplateBn:
      'সম্মানিত সেলার {{customer_name}}, আগামী ৭ দিন গ্রামীণ বাজারের সকল অর্ডারে ০% কমিশন উপভোগ করুন! পাশাপাশি সব পে-আউট ২৪ ঘণ্টার মধ্যে আপনার বিকাশ/ব্যাংক অ্যাকাউন্টে ট্রান্সফার হবে।',
    messageTemplateEn:
      'Valued Seller {{customer_name}}, enjoy 0% commission on all orders for the next 7 days! Payouts will be settled within 24 hours to your linked account.',
    variables: {
      order_number: 'POLICY-2026-Q2',
      order_status: 'Active Zero-Commission Week',
    },
  },
  {
    title: 'Rider Monsoon Rainy Day Surge Bonus & Safety Protocols',
    templateName: '[DEMO] Order Update Template (EN)',
    provider: BroadcastProviderName.MOCK,
    audienceType: BroadcastAudienceType.SELECTED_CUSTOMERS,
    status: BroadcastStatus.COMPLETED,
    targetRole: 'RIDER',
    totalRecipients: 3,
    sentCount: 3,
    deliveredCount: 3,
    readCount: 2,
    failedCount: 0,
    messageTemplateBn:
      'প্রিয় রাইডার বন্ধু {{customer_name}}, বৃষ্টির দিনে প্রতি ডেলিভারিতে অতিরিক্ত ৩০ টাকা সার্জ বোনাস চালু হয়েছে। পিচ্ছিল রাস্তায় সাবধানে ও হেলমেট পরে গাড়ি চালান।',
    messageTemplateEn:
      'Dear Rider {{customer_name}}, +30 BDT rain surge bonus is now active on every delivery. Drive carefully and wear helmets on wet roads.',
    variables: {
      order_number: 'RIDER-SAFETY-2026',
      order_status: 'Active Rain Surge Bonus (+30 BDT)',
    },
  },
];
