import type { Schema } from './common.js';

export type Country = Schema<'CountryResponseDto'>;
export type Division = Schema<'DivisionResponseDto'>;
export type District = Schema<'DistrictResponseDto'>;
export type Upazila = Schema<'UpazilaResponseDto'>;
export type Union = Schema<'UnionResponseDto'>;
export type Area = Schema<'AreaResponseDto'>;

export type Address = Schema<'AddressResponseDto'>;
export type LocationReference = Schema<'LocationReferenceDto'>;
export type CreateAddressRequest = Schema<'CreateAddressDto'>;
export type UpdateAddressRequest = Schema<'UpdateAddressDto'>;
