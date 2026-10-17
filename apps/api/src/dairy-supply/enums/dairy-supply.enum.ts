export enum MilkType {
  COW_MILK = 'COW_MILK', // গাভীর খাঁটি দুধ
  BUFFALO_MILK = 'BUFFALO_MILK', // মহিষের দুধ (উচ্চ ফ্যাট)
  GOAT_MILK = 'GOAT_MILK', // ছাগলের দুধ
}

export enum MilkShift {
  MORNING_SHIFT = 'MORNING_SHIFT', // সকালের দোহন
  EVENING_SHIFT = 'EVENING_SHIFT', // সন্ধ্যার দোহন
}

export enum MilkQualityGrade {
  GRADE_A_PREMIUM_CHILLED = 'GRADE_A_PREMIUM_CHILLED', // ফ্যাট >= ৪.৫%, এসএনএফ >= ৮.৫%, MBRT >= ৪ ঘণ্টা
  GRADE_B_STANDARD = 'GRADE_B_STANDARD', // ফ্যাট ৩.৫% - ৪.৪%, এসএনএফ ৮.০% - ৮.৪%, MBRT ২-৪ ঘণ্টা
  GRADE_C_SUBSTANDARD = 'GRADE_C_SUBSTANDARD', // ফ্যাট < ৩.৫%, ল্যাকটোমিটার পানি মিশ্রিত
  REJECTED_CURDLED_OR_ADULTERATED = 'REJECTED_CURDLED_OR_ADULTERATED', // ফেটে যাওয়া দুধ, ইউরিয়া বা স্টার্চ ভেজাল
}

export enum ChillingVatStatus {
  OPTIMAL_CHILLED_4C = 'OPTIMAL_CHILLED_4C', // আদর্শ ৪ ডিগ্রি সেলসিয়াস তাপমাত্রায় সংরক্ষিত
  COOLING_IN_PROGRESS = 'COOLING_IN_PROGRESS', // চিলিং চলমান
  TEMPERATURE_ALARM_HIGH = 'TEMPERATURE_ALARM_HIGH', // সতর্কতা: তাপমাত্রা ৭ ডিগ্রি সেলসিয়াসের বেশি
  EMPTY_CLEANING_CIP = 'EMPTY_CLEANING_CIP', // সিআইপি অটোমেটিক ওয়াশিং চলমান
}

export enum FeedCategory {
  MUSTARD_OIL_CAKE = 'MUSTARD_OIL_CAKE', // সরিষার খৈল (উচ্চ প্রোটিন)
  WHEAT_BRAN_COARSE = 'WHEAT_BRAN_COARSE', // মোটা গমের ভুষি
  CORN_SILAGE_FERMENTED = 'CORN_SILAGE_FERMENTED', // ফার্মেন্টেড ভুট্টার সবুজ সাইলেজ
  PELLETTED_DAIRY_FEED = 'PELLETTED_DAIRY_FEED', // ব্যালেন্সড ডেইরি ফিড প্যালেট
  CALCIUM_MINERAL_PREMIX = 'CALCIUM_MINERAL_PREMIX', // ক্যালসিয়াম ও মিনারেল প্রিমিক্স
}

export enum PaymentSettlementStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING', // পেমেন্ট বকেয়া
  DISBURSED_MFS_WALLET = 'DISBURSED_MFS_WALLET', // বিকাশ/নগদে সরাসরি পরিশোধিত
  ADJUSTED_FEED_PURCHASE = 'ADJUSTED_FEED_PURCHASE', // পশুখাদ্য ক্রয় সমন্বয়
}
