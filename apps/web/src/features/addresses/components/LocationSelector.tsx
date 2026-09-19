/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGetCountriesQuery,
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetUpazilasQuery,
  useGetUnionsQuery,
  useGetAreasQuery,
} from '../../locations/locationApi';

interface LocationSelectorProps {
  form: UseFormReturn<any>;
}

export function LocationSelector({ form }: LocationSelectorProps) {
  const countryId = form.watch('countryId');
  const divisionId = form.watch('divisionId');
  const districtId = form.watch('districtId');
  const upazilaId = form.watch('upazilaId');
  const unionId = form.watch('unionId');

  const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery();
  const { data: divisions, isLoading: isLoadingDivisions } = useGetDivisionsQuery(countryId, { skip: !countryId });
  const { data: districts, isLoading: isLoadingDistricts } = useGetDistrictsQuery(divisionId, { skip: !divisionId });
  const { data: upazilas, isLoading: isLoadingUpazilas } = useGetUpazilasQuery(districtId, { skip: !districtId });
  const { data: unions, isLoading: isLoadingUnions } = useGetUnionsQuery(upazilaId, { skip: !upazilaId });
  const { data: areas, isLoading: isLoadingAreas } = useGetAreasQuery(unionId, { skip: !unionId });

  // Auto-select first country if none selected and data is loaded (Khansama-first default)
  useEffect(() => {
    if (countries?.length && !countryId) {
      form.setValue('countryId', countries[0].id);
    }
  }, [countries, countryId, form]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Division */}
      <FormField
        control={form.control}
        name="divisionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Division</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingDivisions || !divisions?.length}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {divisions?.map((div) => (
                  <SelectItem key={div.id} value={div.id}>{div.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* District */}
      <FormField
        control={form.control}
        name="districtId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>District</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingDistricts || !districts?.length}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {districts?.map((dist) => (
                  <SelectItem key={dist.id} value={dist.id}>{dist.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Upazila */}
      <FormField
        control={form.control}
        name="upazilaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upazila</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingUpazilas || !upazilas?.length}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Upazila" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {upazilas?.map((upa) => (
                  <SelectItem key={upa.id} value={upa.id}>{upa.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Union */}
      <FormField
        control={form.control}
        name="unionId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Union</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingUnions || !unions?.length}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Union" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {unions?.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>{uni.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Area */}
      <FormField
        control={form.control}
        name="areaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area / Village</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingAreas || !areas?.length}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {areas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.nameEn} (Fee: ৳{area.deliveryFee})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
