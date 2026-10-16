export enum AgentSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  RECONCILED = 'RECONCILED',
}

export enum AgentCashTxType {
  CASH_IN_ORDER = 'CASH_IN_ORDER',
  CASH_IN_FLOAT_ADD = 'CASH_IN_FLOAT_ADD',
  CASH_OUT_PRODUCE_PAYOUT = 'CASH_OUT_PRODUCE_PAYOUT',
  CASH_OUT_EXPENSE = 'CASH_OUT_EXPENSE',
  CASH_OUT_DEPOSIT = 'CASH_OUT_DEPOSIT',
}

export enum FarmerCollectionStatus {
  COLLECTED = 'COLLECTED',
  CONSIGNED = 'CONSIGNED',
  IN_TRANSIT_TO_HUB = 'IN_TRANSIT_TO_HUB',
  HUB_RECEIVED = 'HUB_RECEIVED',
}

export enum SettlementChannel {
  POST_OFFICE = 'POST_OFFICE',           // Bangladesh Post Office (ডাকবিভাগ ই-পোস্ট)
  MFI_BRANCH = 'MFI_BRANCH',             // Microfinance Branch (BRAC, Grameen, ASA)
  AGENT_BANKING = 'AGENT_BANKING',       // Rural Agent Banking (Bank Asia, Sonali)
  BKASH_AGENT = 'BKASH_AGENT',           // MFS Agent Outlet
}

export enum SettlementStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}
