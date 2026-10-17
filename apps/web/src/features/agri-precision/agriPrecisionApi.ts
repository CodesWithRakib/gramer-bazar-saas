import { api } from '@/store/api';

export type InputCategory =
  | 'FERTILIZER'
  | 'PESTICIDE'
  | 'FUNGICIDE'
  | 'HERBICIDE'
  | 'CERTIFIED_SEED'
  | 'BIO_STIMULANT';

export type InputVerificationStatus =
  | 'AUTHENTIC_CERTIFIED'
  | 'SUSPICIOUS_COUNTERFEIT'
  | 'EXPIRED'
  | 'RECALLED';

export type DroneServiceType =
  | 'INSECTICIDE_SPRAY'
  | 'FUNGICIDE_BLIGHT_SPRAY'
  | 'LIQUID_FERTILIZER_TOPDRESS'
  | 'HERBICIDE_PRE_EMERGENCE';

export type DroneBookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED_DISPATCH'
  | 'IN_FLIGHT_SPRAYING'
  | 'COMPLETED'
  | 'CANCELLED';

export type SoilTextureType =
  | 'CLAY_LOAM'
  | 'SANDY_LOAM'
  | 'SILTY_LOAM'
  | 'PEAT_SOIL'
  | 'COASTAL_SALINE';

export type CropTargetNutrient =
  | 'BORO_RICE'
  | 'AMAN_RICE'
  | 'POTATO'
  | 'HYBRID_MAIZE'
  | 'MUSTARD'
  | 'WINTER_VEGETABLES'
  | 'ONION_GARLIC';

export interface AgriInputRegistryItem {
  id: string;
  barcodeOrQrCode: string;
  batchNumber: string;
  brandName: string;
  manufacturerName: string;
  category: InputCategory;
  activeIngredients: string;
  standardPurityPct: number;
  daeRegistrationNo: string;
  manufactureDate: string;
  expiryDate: string;
  status: InputVerificationStatus;
  mrpPriceBdt: number;
  standardDosageGuide: string;
  counterfeitReportsCount: number;
  createdAt: string;
}

export interface InputVerificationResult {
  isAuthentic: boolean;
  status: InputVerificationStatus;
  item?: AgriInputRegistryItem;
  messageEn: string;
  messageBn: string;
}

export interface AgriInputCounterfeitReport {
  id: string;
  reportTicketNo: string;
  reporterUserId?: string | null;
  reporterName: string;
  reporterPhone: string;
  suspectedItemBarcode: string;
  brandName: string;
  retailShopName: string;
  retailShopDistrict: string;
  retailShopUpazila: string;
  retailShopAddress: string;
  suspectedDefectDescription: string;
  evidencePhotos?: string[];
  isEscalatedToDae: boolean;
  daeInvestigationStatus: string;
  createdAt: string;
}

export interface DroneSprayingUnit {
  id: string;
  droneCode: string;
  pilotId: string;
  pilot?: { id: string; name: string };
  pilotName: string;
  pilotPhone: string;
  pilotLicenseNo: string;
  droneModel: string;
  tankCapacityLiters: number;
  serviceRatePerBigha: number;
  baseDistrict: string;
  baseUpazila: string;
  coverageRadiusKm: number;
  totalAcresSprayed: number;
  waterSavedLitersEstimated: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface DroneSprayingBooking {
  id: string;
  bookingNumber: string;
  farmerId: string;
  farmer?: { id: string; name: string };
  farmerName: string;
  farmerPhone: string;
  droneUnitId: string;
  droneUnit?: DroneSprayingUnit;
  serviceType: DroneServiceType;
  targetCrop: string;
  targetInfestationOrFormula: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  landAreaBighas: number;
  serviceRatePerBigha: number;
  totalBookingCost: number;
  scheduledDate: string;
  scheduledTimeSlot: string;
  gpsPlotCenterLat?: number | null;
  gpsPlotCenterLng?: number | null;
  flightDurationMinutes?: number | null;
  waterSavedLiters: number;
  pilotMissionNotes?: string | null;
  status: DroneBookingStatus;
  createdAt: string;
}

export interface SoilHealthCardRecord {
  id: string;
  soilCardNumber: string;
  farmerId: string;
  farmer?: { id: string; name: string };
  farmerName: string;
  farmerPhone: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  soilTexture: SoilTextureType;
  targetCrop: CropTargetNutrient;
  landAreaBighas: number;
  phLevel: number;
  nitrogenKgPerHa: number;
  phosphorusPpm: number;
  potassiumMeqPer100g: number;
  organicMatterPct: number;
  zincPpm?: number | null;
  boronPpm?: number | null;
  salinityEc?: number | null;
  calculatedUreaKgPerBigha: number;
  calculatedTspKgPerBigha: number;
  calculatedMopKgPerBigha: number;
  calculatedGypsumKgPerBigha: number;
  calculatedZincKgPerBigha: number;
  calculatedOrganicCompostKgPerBigha: number;
  fertilizerApplicationSchedule: string;
  phCorrectionAdvice?: string | null;
  createdAt: string;
}

export interface PrecisionPlatformStats {
  totalVerifiedInputs: number;
  totalCounterfeitReports: number;
  totalDroneUnits: number;
  totalAcresDroneSprayed: number;
  totalWaterSavedLiters: number;
  totalSoilCardsIssued: number;
}

export interface ReportCounterfeitInputDto {
  suspectedItemBarcode: string;
  brandName: string;
  reporterName: string;
  reporterPhone: string;
  retailShopName: string;
  retailShopDistrict: string;
  retailShopUpazila: string;
  retailShopAddress: string;
  suspectedDefectDescription: string;
  evidencePhotos?: string[];
}

export interface RegisterDroneUnitDto {
  droneCode?: string;
  pilotName: string;
  pilotPhone: string;
  pilotLicenseNo: string;
  droneModel: string;
  tankCapacityLiters?: number;
  serviceRatePerBigha: number;
  baseDistrict: string;
  baseUpazila: string;
  coverageRadiusKm?: number;
}

export interface BookDroneSprayingDto {
  droneUnitId: string;
  serviceType: DroneServiceType;
  targetCrop: string;
  targetInfestationOrFormula: string;
  farmerName: string;
  farmerPhone: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  landAreaBighas: number;
  scheduledDate: string;
  scheduledTimeSlot: string;
  gpsPlotCenterLat?: number;
  gpsPlotCenterLng?: number;
}

export interface UpdateDroneBookingStatusDto {
  status: DroneBookingStatus;
  flightDurationMinutes?: number;
  waterSavedLiters?: number;
  pilotMissionNotes?: string;
}

export interface GenerateSoilHealthCardDto {
  farmerName: string;
  farmerPhone: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  soilTexture: SoilTextureType;
  targetCrop: CropTargetNutrient;
  landAreaBighas: number;
  phLevel: number;
  nitrogenKgPerHa: number;
  phosphorusPpm: number;
  potassiumMeqPer100g: number;
  organicMatterPct: number;
  zincPpm?: number;
  boronPpm?: number;
  salinityEc?: number;
}

export const agriPrecisionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    verifyAgriInput: builder.query<InputVerificationResult, string>({
      query: (code) => `/agri-precision/inputs/verify/${encodeURIComponent(code)}`,
    }),

    reportCounterfeitInput: builder.mutation<AgriInputCounterfeitReport, ReportCounterfeitInputDto>({
      query: (body) => ({
        url: '/agri-precision/inputs/report-counterfeit',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'AgriCounterfeitReport', id: 'LIST' },
        { type: 'AgriInputRegistry', id: 'STATS' },
      ],
    }),

    getCounterfeitReports: builder.query<AgriInputCounterfeitReport[], void>({
      query: () => '/agri-precision/admin/counterfeit-reports',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AgriCounterfeitReport' as const, id })),
              { type: 'AgriCounterfeitReport', id: 'LIST' },
            ]
          : [{ type: 'AgriCounterfeitReport', id: 'LIST' }],
    }),

    escalateCounterfeitReport: builder.mutation<AgriInputCounterfeitReport, string>({
      query: (id) => ({
        url: `/agri-precision/admin/counterfeit-reports/${id}/escalate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'AgriCounterfeitReport', id },
        { type: 'AgriCounterfeitReport', id: 'LIST' },
      ],
    }),

    getDroneUnits: builder.query<{ items: DroneSprayingUnit[]; total: number }, { district?: string } | void>({
      query: (params) => ({
        url: '/agri-precision/drones/units',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'DroneUnit' as const, id })),
              { type: 'DroneUnit', id: 'LIST' },
            ]
          : [{ type: 'DroneUnit', id: 'LIST' }],
    }),

    registerDroneUnit: builder.mutation<DroneSprayingUnit, RegisterDroneUnitDto>({
      query: (body) => ({
        url: '/agri-precision/drones/units',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'DroneUnit', id: 'LIST' }, { type: 'DroneUnit', id: 'STATS' }],
    }),

    bookDroneSpraying: builder.mutation<DroneSprayingBooking, BookDroneSprayingDto>({
      query: (body) => ({
        url: '/agri-precision/drones/book',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'DroneBooking', id: 'FARMER_LIST' },
        { type: 'DroneBooking', id: 'PILOT_LIST' },
        { type: 'DroneUnit', id: 'STATS' },
      ],
    }),

    getFarmerDroneBookings: builder.query<DroneSprayingBooking[], void>({
      query: () => '/agri-precision/drones/bookings/farmer',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DroneBooking' as const, id })),
              { type: 'DroneBooking', id: 'FARMER_LIST' },
            ]
          : [{ type: 'DroneBooking', id: 'FARMER_LIST' }],
    }),

    getPilotDroneBookings: builder.query<DroneSprayingBooking[], void>({
      query: () => '/agri-precision/drones/bookings/pilot',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DroneBooking' as const, id })),
              { type: 'DroneBooking', id: 'PILOT_LIST' },
            ]
          : [{ type: 'DroneBooking', id: 'PILOT_LIST' }],
    }),

    updateDroneBookingStatus: builder.mutation<
      DroneSprayingBooking,
      { id: string; body: UpdateDroneBookingStatusDto }
    >({
      query: ({ id, body }) => ({
        url: `/agri-precision/drones/bookings/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'DroneBooking', id },
        { type: 'DroneBooking', id: 'FARMER_LIST' },
        { type: 'DroneBooking', id: 'PILOT_LIST' },
        { type: 'DroneUnit', id: 'LIST' },
        { type: 'DroneUnit', id: 'STATS' },
      ],
    }),

    generateSoilHealthCard: builder.mutation<SoilHealthCardRecord, GenerateSoilHealthCardDto>({
      query: (body) => ({
        url: '/agri-precision/soil-cards',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SoilCard', id: 'LIST' }, { type: 'SoilCard', id: 'STATS' }],
    }),

    getFarmerSoilCards: builder.query<SoilHealthCardRecord[], void>({
      query: () => '/agri-precision/soil-cards/farmer',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SoilCard' as const, id })),
              { type: 'SoilCard', id: 'LIST' },
            ]
          : [{ type: 'SoilCard', id: 'LIST' }],
    }),

    getSoilCardById: builder.query<SoilHealthCardRecord, string>({
      query: (id) => `/agri-precision/soil-cards/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SoilCard', id }],
    }),

    getPrecisionStats: builder.query<PrecisionPlatformStats, void>({
      query: () => '/agri-precision/stats',
      providesTags: [{ type: 'DroneUnit', id: 'STATS' }],
    }),
  }),
});

export const {
  useLazyVerifyAgriInputQuery,
  useVerifyAgriInputQuery,
  useReportCounterfeitInputMutation,
  useGetCounterfeitReportsQuery,
  useEscalateCounterfeitReportMutation,
  useGetDroneUnitsQuery,
  useRegisterDroneUnitMutation,
  useBookDroneSprayingMutation,
  useGetFarmerDroneBookingsQuery,
  useGetPilotDroneBookingsQuery,
  useUpdateDroneBookingStatusMutation,
  useGenerateSoilHealthCardMutation,
  useGetFarmerSoilCardsQuery,
  useGetSoilCardByIdQuery,
  useGetPrecisionStatsQuery,
} = agriPrecisionApi;
