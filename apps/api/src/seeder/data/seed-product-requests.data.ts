import { ProductRequestStatus } from '../../product-requests/enums/product-request-status.enum.js';

export interface SeedProductRequestItem {
  customerEmail: string;
  requestedProductName: string;
  description: string;
  preferredInformation: string;
  status: ProductRequestStatus;
  adminNotes: string | null;
  historyEvents: {
    status: ProductRequestStatus;
    remark: string;
    actorRole: 'CUSTOMER' | 'ADMIN';
    daysAgo: number;
  }[];
}

export const SEED_PRODUCT_REQUESTS: SeedProductRequestItem[] = [
  {
    customerEmail: 'customer1@gramerbazar.com',
    requestedProductName: 'Organic Sundarban Wild Honey (৫০০ গ্রাম সুন্দরবনের খাঁটি মধু)',
    description: 'Looking for 100% natural, raw, unprocessed forest honey collected by traditional Mouals.',
    preferredInformation: 'Preferred pack size 500g glass jar with moisture seal.',
    status: ProductRequestStatus.PRODUCT_ADDED,
    adminNotes: 'Sourced from certified cooperative via Rahim Traders. Catalog product listed.',
    historyEvents: [
      {
        status: ProductRequestStatus.PENDING,
        remark: 'Customer submitted product request for raw Sundarban honey.',
        actorRole: 'CUSTOMER',
        daysAgo: 16,
      },
      {
        status: ProductRequestStatus.REVIEWING,
        remark: 'Admin reviewing request and checking supplier compliance in Khulna/Debiganj.',
        actorRole: 'ADMIN',
        daysAgo: 14,
      },
      {
        status: ProductRequestStatus.SEARCHING,
        remark: 'Contacting local natural honey distributors.',
        actorRole: 'ADMIN',
        daysAgo: 12,
      },
      {
        status: ProductRequestStatus.FOUND,
        remark: 'Supplier verified with lab test report for zero sugar adulteration.',
        actorRole: 'ADMIN',
        daysAgo: 9,
      },
      {
        status: ProductRequestStatus.PRODUCT_ADDED,
        remark: 'Product successfully added to Gramer Bazar catalog. Customer notified.',
        actorRole: 'ADMIN',
        daysAgo: 7,
      },
    ],
  },
  {
    customerEmail: 'customer2@gramerbazar.com',
    requestedProductName: 'Fresh Chalan Beel Baim Fish (তাজা চলন বিলের বাইম মাছ)',
    description: 'Wild river baim fish (minimum 500g - 1kg size), fresh caught without formalin.',
    preferredInformation: 'Requires immediate cold chain ice packaging upon harvest.',
    status: ProductRequestStatus.SEARCHING,
    adminNotes: 'Coordinating with local fish traders in Singra / Natore hub.',
    historyEvents: [
      {
        status: ProductRequestStatus.PENDING,
        remark: 'Customer requested 2kg fresh Chalan Beel wild baim fish.',
        actorRole: 'CUSTOMER',
        daysAgo: 6,
      },
      {
        status: ProductRequestStatus.REVIEWING,
        remark: 'Reviewing cold transport feasibility to Debiganj.',
        actorRole: 'ADMIN',
        daysAgo: 4,
      },
      {
        status: ProductRequestStatus.SEARCHING,
        remark: 'Connecting with Singra Fishermen Cooperative for live catch delivery.',
        actorRole: 'ADMIN',
        daysAgo: 2,
      },
    ],
  },
  {
    customerEmail: 'customer3@gramerbazar.com',
    requestedProductName: 'Handmade Nakshi Kantha Blanket (হস্তনির্মিত ঐতিহ্যবাহী নকশী কাঁথা)',
    description: 'Traditional Bengali hand-stitched cotton quilt with intricate floral folk motifs.',
    preferredInformation: 'King size or double bed size, preferably red/maroon border.',
    status: ProductRequestStatus.REVIEWING,
    adminNotes: 'Referred to Panchagarh & Jamalpur women artisan network.',
    historyEvents: [
      {
        status: ProductRequestStatus.PENDING,
        remark: 'Customer requested authentic handloom Nakshi Kantha.',
        actorRole: 'CUSTOMER',
        daysAgo: 4,
      },
      {
        status: ProductRequestStatus.REVIEWING,
        remark: 'Admin assessing artisan craft catalogue and pricing specifications.',
        actorRole: 'ADMIN',
        daysAgo: 2,
      },
    ],
  },
  {
    customerEmail: 'customer4@gramerbazar.com',
    requestedProductName: 'Pure Mustard Flower Honey (সরিষা ফুলের সাদা মধু)',
    description: 'White creamy crystallized mustard blossom honey from Panchagarh winter mustard crops.',
    preferredInformation: '1 kg container, unheated raw harvest.',
    status: ProductRequestStatus.FOUND,
    adminNotes: 'Verified local beekeeper found in Debiganj mustard fields. Finalizing packaging.',
    historyEvents: [
      {
        status: ProductRequestStatus.PENDING,
        remark: 'Customer submitted seasonal request.',
        actorRole: 'CUSTOMER',
        daysAgo: 8,
      },
      {
        status: ProductRequestStatus.REVIEWING,
        remark: 'Approved for local seasonal sourcing.',
        actorRole: 'ADMIN',
        daysAgo: 6,
      },
      {
        status: ProductRequestStatus.FOUND,
        remark: 'Partner merchant Karim Groceries has secured batch from Debiganj farmer.',
        actorRole: 'ADMIN',
        daysAgo: 3,
      },
    ],
  },
  {
    customerEmail: 'customer5@gramerbazar.com',
    requestedProductName: 'Black Rice - Aromatic Anti-Oxidant Rich (কালো চাল)',
    description: 'Organic unpolished heirloom black rice for healthy diabetic diet.',
    preferredInformation: 'Preferably 2kg or 5kg vacuum-sealed packets.',
    status: ProductRequestStatus.PENDING,
    adminNotes: null,
    historyEvents: [
      {
        status: ProductRequestStatus.PENDING,
        remark: 'Customer submitted request for 5kg black rice.',
        actorRole: 'CUSTOMER',
        daysAgo: 1,
      },
    ],
  },
  {
    customerEmail: 'customer6@gramerbazar.com',
    requestedProductName: 'Unregistered Chinese Plant Growth Hormone Spray',
    description: 'Imported chemical booster spray for rapid bottle gourd enlargement.',
    preferredInformation: '500ml spray bottle.',
    status: ProductRequestStatus.REJECTED,
    adminNotes: 'Rejected: Unapproved agricultural chemical not compliant with Department of Agricultural Extension safety regulations.',
    historyEvents: [
      {
        status: ProductRequestStatus.PENDING,
        remark: 'Customer submitted product inquiry.',
        actorRole: 'CUSTOMER',
        daysAgo: 7,
      },
      {
        status: ProductRequestStatus.REJECTED,
        remark: 'DAE safety regulations restrict sale of non-certified chemical growth stimulants.',
        actorRole: 'ADMIN',
        daysAgo: 5,
      },
    ],
  },
];
