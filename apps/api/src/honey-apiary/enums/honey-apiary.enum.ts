export enum HoneyFloralSource {
  SUNDARBANS_KHALISHA_WILD = 'SUNDARBANS_KHALISHA_WILD', // সুন্দরবনের খলিশা ফুল মধু (সবচেয়ে মূল্যবান ও হালকা সুগন্ধি)
  SUNDARBANS_GORAN_GEWA = 'SUNDARBANS_GORAN_GEWA', // সুন্দরবনের গরান ও গেওয়া বুনো মধু
  MUSTARD_BLOSSOM_CREAM = 'MUSTARD_BLOSSOM_CREAM', // সরিষা ফুল ক্রিম মধু (প্রাকৃতিক সাদা ক্রিস্টালাইজড)
  LITCHI_ORCHARD_BLOSSOM = 'LITCHI_ORCHARD_BLOSSOM', // দিনাজপুর ও পাবনার লিচু বাগানের সুমিষ্ট মধু
  BLACK_CUMIN_KALOJEERA = 'BLACK_CUMIN_KALOJEERA', // কালোজিরা ফুলের গাঢ় ঔষধি অ্যান্টিঅক্সিডেন্ট মধু
  CORIANDER_BLOSSOM = 'CORIANDER_BLOSSOM', // ধনে ফুলের হালকা সোনালী ভেষজ মধু
}

export enum HoneyHarvestType {
  WILD_FOREST_MOUWAL_HARVEST = 'WILD_FOREST_MOUWAL_HARVEST', // সুন্দরবনের ঐতিহ্যবাহী মৌয়ালদের চাক কাটা মধু
  MIGRATORY_BOX_APIARY = 'MIGRATORY_BOX_APIARY', // ভ্রাম্যমাণ কাঠের মৌ-বাক্স খামার
  HOMESTEAD_TRADITIONAL_APIARY = 'HOMESTEAD_TRADITIONAL_APIARY', // বসতবাড়ির বাগানের মৌমাছি পালন
}

export enum PurityLabGrade {
  GRADE_A_RAW_UNPROCESSED = 'GRADE_A_RAW_UNPROCESSED', // অপরিশোধিত কাঁচা মধু (আর্দ্রতা < ১৮.৫%, C4 নেগেটিভ, HMF < ২০ mg/kg)
  GRADE_B_DOMESTIC_STANDARD = 'GRADE_B_DOMESTIC_STANDARD', // জাতীয় মানদণ্ড (আর্দ্রতা ১৮.৬-২০%, C4 নেগেটিভ, HMF < ৪০ mg/kg)
  SUBSTANDARD_HIGH_MOISTURE = 'SUBSTANDARD_HIGH_MOISTURE', // উচ্চ আর্দ্রতা (> ২১%), প্রাকৃতিকভাবে গাঁজন/ফেনাযুক্ত হওয়ার ঝুঁকি
  ADULTERATED_HFCS_OR_C4_POSITIVE = 'ADULTERATED_HFCS_OR_C4_POSITIVE', // ভেজাল: হাই-ফ্রুক্টোজ কর্ন সিরাপ বা চিনি মিশ্রিত
}

export enum BeeSpecies {
  APIS_DORSATA = 'APIS_DORSATA', // বুনো পাহাড়ি ও সুন্দরবনের বড় মৌমাছি
  APIS_CERANA = 'APIS_CERANA', // দেশি খুদে শান্ত মৌমাছি
  APIS_MELLIFERA = 'APIS_MELLIFERA', // উন্নত ইউরোপীয় কাঠের বাক্স মৌমাছি
  APIS_FLOREA = 'APIS_FLOREA', // ক্ষুদ্র ডুমুর মৌমাছি
}

export enum SuperfoodProductType {
  RAW_FILTERED_HONEY = 'RAW_FILTERED_HONEY', // কাঁচা ছাঁকা মধু
  COMB_HONEY_IN_FRAME = 'COMB_HONEY_IN_FRAME', // ফ্রেমসহ প্রাকৃতিক চাকের মধু
  FRESH_FROZEN_ROYAL_JELLY = 'FRESH_FROZEN_ROYAL_JELLY', // তাজা ফ্রোজেন রয়্যাল জেলি (-১৮°C)
  BEE_PROPOLIS_RESIN = 'BEE_PROPOLIS_RESIN', // অ্যান্টিমাইক্রোবিয়াল প্রোপোলিস মৌ-আঠা
  RAW_BEE_POLLEN_GRANULES = 'RAW_BEE_POLLEN_GRANULES', // সুপারফুড মৌ-পরাগ রেনু
  BEE_VENOM_EXTRACT = 'BEE_VENOM_EXTRACT', // ফার্মাসিউটিক্যাল মৌ-বিষ নির্যাস
}

export enum ApiaryBoxHealthStatus {
  HEALTHY_BROOD_ACTIVE = 'HEALTHY_BROOD_ACTIVE', // সুস্থ কলোনি, সক্রিয় ডিম ও পরাগায়ন
  HONEY_SUPER_FULL_READY_TO_EXTRACT = 'HONEY_SUPER_FULL_READY_TO_EXTRACT', // মৌ-চাক মধুপূর্ণ, আহরণের জন্য প্রস্তুত
  VARROA_MITE_INFESTATION_ALERT = 'VARROA_MITE_INFESTATION_ALERT', // ভারোয়া মাইট পরজীবী আক্রমণ সতর্কতা
  MIGRATION_TRANSIT = 'MIGRATION_TRANSIT', // মৌসুমী ফুলে পরিবহণ চলমান
}
