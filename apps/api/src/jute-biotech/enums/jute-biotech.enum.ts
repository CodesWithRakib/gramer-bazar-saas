export enum JuteVariety {
  TOSSA_JUTE = 'TOSSA_JUTE', // Corchorus olitorius - silky, golden-yellow to bronze, high tensile strength
  WHITE_JUTE = 'WHITE_JUTE', // Corchorus capsularis - whitish creamy, tolerant to waterlogged land
  MESTA_KENAF = 'MESTA_KENAF', // Hibiscus sabdariffa - coarser, used for heavy packaging and twine
}

export enum JuteFiberGrade {
  BJC_SPECIAL_TOP = 'BJC_SPECIAL_TOP', // Bangladesh Jute Corchorus Special (Grade 1: >28 g/tex tensile, root-cut <3%)
  BJD_GRADE_2 = 'BJD_GRADE_2', // Grade 2: 26-28 g/tex, very strong, good lustre, root-cut <5%
  BJD_GRADE_3 = 'BJD_GRADE_3', // Grade 3: 24-26 g/tex, standard spinning grade, root-cut 5-10%
  BJD_GRADE_4 = 'BJD_GRADE_4', // Grade 4: 21-23 g/tex, commercial sack grade, root-cut 10-15%
  BJD_GRADE_5 = 'BJD_GRADE_5', // Grade 5: 18-20 g/tex, lower commercial, root-cut 15-20%
  BJD_GRADE_6_HABBIJABBI = 'BJD_GRADE_6_HABBIJABBI', // Grade 6: Entangled/weak fiber, root-cut >20%
  BWC_SPECIAL_TOP = 'BWC_SPECIAL_TOP', // White Jute Special Top
  BWD_GRADE_2 = 'BWD_GRADE_2', // White Jute Grade 2
  BWD_GRADE_3 = 'BWD_GRADE_3', // White Jute Grade 3
  BWD_GRADE_4 = 'BWD_GRADE_4', // White Jute Grade 4
  BWD_GRADE_5 = 'BWD_GRADE_5', // White Jute Grade 5
  BWD_GRADE_6 = 'BWD_GRADE_6', // White Jute Grade 6
}

export enum RettingMethod {
  RIBBON_RETTING_ENZYMATIC = 'RIBBON_RETTING_ENZYMATIC', // BJRI microbial consortium applied to fresh green bark ribbons (8-10 days)
  CONVENTIONAL_WHOLE_PLANT_STEEP = 'CONVENTIONAL_WHOLE_PLANT_STEEP', // Traditional whole bundle steeping in ponds/canals (18-21 days)
  TANK_MICROBIAL_RETTING = 'TANK_MICROBIAL_RETTING', // Controlled aerated geo-membrane retting tank
}

export enum RettingStatus {
  STEEPING_INITIATED = 'STEEPING_INITIATED',
  ACTIVE_MICROBIAL_RETTING = 'ACTIVE_MICROBIAL_RETTING',
  FIBER_SEPARATION_READY = 'FIBER_SEPARATION_READY',
  HARVESTED_WASHED = 'HARVESTED_WASHED',
  OVER_RETTED_RISK = 'OVER_RETTED_RISK',
}

export enum BaleType {
  KUTCHA_BALE_FARM = 'KUTCHA_BALE_FARM', // Hand or screw-pressed bale at farmgate (approx 120-150 kg / 3-3.5 maunds)
  PUCCA_EXPORT_BALE = 'PUCCA_EXPORT_BALE', // High-pressure hydraulic export bale (180 kg / 400 lbs, 50 cu ft)
  LOOSE_MORAH_LOT = 'LOOSE_MORAH_LOT', // Unpressed head-tied morah bundles (40-50 kg)
}

export enum PackagingActCategory {
  PADDY_AND_RICE_50KG = 'PADDY_AND_RICE_50KG', // Mandatory Jute Packaging Act 2010 requirement for food grains
  WHEAT_AND_FLOUR_50KG = 'WHEAT_AND_FLOUR_50KG',
  SUGAR_50KG = 'SUGAR_50KG',
  FERTILIZER_50KG = 'FERTILIZER_50KG', // Mandatory for BADC / BCIC fertilizer distribution
  FEED_AND_MAIZE_75KG = 'FEED_AND_MAIZE_75KG',
  POTATO_AND_VEGETABLE_SACK = 'POTATO_AND_VEGETABLE_SACK',
  GEO_JUTE_SOIL_EROSION_MESH = 'GEO_JUTE_SOIL_EROSION_MESH',
  CBC_CARPET_BACKING_CLOTH = 'CBC_CARPET_BACKING_CLOTH',
}

export enum BalingEscrowStatus {
  WEIGHBRIDGE_DRAFT = 'WEIGHBRIDGE_DRAFT',
  QUALITY_VERIFIED = 'QUALITY_VERIFIED',
  HELD_IN_ESCROW = 'HELD_IN_ESCROW',
  SETTLED_TO_FARMER = 'SETTLED_TO_FARMER',
  DISPUTED_MOISTURE = 'DISPUTED_MOISTURE',
}
