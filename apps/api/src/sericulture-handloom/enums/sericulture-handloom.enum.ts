export enum SericultureCraftType {
  RAJSHAHI_MULBERRY_SILK = 'RAJSHAHI_MULBERRY_SILK', // রাজশাহী রেশম সিল্ক
  ENDI_ERI_SILK = 'ENDI_ERI_SILK', // এন্ডি / এরি অহিংসা সিল্ক
  TUKRA_MATKA_SILK = 'TUKRA_MATKA_SILK', // মটকা সিল্ক
  NARAYANGANJ_DHAKAI_JAMDANI = 'NARAYANGANJ_DHAKAI_JAMDANI', // ঐতিহ্যবাহী ঢাকাই জামদানি
  TANGAIL_HANDLOOM_TAANT = 'TANGAIL_HANDLOOM_TAANT', // টাঙ্গাইল তাঁত শাড়ি
  MIRPUR_BANARASI_KATAN = 'MIRPUR_BANARASI_KATAN', // মিরপুর বেনারসি / কাতান
  HILL_TRACTS_CHAKMA_PINON_HADI = 'HILL_TRACTS_CHAKMA_PINON_HADI', // পাহাড়ি কোমর তাঁত (পিনন হাদি / থামি)
  KHADI_HANDSPUN_COTTON = 'KHADI_HANDSPUN_COTTON', // কুমিল্লা খাঁটি খাদি কাপড়
}

export enum SilkGrade {
  GRADE_A_PREMIUM_EXPORT = 'GRADE_A_PREMIUM_EXPORT', // ফিল্টারিং গ্রেড এ - এক্সপোর্ট কোয়ালিটি
  GRADE_B_DOMESTIC_STANDARD = 'GRADE_B_DOMESTIC_STANDARD', // ঘরোয়া স্ট্যান্ডার্ড গ্রেড বি
  GRADE_C_COMMERCIAL_BLENDED = 'GRADE_C_COMMERCIAL_BLENDED', // বাণিজ্যিক গ্রেড সি
}

export enum YarnMaterial {
  PURE_MULBERRY_SILK_100 = 'PURE_MULBERRY_SILK_100', // ১০০% খাঁটি মালবেরি রেশম
  PURE_ENDI_SILK_100 = 'PURE_ENDI_SILK_100', // ১০০% খাঁটি এন্ডি সিল্ক
  GASSED_MERCERIZED_COTTON = 'GASSED_MERCERIZED_COTTON', // মার্সারাইজড তুলা
  FINE_KHADI_COTTON_COUNT_100 = 'FINE_KHADI_COTTON_COUNT_100', // ১০০ কাউন্ট খাদি সুতা
  SILK_COTTON_BLEND = 'SILK_COTTON_BLEND', // রেশম-তুলা মিশ্রিত সুতা
  ZARI_METALLIC_THREAD = 'ZARI_METALLIC_THREAD', // খাঁটি রূপালী/সোনালী জরি
}

export enum AuthenticityStatus {
  BSDB_BHB_CERTIFIED = 'BSDB_BHB_CERTIFIED', // বাংলাদেশ রেশম ও তাঁত বোর্ড প্রত্যয়িত
  GI_REGISTERED_ORIGIN = 'GI_REGISTERED_ORIGIN', // জিআই সনদপ্রাপ্ত ভৌগোলিক উৎস
  ARTISAN_SELF_DECLARED = 'ARTISAN_SELF_DECLARED', // তাঁতি স্বঘোষিত মান
  LAB_BURN_TEST_VERIFIED = 'LAB_BURN_TEST_VERIFIED', // ল্যাব বার্ন-টেস্ট প্রমাণিত খাঁটি সিল্ক
}

export enum WeavingLoomType {
  TRADITIONAL_PIT_LOOM = 'TRADITIONAL_PIT_LOOM', // ঐতিহ্যবাহী গর্ত তাঁত (পিট লুম)
  FLY_SHUTTLE_FRAME_LOOM = 'FLY_SHUTTLE_FRAME_LOOM', // ফ্লাই শাটল ফ্রেম লুম
  INDIGENOUS_BACKSTRAP_LOOM = 'INDIGENOUS_BACKSTRAP_LOOM', // পাহাড়ি কোমর তাঁত (ব্যাকস্ট্র্যাপ লুম)
  SEMI_AUTOMATIC_PEDAL_LOOM = 'SEMI_AUTOMATIC_PEDAL_LOOM', // সেমি-অটোমেটিক প্যাডেল তাঁত
}

export enum ArtisanOrderEscrowStatus {
  ORDER_PLACED_ESCROW_LOCKED = 'ORDER_PLACED_ESCROW_LOCKED', // অর্ডার গৃহীত ও ৫০% এসক্রো জমা
  WARPING_LOOM_MOUNTED = 'WARPING_LOOM_MOUNTED', // টানা-পোড়েন তাঁতে সংযুক্ত
  IN_WEAVING_PROGRESS = 'IN_WEAVING_PROGRESS', // বুনন চলমান
  FINISHED_BOARD_INSPECTED = 'FINISHED_BOARD_INSPECTED', // বুনন সম্পন্ন ও বোর্ড পরিদর্শন
  DISPATCHED_TO_BUYER = 'DISPATCHED_TO_BUYER', // ক্রেতার উদ্দেশ্যে প্রেরিত
  ESCROW_RELEASED_TO_WEAVER = 'ESCROW_RELEASED_TO_WEAVER', // তাঁতির অনুকূলে এসক্রো খালাস
  DISPUTED_NON_COMPLIANT = 'DISPUTED_NON_COMPLIANT', // ত্রুটিপূর্ণ কাপড় ও বিরোধ
}

export enum CocoonType {
  BIVOLTINE = 'BIVOLTINE', // বাইভোল্টিন (উন্নত রেশম গুটি)
  MULTIVOLTINE = 'MULTIVOLTINE', // মাল্টিভোল্টিন (ঐতিহ্যবাহী দেশি গুটি)
}
