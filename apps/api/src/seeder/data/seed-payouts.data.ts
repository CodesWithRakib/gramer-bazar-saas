import { PayoutStatus, PayoutMethod } from '../../payouts/entities/payout-request.entity.js';

export interface SeedPayoutItem {
  sellerIndex: number;
  amount: number;
  method: PayoutMethod;
  accountDetails: string;
  status: PayoutStatus;
  adminNote: string | null;
}

export const SEED_PAYOUT_REQUESTS: SeedPayoutItem[] = [
  {
    sellerIndex: 0, // Rahim Traders
    amount: 5000,
    method: PayoutMethod.BANK_TRANSFER,
    accountDetails: 'Islami Bank Bangladesh Ltd, Debiganj Branch, A/C: 20501140203040, Name: Rahim Uddin',
    status: PayoutStatus.APPROVED,
    adminNote: 'Settled via BEFTN Trx #TXN-EFT-992102. Bank funds transferred.',
  },
  {
    sellerIndex: 1, // Karim Groceries
    amount: 2500,
    method: PayoutMethod.BKASH,
    accountDetails: 'bKash Merchant/Personal: 01711000003',
    status: PayoutStatus.PENDING,
    adminNote: null,
  },
  {
    sellerIndex: 2, // Bhai Bhai Pharmacy
    amount: 12000,
    method: PayoutMethod.NAGAD,
    accountDetails: 'Nagad Personal: 01899112233',
    status: PayoutStatus.REJECTED,
    adminNote: 'Rejected: Registered merchant phone does not match Nagad beneficiary name. Please update in KYC settings.',
  },
  {
    sellerIndex: 3, // Maa Babar Doa Veggies
    amount: 3500,
    method: PayoutMethod.ROCKET,
    accountDetails: 'DBBL Rocket: 019110000048',
    status: PayoutStatus.APPROVED,
    adminNote: 'Settled via DBBL Batch #RCK-441029. Funds credited to mobile wallet.',
  },
  {
    sellerIndex: 4, // Gramin Fashion
    amount: 4000,
    method: PayoutMethod.BKASH,
    accountDetails: 'bKash Personal: 01711000006',
    status: PayoutStatus.PENDING,
    adminNote: null,
  },
];
