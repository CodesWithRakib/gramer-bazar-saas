export enum GroupBuyCampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
}

export enum GroupBuyPoolStatus {
  FORMING = 'FORMING',       // Waiting for min buyers before expiry countdown
  SUCCESS = 'SUCCESS',       // Target met, unlocked bulk discount, ready for single-drop dispatch
  EXPIRED = 'EXPIRED',       // Timer ended before min participants reached
  FULFILLED = 'FULFILLED',   // Delivered to consolidated drop point
  CANCELLED = 'CANCELLED',
}

export enum GroupBuyPaymentMode {
  WALLET_ESCROW = 'WALLET_ESCROW',
  ONLINE_PAYMENT = 'ONLINE_PAYMENT',
  COD_PLEDGE = 'COD_PLEDGE',
}
