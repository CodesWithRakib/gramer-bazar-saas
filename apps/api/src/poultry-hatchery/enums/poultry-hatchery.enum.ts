export enum PoultryBreedType {
  SONALI_CLASSIC = 'SONALI_CLASSIC', // সোনালী মুরগি (ফাউমি ও আরআইআর ক্রস, দেশি স্বাদের জনপ্রিয় জাত)
  BROILER_COBB_500 = 'BROILER_COBB_500', // কব্ব ৫০০ ব্রয়লার মাংসের মুরগি (উচ্চ বৃদ্ধির হার)
  LAYER_HY_LINE_BROWN = 'LAYER_HY_LINE_BROWN', // হাই-লাইন ব্রাউন লেয়ার বাণিজ্যিক ডিমের মুরগি
  HAOR_BELGIAN_DUCK = 'HAOR_BELGIAN_DUCK', // হাওর অঞ্চলের খাকি ক্যাম্পবেল ও বেলজিয়ান হাঁস
  DESHI_ASEEL_ORGANIC = 'DESHI_ASEEL_ORGANIC', // অর্গানিক দেশি ও খাঁটি আসিল মোরগ-মুরগি
}

export enum HatcheryFlockStage {
  DAY_OLD_CHICK_DOC = 'DAY_OLD_CHICK_DOC', // একদিনের বাচ্চা (DOC - ডে ওল্ড চিক)
  BROODER_GROWER_STAGE = 'BROODER_GROWER_STAGE', // ব্রুডিং ও বাড়ন্ত পর্যায় (১-৪ সপ্তাহ)
  FINISHER_READY_FOR_MARKET = 'FINISHER_READY_FOR_MARKET', // বাজারজাতকরণের উপযুক্ত পূর্ণাঙ্গ মুরগি
  PEAK_LAYING_CYCLE = 'PEAK_LAYING_CYCLE', // সর্বোচ্চ ডিম পাড়ার চক্র (২৪-৬০ সপ্তাহ)
}

export enum EggQualityGrade {
  GRADE_AA_JUMBO_OVER_65G = 'GRADE_AA_JUMBO_OVER_65G', // গ্রেড এএ জাম্বো ডিম (৬৫ গ্রামের বেশি)
  GRADE_A_LARGE_58_64G = 'GRADE_A_LARGE_58_64G', // গ্রেড এ লার্জ ডিম (৫৮ - ৬৪ গ্রাম)
  GRADE_B_MEDIUM_50_57G = 'GRADE_B_MEDIUM_50_57G', // গ্রেড বি মিডিয়াম ডিম (৫০ - ৫৭ গ্রাম)
  GRADE_C_PULLET_UNDER_50G = 'GRADE_C_PULLET_UNDER_50G', // ছোট পুলেট ডিম (৫০ গ্রামের নিচে)
  REJECTED_CRACKED_OR_SOILED = 'REJECTED_CRACKED_OR_SOILED', // বাতিল: ফাটা বা ময়লাযুক্ত ডিম
}

export enum VaccinationStatus {
  MAREKS_DAY_1_CERTIFIED = 'MAREKS_DAY_1_CERTIFIED', // হ্যাচারিতে ডে-১ মারেক্স টিকা সম্পন্ন
  RANIKHET_NEWCASTLE_RDV_COMPLETED = 'RANIKHET_NEWCASTLE_RDV_COMPLETED', // রানীক্ষেত (Newcastle / RDV) টিকা সম্পন্ন
  GUMBORO_IBD_BOOSTER_DONE = 'GUMBORO_IBD_BOOSTER_DONE', // গামবোরো (IBD) বুস্টার টিকা সম্পন্ন
  FOWL_CHOLERA_POX_PENDING = 'FOWL_CHOLERA_POX_PENDING', // ফাউল পক্স ও কলেরা টিকা অপেক্ষমাণ
}

export enum BrooderShedAlarmStatus {
  OPTIMAL_BROODING_ENVIRONMENT = 'OPTIMAL_BROODING_ENVIRONMENT', // আদর্শ ব্রুডিং পরিবেশ (৩২-৩৫°C, অ্যামোনিয়া < ১৫ ppm)
  TEMPERATURE_COLD_CHILLING_ALERT = 'TEMPERATURE_COLD_CHILLING_ALERT', // শীতল তাপমাত্রা সতর্কতা (T < ৩০°C, ব্রুডার হিটার প্রয়োজন)
  AMMONIA_TOXIC_SPIKE_ALERT = 'AMMONIA_TOXIC_SPIKE_ALERT', // বিষাক্ত অ্যামোনিয়া গ্যাস স্পাইক (NH3 > ২৫ ppm, এগজস্ট ফ্যান চালু প্রয়োজন)
  HIGH_HEAT_STRESS_ALERT = 'HIGH_HEAT_STRESS_ALERT', // অতিরিক্ত তাপ স্ট্রেস (T > ৩৬°C, কুলিং প্যাড চালু প্রয়োজন)
}
