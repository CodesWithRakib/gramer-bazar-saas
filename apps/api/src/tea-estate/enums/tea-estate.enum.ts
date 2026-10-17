export enum TeaGardenRegion {
  SYLHET_SURMA_VALLEY = 'SYLHET_SURMA_VALLEY', // High elevation slope gardens, classic orthodox & brisk black tea
  SREEMANGAL_MOULVIBAZAR = 'SREEMANGAL_MOULVIBAZAR', // The Tea Capital of Bangladesh, Balisera Valley
  HABIGANJ_LASKARPORE_VALLEY = 'HABIGANJ_LASKARPORE_VALLEY', // High-yield commercial CTC tea estates
  CHITTAGONG_HALDA_VALLEY = 'CHITTAGONG_HALDA_VALLEY', // Historic coastal tea gardens
  PANCHAGARH_TERAI_FLATLAND = 'PANCHAGARH_TERAI_FLATLAND', // Modern smallholder planar tea, high polyphenols, organic gardens
  THAKURGAON_TERAI_FLATLAND = 'THAKURGAON_TERAI_FLATLAND', // Planar smallholder tea expansion
  BANDARBAN_HILL_TRACTS = 'BANDARBAN_HILL_TRACTS', // High-altitude artisanal tribal tea cultivation
}

export enum TeaProcessingType {
  CTC_BLACK_TEA = 'CTC_BLACK_TEA', // Crush, Tear, Curl - fast brewing, robust brisk liquor
  ARTISANAL_ORTHODOX_BLACK = 'ARTISANAL_ORTHODOX_BLACK', // Traditional whole leaf, complex floral aroma
  GREEN_TEA_STEAMED_PANFIRED = 'GREEN_TEA_STEAMED_PANFIRED', // Unfermented green tea, high EGCG catechins
  SILVER_NEEDLE_WHITE_TEA = 'SILVER_NEEDLE_WHITE_TEA', // Sun-dried unbroken apical buds, delicate nectar finish
  OOLONG_SEMI_FERMENTED = 'OOLONG_SEMI_FERMENTED', // 40-60% semi-fermented artisanal tea
}

export enum TeaLeafGrade {
  BOP = 'BOP', // Broken Orange Pekoe - standard commercial CTC leaf grade
  OF = 'OF', // Orange Fannings - quick infusing teabag standard
  PD = 'PD', // Pekoe Dust - strong intense liquor
  RD = 'RD', // Red Dust - heavy milk tea base
  CD = 'CD', // Churamoni Dust - deep color
  FTGFOP1 = 'FTGFOP1', // Finest Tippy Golden Flowery Orange Pekoe - top-tier Orthodox
  TGFOP = 'TGFOP', // Tippy Golden Flowery Orange Pekoe
  FBOP = 'FBOP', // Flowery Broken Orange Pekoe
  SPECIALTY_SILVER_TIPS = 'SPECIALTY_SILVER_TIPS', // Pure apical fuzzy white tips
  ORGANIC_SENCHA_GREEN = 'ORGANIC_SENCHA_GREEN', // Steamed organic flat green leaf
  FIRST_FLUSH_SPRING = 'FIRST_FLUSH_SPRING', // Spring early flush harvested in March/April
}

export enum PluckingStandard {
  SUPERFINE_TWO_LEAVES_AND_BUD = 'SUPERFINE_TWO_LEAVES_AND_BUD', // ≥85% fine two leaves and an apical bud
  STANDARD_FINE_PLUCK = 'STANDARD_FINE_PLUCK', // 70% - 84% fine plucking
  COARSE_OVERGROWN_PLUCK = 'COARSE_OVERGROWN_PLUCK', // <70% fine plucking, overgrown 3rd/4th leaves
}

export enum AuctionCenter {
  CHITTAGONG_TEA_AUCTION = 'CHITTAGONG_TEA_AUCTION', // Historic national auction center
  SREEMANGAL_TEA_AUCTION = 'SREEMANGAL_TEA_AUCTION', // Sreemangal regional auction house
  PANCHAGARH_AUCTION_DESK = 'PANCHAGARH_AUCTION_DESK', // Northern smallholder planar auction desk
}

export enum AuctionLotStatus {
  CATALOGUED_FOR_AUCTION = 'CATALOGUED_FOR_AUCTION',
  ACTIVE_BIDDING = 'ACTIVE_BIDDING',
  KNOCKED_DOWN_SOLD = 'KNOCKED_DOWN_SOLD',
  WITHDRAWN_OUTSOLD = 'WITHDRAWN_OUTSOLD',
  EXPORT_DISPATCHED = 'EXPORT_DISPATCHED',
}
