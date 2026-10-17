export enum SweetmeatType {
  BOGURA_SPECIAL_CURD_DOI = 'BOGURA_SPECIAL_CURD_DOI',             // বগুড়ার স্পেশাল ক্ষীরসা ও লাল দই (GI Registered)
  NATORE_AUTHENTIC_KACHAGOLLA = 'NATORE_AUTHENTIC_KACHAGOLLA',     // নাটোরের খাঁটি কাঁচাগোল্লা (GI Registered)
  PORABARI_CHAMCHAM = 'PORABARI_CHAMCHAM',                         // টাঙ্গাইল পোড়াবাড়ীর পোড়া চমচম (GI Registered)
  COMILLA_RASMALAI_MATRI_BHANDAR = 'COMILLA_RASMALAI_MATRI_BHANDAR', // কুমিল্লার ঐতিহ্যবাহী রসমালাই
  NETROKONA_BALISH_MISTI = 'NETROKONA_BALISH_MISTI',               // নেত্রকোণার বিখ্যাত বালিশ মিষ্টি
  PURE_COW_MILK_CHHANA = 'PURE_COW_MILK_CHHANA',                   // মিষ্টি তৈরির শতভাগ খাঁটি ছানা
  TRADITIONAL_GAWA_GHEE = 'TRADITIONAL_GAWA_GHEE',                 // খাঁটি দানাদার গাওয়া ঘি
}

export enum SweetmeatRegion {
  BOGURA_SADAR = 'BOGURA_SADAR',                   // বগুড়া শেরপুর ও সদর দই বেল্ট
  NATORE_SADAR = 'NATORE_SADAR',                   // নাটোর লালবাজার কাঁচাগোল্লা হাব
  TANGAIL_PORABARI = 'TANGAIL_PORABARI',           // টাঙ্গাইল পোড়াবাড়ী চমচম ঘাট
  COMILLA_MANOHARPUR = 'COMILLA_MANOHARPUR',       // কুমিল্লা মনোহরপুর রসমালাই
  NETROKONA_SADAR = 'NETROKONA_SADAR',             // নেত্রকোণা বালিশ মিষ্টি পল্লি
  PABNA_SANTHIA = 'PABNA_SANTHIA',                 // পাবনা সাঁথিয়া দুগ্ধ ও ছানা অঞ্চল
  SIRAJGANJ_BELKUCHI = 'SIRAJGANJ_BELKUCHI',       // সিরাজগঞ্জ বেলকুচি খাঁটি গাওয়া ঘি
}

export enum MilkSourceType {
  INDIGENOUS_COW_DESHI = 'INDIGENOUS_COW_DESHI',   // দেশি গাভীর কাঁচা দুধ (High Fat & Carotene)
  CROSSBRED_DAIRY_COW = 'CROSSBRED_DAIRY_COW',     // উন্নত ডেইরি গাভীর দুধ
  RIVERINE_BUFFALO_MILK = 'RIVERINE_BUFFALO_MILK', // মহিষের দুধ (দই ও ক্ষীরসার জন্য ঘন দুধ)
}

export enum ChhanaCoagulantType {
  NATURAL_WHEY_CULTURE = 'NATURAL_WHEY_CULTURE',   // প্রাকৃতিক ছানার টক জল
  FOOD_GRADE_CITRIC_ACID = 'FOOD_GRADE_CITRIC_ACID', // ফুড-গ্রেড সাইট্রিক অ্যাসিড দ্রবণ
  YOGURT_WHEY_FERMENT = 'YOGURT_WHEY_FERMENT',     // পুরনো দইয়ের ছাঁচ
}

export enum StarchAdulterationTest {
  NEGATIVE_ZERO_TOLERANCE_PASS = 'NEGATIVE_ZERO_TOLERANCE_PASS', // আয়োডিন পরীক্ষায় স্টার্চ/ময়দা মুক্ত - নিরাপদ
  POSITIVE_STARCH_DETECTED_SEIZED = 'POSITIVE_STARCH_DETECTED_SEIZED', // বিষাক্ত ময়দা/অ্যারারুট ভেজাল শনাক্ত - বাজেয়াপ্তি আদেশ
}

export enum SweetmeatPurityGrade {
  GRADE_AAA_GI_CERTIFIED_HERITAGE = 'GRADE_AAA_GI_CERTIFIED_HERITAGE', // জিআই সনদপ্রাপ্ত প্রিমিয়াম হেরিটেজ মিষ্টি
  GRADE_A_PURE_ARTISANAL = 'GRADE_A_PURE_ARTISANAL',                   // খাঁটি প্রাকৃতিক মিষ্টি
  COMMERCIAL_STANDARD = 'COMMERCIAL_STANDARD',                         // বাণিজ্যিক গ্রেড
  REJECTED_ADULTERATED = 'REJECTED_ADULTERATED',                       // ভেজাল মিশ্রিত বাতিল
}

export enum SweetmeatPackagingType {
  POROUS_CLAY_SRA_500G = 'POROUS_CLAY_SRA_500G',           // ঐতিহ্যবাহী মাটির সরা (৫০০ গ্রাম)
  POROUS_CLAY_SRA_1KG = 'POROUS_CLAY_SRA_1KG',             // ঐতিহ্যবাহী মাটির সরা (১ কেজি)
  HERMETIC_SWEET_BOX_1KG = 'HERMETIC_SWEET_BOX_1KG',       // ফুড-গ্রেড মিষ্টি বক্স (১ কেজি)
  FOOD_GRADE_TIN_CAN_2KG = 'FOOD_GRADE_TIN_CAN_2KG',       // টিন ক্যান (২ কেজি)
  GLASS_JAR_GAWA_GHEE_500G = 'GLASS_JAR_GAWA_GHEE_500G',   // কাঁচের জার (৫০০ গ্রাম)
  INSULATED_COLD_BOX_5KG = 'INSULATED_COLD_BOX_5KG',       // আইস-প্যাক যুক্ত কোল্ড বক্স (৫ কেজি)
}

export enum SweetmeatLotStatus {
  AVAILABLE_FOR_SALE = 'AVAILABLE_FOR_SALE',
  RESERVED_CONTRACT = 'RESERVED_CONTRACT',
  SOLD_OUT = 'SOLD_OUT',
}
