import { ApplicationStatus } from '../../applications/enums/application-status.enum.js';

export interface SeedSellerApplicationItem {
  userEmail: string;
  shopNameEn: string;
  shopNameBn: string;
  shopSlug: string;
  phone: string;
  email: string;
  description: string;
  address: string;
  tradeLicenseNumber: string;
  nidNumber: string;
  status: ApplicationStatus;
  adminNotes: string | null;
  reviewedDaysAgo: number | null;
}

export interface SeedRiderApplicationItem {
  userEmail: string;
  fullName: string;
  phone: string;
  email: string;
  nidNumber: string;
  vehicleType: string;
  vehiclePlateNumber: string | null;
  drivingLicenseNumber: string | null;
  preferredZone: string;
  emergencyContact: string;
  status: ApplicationStatus;
  adminNotes: string | null;
  reviewedDaysAgo: number | null;
}

export const SEED_SELLER_APPLICATIONS: SeedSellerApplicationItem[] = [
  // Approved Sellers (matching existing shops)
  {
    userEmail: 'seller1@gramerbazar.com',
    shopNameEn: 'Rahim Traders',
    shopNameBn: 'রহিম ট্রেডার্স',
    shopSlug: 'rahim-traders',
    phone: '+8801711000002',
    email: 'seller1@gramerbazar.com',
    description: 'Trusted wholesale and retail grocery supplier serving Debiganj for over 15 years.',
    address: 'Station Road, Debiganj Bazar, Panchagarh',
    tradeLicenseNumber: 'TRAD/DBG/2021/0458',
    nidNumber: '19845218765432101',
    status: ApplicationStatus.APPROVED,
    adminNotes: 'Trade license and NID verified on site. Shop inspection approved by Regional Officer.',
    reviewedDaysAgo: 60,
  },
  {
    userEmail: 'seller2@gramerbazar.com',
    shopNameEn: 'Karim Groceries & Spices',
    shopNameBn: 'করিম গ্রোসারি অ্যান্ড স্পাইসেস',
    shopSlug: 'karim-groceries',
    phone: '+8801711000003',
    email: 'seller2@gramerbazar.com',
    description: 'Fresh rural spices, mustard oil, organic turmeric, and pantry essentials direct from farmers.',
    address: 'Puratan Bazar, Debiganj, Panchagarh',
    tradeLicenseNumber: 'TRAD/DBG/2022/1129',
    nidNumber: '19885218765432202',
    status: ApplicationStatus.APPROVED,
    adminNotes: 'Documents verified. Shop operational credentials validated.',
    reviewedDaysAgo: 45,
  },
  {
    userEmail: 'seller3@gramerbazar.com',
    shopNameEn: 'Bhai Bhai Pharmacy',
    shopNameBn: 'ভাই ভাই ফার্মেসী',
    shopSlug: 'bhai-bhai-pharmacy',
    phone: '+8801711000004',
    email: 'seller3@gramerbazar.com',
    description: 'Licensed retail drug store providing genuine medicine, first aid, and personal healthcare.',
    address: 'Hospital Gate, Debiganj Sadar, Panchagarh',
    tradeLicenseNumber: 'DGDA/DRUG/55412',
    nidNumber: '19795218765432303',
    status: ApplicationStatus.APPROVED,
    adminNotes: 'DGDA Drug License and pharmacist certification verified.',
    reviewedDaysAgo: 30,
  },
  // Pending Applications from Customers
  {
    userEmail: 'customer10@gramerbazar.com',
    shopNameEn: 'Sonar Bangla Organic Foods',
    shopNameBn: 'সোনার বাংলা অর্গানিক ফুডস',
    shopSlug: 'sonar-bangla-organic',
    phone: '+8801811000009',
    email: 'customer10@gramerbazar.com',
    description: 'Farm-fresh deshi chicken, quail eggs, honey, and organic mustard oil from Debiganj char area.',
    address: 'Tengonmari, Debiganj, Panchagarh',
    tradeLicenseNumber: 'TRAD/DBG/2026/0019',
    nidNumber: '19955218765432404',
    status: ApplicationStatus.PENDING,
    adminNotes: null,
    reviewedDaysAgo: null,
  },
  {
    userEmail: 'customer11@gramerbazar.com',
    shopNameEn: 'Panchagarh Handicrafts',
    shopNameBn: 'পঞ্চগড় হস্তশিল্প ও বাঁশজাত পণ্য',
    shopSlug: 'panchagarh-handicrafts',
    phone: '+8801811000010',
    email: 'customer11@gramerbazar.com',
    description: 'Eco-friendly bamboo baskets, handloom mats, jute bags, and rural cottage craft items.',
    address: 'Boda Road, Panchagarh Sadar',
    tradeLicenseNumber: 'TRAD/PCH/2025/3381',
    nidNumber: '19925218765432505',
    status: ApplicationStatus.PENDING,
    adminNotes: null,
    reviewedDaysAgo: null,
  },
  // Rejected Application
  {
    userEmail: 'customer12@gramerbazar.com',
    shopNameEn: 'Unverified Quick Store',
    shopNameBn: 'আনভেরিফাইড কুইক স্টোর',
    shopSlug: 'unverified-quick-store',
    phone: '+8801811000011',
    email: 'customer12@gramerbazar.com',
    description: 'Reseller wanting to list assorted products without warehouse address.',
    address: 'Near Riverbank, Panchagarh',
    tradeLicenseNumber: 'PENDING_DOCUMENT',
    nidNumber: '19975218765432606',
    status: ApplicationStatus.REJECTED,
    adminNotes: 'Application rejected: Trade license document missing and physical store verification failed.',
    reviewedDaysAgo: 10,
  },
];

export const SEED_RIDER_APPLICATIONS: SeedRiderApplicationItem[] = [
  // Approved Riders (matching active delivery fleet)
  {
    userEmail: 'rider1@gramerbazar.com',
    fullName: 'Babul Mia',
    phone: '+8801700000005',
    email: 'rider1@gramerbazar.com',
    nidNumber: '19915219988776601',
    vehicleType: 'MOTORCYCLE',
    vehiclePlateNumber: 'DHK-METRO-HA-5542',
    drivingLicenseNumber: 'DL-RNG-2020-0098',
    preferredZone: 'Debiganj Upazila',
    emergencyContact: '+8801712000091',
    status: ApplicationStatus.APPROVED,
    adminNotes: 'Driving license and motorcycle registration verified. Safety training completed.',
    reviewedDaysAgo: 50,
  },
  {
    userEmail: 'rider2@gramerbazar.com',
    fullName: 'Kamal Sheikh',
    phone: '+8801700000006',
    email: 'rider2@gramerbazar.com',
    nidNumber: '19935219988776602',
    vehicleType: 'MOTORCYCLE',
    vehiclePlateNumber: 'RNG-METRO-LA-1120',
    drivingLicenseNumber: 'DL-PCH-2021-3312',
    preferredZone: 'Debiganj Bazar & Boda Border',
    emergencyContact: '+8801712000092',
    status: ApplicationStatus.APPROVED,
    adminNotes: 'Verified rider background check clear. Onboarded to north delivery hub.',
    reviewedDaysAgo: 40,
  },
  // Pending Rider Applications
  {
    userEmail: 'customer13@gramerbazar.com',
    fullName: 'Tariqul Islam',
    phone: '+8801811000012',
    email: 'customer13@gramerbazar.com',
    nidNumber: '19965219988776603',
    vehicleType: 'MOTORCYCLE',
    vehiclePlateNumber: 'DIN-METRO-HA-8871',
    drivingLicenseNumber: 'DL-DIN-2023-4419',
    preferredZone: 'Debiganj Sadar & Shaldanga Union',
    emergencyContact: '+8801812000093',
    status: ApplicationStatus.PENDING,
    adminNotes: null,
    reviewedDaysAgo: null,
  },
  {
    userEmail: 'customer14@gramerbazar.com',
    fullName: 'Mehedi Hasan',
    phone: '+8801811000013',
    email: 'customer14@gramerbazar.com',
    nidNumber: '19985219988776604',
    vehicleType: 'BICYCLE',
    vehiclePlateNumber: null,
    drivingLicenseNumber: null,
    preferredZone: 'Debiganj Town Market Local Deliveries',
    emergencyContact: '+8801812000094',
    status: ApplicationStatus.PENDING,
    adminNotes: null,
    reviewedDaysAgo: null,
  },
  // Rejected Rider Application
  {
    userEmail: 'customer15@gramerbazar.com',
    fullName: 'Kamrul Hasan',
    phone: '+8801811000014',
    email: 'customer15@gramerbazar.com',
    nidNumber: '19995219988776605',
    vehicleType: 'MOTORCYCLE',
    vehiclePlateNumber: 'UNREGISTERED',
    drivingLicenseNumber: 'EXPIRED-2023',
    preferredZone: 'Debiganj Upazila',
    emergencyContact: '+8801812000095',
    status: ApplicationStatus.REJECTED,
    adminNotes: 'Driving license expired in 2023. Vehicle registration card not provided.',
    reviewedDaysAgo: 8,
  },
];
