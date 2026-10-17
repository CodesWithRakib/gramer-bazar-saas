export enum GurType {
  DATE_PALM_NOLEN_JHOLA = 'DATE_PALM_NOLEN_JHOLA',       // নলেন ঝোল গুড় (তরল সুগন্ধি খেজুর গুড়)
  DATE_PALM_PATALI_SOLID = 'DATE_PALM_PATALI_SOLID',     // পাটালি গুড় (শক্ত চাকতি)
  DATE_PALM_DANADAR = 'DATE_PALM_DANADAR',               // দানাদার গুড় (স্বাভাবিক স্ফটিক দানা)
  SUGARCANE_ORGANIC_SOLID = 'SUGARCANE_ORGANIC_SOLID',   // দেশি আখের লাল গুড়
  SUGARCANE_CRUMBLED_POWDER = 'SUGARCANE_CRUMBLED_POWDER', // আখের গুঁড়া গুড়
  MOLASSES_CHITA_ORGANIC = 'MOLASSES_CHITA_ORGANIC',     // জৈব চিটা গুড় (গবাদি পশুর খাদ্য ও কম্পোস্ট)
}

export enum GurRegion {
  JASHORE_KOTWALI = 'JASHORE_KOTWALI',         // যশোরের ঐতিহ্যবাহী খেজুর গুড় (GI Registered)
  JASHORE_JHIKARGACHA = 'JASHORE_JHIKARGACHA', // ঝিকরগাছা নলেন গুড় হাব
  CHUADANGA_DAMURHUDA = 'CHUADANGA_DAMURHUDA', // চুয়াডাঙ্গা দামুড়হুদা খেজুর রস অঞ্চল
  KUSHTIA_KUMARKHALI = 'KUSHTIA_KUMARKHALI',   // কুষ্টিয়া কুমারখালী আখের গুড়
  FARIDPUR_SADAR = 'FARIDPUR_SADAR',           // ফরিদপুর বাউশল গুড়
  NATORE_LALPUR = 'NATORE_LALPUR',             // নাটোর লালপুর আখ ও খেজুর গুড়
  RAJSHAHI_BAGHA = 'RAJSHAHI_BAGHA',           // রাজশাহী বাঘা গুড় বেল্ট
}

export enum SapCollectionShift {
  DAWN_JIRAN_PREMIUM = 'DAWN_JIRAN_PREMIUM',   // ভোরের জিরান রস (সূর্যোদয়ের আগের সর্বোচ্চ মিষ্টি ও সুগন্ধি রস)
  DAY_DAULA_STANDARD = 'DAY_DAULA_STANDARD',   // দুপুরের ডাউলা রস (মাঝারি মিষ্টতা)
  EVENING_SWEET_INTAKE = 'EVENING_SWEET_INTAKE', // সন্ধ্যার মিষ্টি রস
}

export enum BoilingPanType {
  TRADITIONAL_IRON_KARAI = 'TRADITIONAL_IRON_KARAI',     // দেশি লোহার কড়াই / তাওয়া
  STAINLESS_STEEL_PAN = 'STAINLESS_STEEL_PAN',           // ফুড-গ্রেড স্টেইনলেস স্টিল প্যান
  EARTHEN_PIT_FURNACE = 'EARTHEN_PIT_FURNACE',           // ঐতিহ্যবাহী মাটির চুলা ও পাতিল
}

export enum HydrosulfiteTestResult {
  NEGATIVE_ZERO_TOLERANCE_PASS = 'NEGATIVE_ZERO_TOLERANCE_PASS', // হাইড্রোজমুক্ত (০.০ পিপিএম) - নিরাপদ
  POSITIVE_CONTAMINATED_SEIZED = 'POSITIVE_CONTAMINATED_SEIZED', // বিষাক্ত হাইড্রোজযুক্ত - বাজেয়াপ্তি আদেশ
}

export enum SugarSyrupAdulterationStatus {
  GENUINE_PURE_SAP = 'GENUINE_PURE_SAP',                           // শতভাগ খাঁটি রসের গুড়
  SUSPECTED_SUGAR_SYRUP_DILUTED = 'SUSPECTED_SUGAR_SYRUP_DILUTED', // চিনির শিরা মেশানো (সন্দেহভাজন)
  HIGH_SUGAR_ADULTERATED = 'HIGH_SUGAR_ADULTERATED',               // কৃত্রিম চিনি ও রং মিশ্রিত ভেজাল
}

export enum GurPurityGrade {
  GRADE_AAA_GI_CERTIFIED_HERITAGE = 'GRADE_AAA_GI_CERTIFIED_HERITAGE', // জিআই সনদপ্রাপ্ত প্রিমিয়াম হেরিটেজ গুড়
  GRADE_A_PURE_ARTISANAL = 'GRADE_A_PURE_ARTISANAL',                   // খাঁটি প্রাকৃতিক গুড়
  COMMERCIAL_STANDARD = 'COMMERCIAL_STANDARD',                         // বাণিজ্যিক গ্রেড
  REJECTED_ADULTERATED = 'REJECTED_ADULTERATED',                       // ভেজাল / ক্ষতিকর রাসায়নিক যুক্ত বাতিল
}

export enum GurPackagingType {
  TRADITIONAL_EARTHEN_POT_1KG = 'TRADITIONAL_EARTHEN_POT_1KG', // মাটির হাঁড়ি (১ কেজি)
  FOOD_GRADE_GLASS_JAR_500G = 'FOOD_GRADE_GLASS_JAR_500G',     // ফুড-গ্রেড কাঁচের জার (৫০০ গ্রাম)
  FOOD_GRADE_GLASS_JAR_1KG = 'FOOD_GRADE_GLASS_JAR_1KG',       // ফুড-গ্রেড কাঁচের জার (১ কেজি)
  BAMBOO_LEAF_PATALI_BLOCK_2KG = 'BAMBOO_LEAF_PATALI_BLOCK_2KG', // খেজুর পাতা মোড়ানো পাটালি (২ কেজি)
  BULK_FOOD_TIN_10KG = 'BULK_FOOD_TIN_10KG',                   // টিন ক্যান (১০ কেজি)
}

export enum GurLotStatus {
  AVAILABLE_FOR_SALE = 'AVAILABLE_FOR_SALE',
  RESERVED_CONTRACT = 'RESERVED_CONTRACT',
  SOLD_OUT = 'SOLD_OUT',
}
