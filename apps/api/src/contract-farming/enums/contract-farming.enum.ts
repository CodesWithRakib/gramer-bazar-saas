export enum ContractCropType {
  POTATO_PROCESSING = 'POTATO_PROCESSING',           // চিপস ও প্রক্রিয়াজাতকরণ আলু (Asterix, Lady Rosetta)
  CHINIGURA_AROMATIC_RICE = 'CHINIGURA_AROMATIC_RICE', // সুগন্ধি চিনিগুঁড়া চাল (রপ্তানি মান)
  TOMATO_PROCESSING = 'TOMATO_PROCESSING',           // টমেটো পেস্ট ও প্রক্রিয়াজাতকরণ
  MAIZE_POULTRY_FEED = 'MAIZE_POULTRY_FEED',         // পোল্ট্রি ফিড ভুট্টা
  CHILI_SPICE_PROCESSING = 'CHILI_SPICE_PROCESSING', // মসলা প্রক্রিয়াকরণ শুকনা মরিচ
  MUSTARD_OIL_SEED = 'MUSTARD_OIL_SEED',             // কোল্ড-প্রেসড সরিষা বীজ
  ORGANIC_VEGETABLES = 'ORGANIC_VEGETABLES',         // সুপারশপ অর্গানিক শাকসবজি
  GINGER_TURMERIC = 'GINGER_TURMERIC',               // প্রক্রিয়াজাত আদা ও হলুদ
  OTHER = 'OTHER',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ENROLLING = 'ENROLLING',       // কৃষকদের আবেদন গ্রহণ চলছে
  IN_PROGRESS = 'IN_PROGRESS',   // চাষাবাদ ও মধ্যবর্তী পরিচর্যা চলমান
  HARVEST_INTAKE = 'HARVEST_INTAKE', // ফসল ওয়্যারহাউসে গ্রহণ ও ওজন পরিমাপ
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export enum AgreementStatus {
  APPLIED = 'APPLIED',                         // কৃষক জমি ও উৎপাদনের আবেদন করেছেন
  APPROVED = 'APPROVED',                       // কর্পোরেট বায়ার অনুমোদন দিয়েছেন
  ACTIVE_PLANTED = 'ACTIVE_PLANTED',           // বীজ বপন ও ২৫% অগ্রিম ইনপুট মূলধন ছাড়
  MILESTONES_VERIFIED = 'MILESTONES_VERIFIED', // মধ্যবর্তী মাঠ পরিদর্শন উত্তীর্ণ
  DELIVERING = 'DELIVERING',                   // ফসল ওয়্যারহাউসে সরবরাহ চলছে
  SETTLED = 'SETTLED',                         // চূড়ান্ত ওজন ও এসক্রো নিষ্পত্তি সম্পন্ন
  DISPUTED = 'DISPUTED',                       // মান বা ওজনে বিরোধ
  CANCELLED = 'CANCELLED',
}

export enum MilestoneStage {
  SEEDING_GERMINATION = 'SEEDING_GERMINATION',   // বীজ বপন ও অঙ্কুরোদগম (অগ্রিম মূলধন ছাড়)
  FLOWERING_VEGETATIVE = 'FLOWERING_VEGETATIVE', // ফুল ও অঙ্গজ বৃদ্ধি পর্যায়
  PRE_HARVEST_MATURITY = 'PRE_HARVEST_MATURITY', // ফসল পরিপক্কতা ও আর্দ্রতা অডিট
}

export enum DeliveryGrade {
  GRADE_A = 'GRADE_A', // প্রিমিয়াম প্রক্রিয়াজাতকরণ মান (+১০% বোনাস)
  GRADE_B = 'GRADE_B', // স্ট্যান্ডার্ড চুক্তি মূল্য (১০০%)
  GRADE_C = 'GRADE_C', // গৌণ মান (-১৫% কর্তন)
  REJECTED = 'REJECTED',
}
