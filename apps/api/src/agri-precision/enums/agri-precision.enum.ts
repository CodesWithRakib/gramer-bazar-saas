export enum InputCategory {
  FERTILIZER = 'FERTILIZER',               // রাসায়নিক ও জৈব সার (Urea, TSP, DAP, MOP, Gypsum)
  PESTICIDE = 'PESTICIDE',                 // কীটনাশক (Virtako, Voliam Flexi, Karate, Belt)
  FUNGICIDE = 'FUNGICIDE',                 // ছত্রাকনাশক (Amistar Top, Nativo, Ridomil Gold)
  HERBICIDE = 'HERBICIDE',                 // আগাছানাশক (Gramoxone, Roundup, Ronstar)
  CERTIFIED_SEED = 'CERTIFIED_SEED',       // বিএডিসি ও অনুমোদিত হাইব্রিড বীজ
  BIO_STIMULANT = 'BIO_STIMULANT',         // মাইক্রোনিউট্রিয়েন্ট ও ভিটামিন পিজিআর
}

export enum InputVerificationStatus {
  AUTHENTIC_CERTIFIED = 'AUTHENTIC_CERTIFIED',       // সরকারি ডিএই অনুমোদিত এবং প্রস্তুতকারক আসল বারকোড
  SUSPICIOUS_COUNTERFEIT = 'SUSPICIOUS_COUNTERFEIT', // নকল/ভেজাল রাসায়নিক সন্দেহ বা অবৈধ কোড
  EXPIRED = 'EXPIRED',                               // মেয়াদোত্তীর্ণ রাসায়নিক
  RECALLED = 'RECALLED',                             // প্রস্তুতকারক কর্তৃক প্রত্যাহারকৃত ব্যাচ
}

export enum DroneServiceType {
  INSECTICIDE_SPRAY = 'INSECTICIDE_SPRAY',                   // পোকা দমন স্প্রে
  FUNGICIDE_BLIGHT_SPRAY = 'FUNGICIDE_BLIGHT_SPRAY',         // আলুর লেট ব্লাইট ও ধান ব্লাস্ট দমন
  LIQUID_FERTILIZER_TOPDRESS = 'LIQUID_FERTILIZER_TOPDRESS', // তরল ইউরিয়া ও জিংক স্প্রে
  HERBICIDE_PRE_EMERGENCE = 'HERBICIDE_PRE_EMERGENCE',       // আগাছানাশক ছিটানো
}

export enum DroneBookingStatus {
  REQUESTED = 'REQUESTED',                   // কৃষক ড্রোন স্প্রে আবেদন করেছেন
  CONFIRMED_DISPATCH = 'CONFIRMED_DISPATCH', // পাইলট ও ড্রোন শিডিউল অনুমোদিত
  IN_FLIGHT_SPRAYING = 'IN_FLIGHT_SPRAYING', // জমিতে এরিয়াল স্প্রে চলমান
  COMPLETED = 'COMPLETED',                   // সফলভাবে সম্পন্ন ও পানির সাশ্রয় হিসাবকৃত
  CANCELLED = 'CANCELLED',
}

export enum SoilTextureType {
  CLAY_LOAM = 'CLAY_LOAM',           // এঁটেল দোআঁশ
  SANDY_LOAM = 'SANDY_LOAM',         // বেলে দোআঁশ
  SILTY_LOAM = 'SILTY_LOAM',         // পলি দোআঁশ
  PEAT_SOIL = 'PEAT_SOIL',           // পিট বা নিচু জলাভূমির মাটি
  COASTAL_SALINE = 'COASTAL_SALINE', // উপকূলীয় লবণাক্ত মাটি
}

export enum CropTargetNutrient {
  BORO_RICE = 'BORO_RICE',                   // বোরো ধান
  AMAN_RICE = 'AMAN_RICE',                   // আমন ধান
  POTATO = 'POTATO',                         // গোল আলু
  HYBRID_MAIZE = 'HYBRID_MAIZE',             // হাইব্রিড ভুট্টা
  MUSTARD = 'MUSTARD',                       // সরিষা
  WINTER_VEGETABLES = 'WINTER_VEGETABLES',   // শীতকালীন সবজি
  ONION_GARLIC = 'ONION_GARLIC',             // পেঁয়াজ ও রসুন
}
