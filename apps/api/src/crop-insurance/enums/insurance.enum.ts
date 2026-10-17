export enum CropType {
  BORO_PADDY = 'BORO_PADDY',       // বোরো ধান
  AMAN_PADDY = 'AMAN_PADDY',       // আমন ধান
  POTATO = 'POTATO',               // গোল আলু
  ONION = 'ONION',                 // পেঁয়াজ
  JUTE = 'JUTE',                   // পাট
  MUSTARD = 'MUSTARD',             // সরিষা
  WATERMELON = 'WATERMELON',       // তরমুজ
  MAIZE = 'MAIZE',                 // ভুট্টা
  VEGETABLES = 'VEGETABLES',       // শাকসবজি
}

export enum AgriSeason {
  KHARIF_1 = 'KHARIF_1', // খরিপ-১ (গ্রীষ্মকালীন: আউশ, পাট, তিল)
  KHARIF_2 = 'KHARIF_2', // খরিপ-২ (বর্ষাকালীন: রোপা আমন)
  RABI = 'RABI',         // রবি (শীতকালীন: বোরো, আলু, গম, সরিষা, ভুট্টা)
}

export enum ParametricTriggerType {
  FLASH_FLOOD = 'FLASH_FLOOD',                 // হাওর বা নদী অববাহিকায় আকস্মিক বন্যা (নদী পানির স্তর বিপদসীমা অতিক্রম)
  EXCESS_RAINFALL = 'EXCESS_RAINFALL',         // ৩ দিনে অতিবৃষ্টি ও দীর্ঘস্থায়ী জলাবদ্ধতা (>১৫০ মিমি)
  CYCLONE_WIND = 'CYCLONE_WIND',               // উপকূলীয় ঘূর্ণিঝড় ও জলোচ্ছ্বাস (বাতাস > ৬৫ কিমি/ঘণ্টা)
  PROLONGED_DROUGHT = 'PROLONGED_DROUGHT',     // খরা ও বৃষ্টিহীনতা (একটানা ২১ দিন বৃষ্টিহীন)
  UNSEASONAL_HAILSTORM = 'UNSEASONAL_HAILSTORM', // অকাল শিলাবৃষ্টি
  HEATWAVE = 'HEATWAVE',                       // তীব্র তাপদাহ ও পরাগায়ন সংকট (> ৩৬° সেলসিয়াস)
}

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  CLAIM_IN_REVIEW = 'CLAIM_IN_REVIEW',
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_PAID = 'CLAIM_PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum ClaimDisasterSeverity {
  PARTIAL_LOW = 'PARTIAL_LOW',       // ২৫% ক্ষতিপূরণ
  PARTIAL_MEDIUM = 'PARTIAL_MEDIUM', // ৫০% ক্ষতিপূরণ
  SEVERE_HIGH = 'SEVERE_HIGH',       // ৭৫% ক্ষতিপূরণ
  TOTAL_LOSS = 'TOTAL_LOSS',         // ১০০% সম্পূর্ণ ক্ষতিপূরণ
}

export enum ClaimPayoutMethod {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
}
