export enum HerbalSpecies {
  KALOMEGH = 'KALOMEGH', // Andrographis paniculata (কালমেঘ)
  ASHWAGANDHA = 'ASHWAGANDHA', // Withania somnifera (অশ্বগন্ধা)
  TULSI_KRISHNA_RAMA = 'TULSI_KRISHNA_RAMA', // Ocimum sanctum (কৃষ্ণ ও রাম তুলসী)
  SHATAVARI = 'SHATAVARI', // Asparagus racemosus (শতমূলী)
  ALOE_VERA = 'ALOE_VERA', // Aloe barbadensis (ঘৃতকুমারী)
  VASAKA = 'VASAKA', // Justicia adhatoda (বাসক পাতা)
  AMLA = 'AMLA', // Phyllanthus emblica (আমলকী)
  HARITAKI = 'HARITAKI', // Terminalia chebula (হরিতকী)
  BAHERA = 'BAHERA', // Terminalia bellirica (বহেড়া)
  NEEM = 'NEEM', // Azadirachta indica (নিম পাতা ও ছাল)
  GULANCHA = 'GULANCHA', // Tinospora cordifolia (গুলঞ্চ)
}

export enum PlantPartUsed {
  WHOLE_HERB = 'WHOLE_HERB', // সমগ্র উদ্ভিদ
  LEAF_DRIED = 'LEAF_DRIED', // শুকনো পাতা
  ROOT_RHIZOME = 'ROOT_RHIZOME', // মূল ও কন্দ
  BARK_STEM = 'BARK_STEM', // বাকল ও কাণ্ড
  FRUIT_SEED = 'FRUIT_SEED', // ফল ও বীজ
  FLOWER = 'FLOWER', // ফুল
  GEL_EXTRACT = 'GEL_EXTRACT', // পাল্প বা নির্যাস
}

export enum ProcessingState {
  RAW_FRESH_HARVEST = 'RAW_FRESH_HARVEST', // তাজা কাঁচা ফসল
  SHADE_DRIED_WHOLE = 'SHADE_DRIED_WHOLE', // ছায়ায় শুকানো গোটা ভেষজ
  SOLAR_DEHYDRATED_CHOPPED = 'SOLAR_DEHYDRATED_CHOPPED', // সৌর ড্রায়ারে শুকনো কুচি
  FINE_PULVERIZED_POWDER = 'FINE_PULVERIZED_POWDER', // সূক্ষ্ম চূর্ণ পাউডার
  STANDARDIZED_EXTRACT = 'STANDARDIZED_EXTRACT', // প্রমিত নির্যাস
}

export enum GACPStandardGrade {
  PHARMA_GRADE_A = 'PHARMA_GRADE_A', // আর্দ্রতা < ১০%, এএফএল০, ফার্মাকোপিয়া এ-গ্রেড
  COMMERCIAL_GRADE_B = 'COMMERCIAL_GRADE_B', // আর্দ্রতা ১০-১২%, বাণিজ্যিক ভেষজ
  RAW_UNSORTED_C = 'RAW_UNSORTED_C', // অপরিশোধিত প্রাথমিক ফসল
}

export enum LabCertificateStatus {
  TESTED_COMPLIANT_DGDA = 'TESTED_COMPLIANT_DGDA', // ডিজিডিএ ও ল্যাব সনদপ্রাপ্ত
  TESTING_PENDING = 'TESTING_PENDING', // পরীক্ষাগারে অপেক্ষমাণ
  REJECTED_EXCESS_MOISTURE_OR_MOLD = 'REJECTED_EXCESS_MOISTURE_OR_MOLD', // অতিরিক্ত আর্দ্রতা বা ফাঙ্গাস শনাক্ত
}

export enum SourcingContractStatus {
  CONTRACT_ACTIVE = 'CONTRACT_ACTIVE', // সক্রিয় চুক্তি
  INSPECTION_PENDING = 'INSPECTION_PENDING', // মান যাচাইয়ের অপেক্ষায়
  FULFILLED_ACCEPTED = 'FULFILLED_ACCEPTED', // গৃহীত ও সম্পন্ন
  REJECTED_NON_COMPLIANT = 'REJECTED_NON_COMPLIANT', // মানহীন বিধায় প্রত্যাখ্যাত
  CANCELLED = 'CANCELLED', // বাতিলকৃত
}
