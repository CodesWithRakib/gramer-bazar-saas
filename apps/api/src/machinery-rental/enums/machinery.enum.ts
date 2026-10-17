export enum MachineryCategory {
  POWER_TILLER = 'POWER_TILLER',                   // পাওয়ার টিলার
  TRACTOR = 'TRACTOR',                             // ট্রাক্টর
  COMBINE_HARVESTER = 'COMBINE_HARVESTER',         // কম্বাইন্ড হারভেস্টার
  IRRIGATION_PUMP_DIESEL = 'IRRIGATION_PUMP_DIESEL', // ডিজেল সেচ পাম্প
  IRRIGATION_PUMP_SOLAR = 'IRRIGATION_PUMP_SOLAR',   // সোলার সেচ পাম্প
  PADDY_THRESHER = 'PADDY_THRESHER',               // ধান মাড়াই কল / থ্রেশার
  SPRAYING_DRONE = 'SPRAYING_DRONE',               // বালাইনাশক ড্রোন
  SEED_PLANTER = 'SEED_PLANTER',                   // বীজ বপন যন্ত্র / ড্রাম সিডার
  OTHER = 'OTHER',
}

export enum PricingBasis {
  PER_BIGHA = 'PER_BIGHA', // প্রতি বিঘা (1 Bigha ≈ 33 Decimals)
  PER_HOUR = 'PER_HOUR',   // প্রতি ঘণ্টা
  PER_DAY = 'PER_DAY',     // প্রতি দিন
}

export enum FuelOption {
  FUEL_INCLUDED = 'FUEL_INCLUDED', // জ্বালানি সহ
  FUEL_EXCLUDED = 'FUEL_EXCLUDED', // জ্বালানি ছাড়া / গ্রাহক সরবরাহ করবে
}

export enum OperatorOption {
  OPERATOR_INCLUDED = 'OPERATOR_INCLUDED', // চালক/অপারেটর সহ
  SELF_OPERATED = 'SELF_OPERATED',         // স্ব-চালিত / নিজস্ব চালক
}

export enum MachineryStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  BUSY = 'BUSY',
  INACTIVE = 'INACTIVE',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum MachineryPaymentStatus {
  ESCROW_HOLD = 'ESCROW_HOLD',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  PARTIAL_RELEASE = 'PARTIAL_RELEASE',
}

export enum InspectionType {
  PRE_DISPATCH = 'PRE_DISPATCH',
  POST_RETURN = 'POST_RETURN',
}
