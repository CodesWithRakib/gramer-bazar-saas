import { api } from '../../store/api';

export interface Location {
  id: string;
  nameEn: string;
  nameBn: string;
  isActive: boolean;
}

export interface Area extends Location {
  deliveryFee: number;
}

export const locationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<Location[], void>({
      query: () => '/locations/countries',
      providesTags: ['Location'],
    }),
    getDivisions: builder.query<Location[], string | undefined>({
      query: (countryId) => ({
        url: '/locations/divisions',
        params: { countryId },
      }),
      providesTags: ['Location'],
    }),
    getDistricts: builder.query<Location[], string | undefined>({
      query: (divisionId) => ({
        url: '/locations/districts',
        params: { divisionId },
      }),
      providesTags: ['Location'],
    }),
    getUpazilas: builder.query<Location[], string | undefined>({
      query: (districtId) => ({
        url: '/locations/upazilas',
        params: { districtId },
      }),
      providesTags: ['Location'],
    }),
    getUnions: builder.query<Location[], string | undefined>({
      query: (upazilaId) => ({
        url: '/locations/unions',
        params: { upazilaId },
      }),
      providesTags: ['Location'],
    }),
    getAreas: builder.query<Area[], string | undefined>({
      query: (unionId) => ({
        url: '/locations/areas',
        params: { unionId },
      }),
      providesTags: ['Location'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCountriesQuery,
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetUpazilasQuery,
  useGetUnionsQuery,
  useGetAreasQuery,
} = locationApi;
