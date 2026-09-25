'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateAddressMutation, useUpdateAddressMutation, Address } from '@/features/addresses/addressApi';
import { LocationSelector } from '@/features/addresses/components/LocationSelector';
import { toast } from 'sonner';
import { Loader2, LocateFixed, CheckCircle2, MapPin } from 'lucide-react';

const addressSchema = z.object({
  title: z.string().min(1).max(100),
  contactName: z.string().min(1).max(150),
  contactPhone: z.string().min(1).max(20),
  countryId: z.string().optional(),
  divisionId: z.string().optional(),
  districtId: z.string().optional(),
  upazilaId: z.string().optional(),
  unionId: z.string().optional(),
  areaId: z.string().optional(),
  streetAddress: z.string().min(1),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Address;
  isBn: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ initialData, isBn, onSuccess, onCancel }: AddressFormProps) {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: initialData?.title || '',
      contactName: initialData?.contactName || '',
      contactPhone: initialData?.contactPhone || '',
      countryId: initialData?.countryId || '',
      divisionId: initialData?.divisionId || '',
      districtId: initialData?.districtId || '',
      upazilaId: initialData?.upazilaId || '',
      unionId: initialData?.unionId || '',
      areaId: initialData?.areaId || '',
      streetAddress: initialData?.streetAddress || '',
      lat: initialData?.lat != null ? Number(initialData.lat) : null,
      lng: initialData?.lng != null ? Number(initialData.lng) : null,
      isDefault: initialData?.isDefault || false,
    },
  });

  // Cascade-reset dependent location dropdowns when a parent changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'divisionId') {
        form.setValue('districtId', '');
        form.setValue('upazilaId', '');
        form.setValue('unionId', '');
        form.setValue('areaId', '');
      } else if (name === 'districtId') {
        form.setValue('upazilaId', '');
        form.setValue('unionId', '');
        form.setValue('areaId', '');
      } else if (name === 'upazilaId') {
        form.setValue('unionId', '');
        form.setValue('areaId', '');
      } else if (name === 'unionId') {
        form.setValue('areaId', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const watchedLat = form.watch('lat');
  const watchedLng = form.watch('lng');
  const hasPinnedLocation = watchedLat != null && watchedLng != null;

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setShowManualInput(true);
      return;
    }
    setIsGettingLocation(true);

    const applyCoords = (position: GeolocationPosition) => {
      const lat = parseFloat(position.coords.latitude.toFixed(8));
      const lng = parseFloat(position.coords.longitude.toFixed(8));
      form.setValue('lat', lat);
      form.setValue('lng', lng);
      setIsGettingLocation(false);
      setShowManualInput(false);
      toast.success(isBn ? 'লোকেশন সেট করা হয়েছে ✓' : 'Location pinned successfully ✓');
    };

    // Use maximumAge:Infinity first — returns any cached position instantly
    // then fall back to a fresh low-accuracy fix if no cache exists
    navigator.geolocation.getCurrentPosition(
      applyCoords,
      () => {
        // No cached position — try a fresh low-accuracy fix (WiFi/IP)
        navigator.geolocation.getCurrentPosition(
          applyCoords,
          (_err) => {
            setIsGettingLocation(false);
            // Auto-detection failed — show manual input instead of an error
            setShowManualInput(true);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
        );
      },
      { enableHighAccuracy: false, timeout: 1000, maximumAge: Infinity },
    );
  };

  const handleManualPin = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error(isBn ? 'সঠিক Latitude ও Longitude দিন' : 'Enter valid Latitude and Longitude values');
      return;
    }
    form.setValue('lat', parseFloat(lat.toFixed(8)));
    form.setValue('lng', parseFloat(lng.toFixed(8)));
    setShowManualInput(false);
    toast.success(isBn ? 'লোকেশন সেট করা হয়েছে ✓' : 'Location pinned successfully ✓');
  };

  const isSaving = isCreating || isUpdating;

  const handleSubmit = async (data: AddressFormValues) => {
    try {
      if (initialData) {
        await updateAddress({ id: initialData.id, body: data }).unwrap();
        toast.success(isBn ? 'অ্যাড্রেস আপডেট করা হয়েছে' : 'Address updated successfully');
      } else {
        await createAddress(data).unwrap();
        toast.success(isBn ? 'নতুন অ্যাড্রেস যোগ করা হয়েছে' : 'New address added successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || (isBn ? 'সমস্যা হয়েছে' : 'An error occurred'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isBn ? 'অ্যাড্রেস টাইটেল (যেমন: বাসা, অফিস)' : 'Address Title (e.g., Home, Office)'}</FormLabel>
              <FormControl>
                <Input placeholder={isBn ? 'বাসা' : 'Home'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'যোগাযোগের নাম' : 'Contact Name'}</FormLabel>
                <FormControl>
                  <Input placeholder={isBn ? 'রাকিব হাসান' : 'John Doe'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'যোগাযোগের নম্বর' : 'Contact Phone'}</FormLabel>
                <FormControl>
                  <Input placeholder="+8801..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Dropdowns (Division → District → Upazila → Union → Area) */}
        <div className="rounded-lg border p-4 bg-muted/30">
          <h4 className="mb-4 text-sm font-medium">
            {isBn ? 'লোকেশন নির্বাচন করুন' : 'Location Details'}
          </h4>
          <LocationSelector form={form} />
        </div>

        {/* Street Address */}
        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isBn ? 'বিস্তারিত ঠিকানা' : 'Street Address'}</FormLabel>
              <FormControl>
                <Input placeholder={isBn ? 'বাড়ি/রোড নং, ল্যান্ডমার্ক' : 'House/Road No, Landmark'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GPS Location Pin */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {isBn ? 'জিপিএস লোকেশন (ঐচ্ছিক)' : 'GPS Location (Optional)'}
              </span>
            </div>
            {hasPinnedLocation && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isBn ? 'পিন করা হয়েছে' : 'Pinned'}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {isBn
              ? 'লাইভ ট্র্যাকিং-এর জন্য আপনার বর্তমান অবস্থান পিন করুন। রাইডার সরাসরি আপনার দরজায় পৌঁছাতে পারবে।'
              : 'Pin your exact location for live delivery tracking. The rider will navigate directly to your door.'}
          </p>

          {showManualInput ? (
            /* Manual coordinate entry — for when OS location services are blocked */
            <div className="space-y-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {isBn
                  ? 'স্বয়ংক্রিয় লোকেশন পাওয়া যায়নি। Google Maps থেকে কপি করে ম্যানুয়ালি দিন:'
                  : 'Auto-detection unavailable. Paste your coordinates from Google Maps:'}
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline underline-offset-2"
              >
                {isBn ? 'Google Maps খুলুন →' : 'Open Google Maps →'}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="23.8103"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="90.4125"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleManualPin} className="flex-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  {isBn ? 'পিন করুন' : 'Pin Location'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                  {isBn ? 'আবার চেষ্টা' : 'Retry Auto'}
                </Button>
              </div>
            </div>
          ) : hasPinnedLocation ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-2 gap-2 text-xs font-mono bg-background rounded-md border px-3 py-2 text-muted-foreground">
                <span>Lat: {watchedLat?.toFixed(6)}</span>
                <span>Lng: {watchedLng?.toFixed(6)}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <LocateFixed className="w-3.5 h-3.5" />
                }
                {isBn ? 'আপডেট' : 'Update'}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <LocateFixed className="w-4 h-4 mr-2" />
              }
              {isGettingLocation
                ? (isBn ? 'লোকেশন খোঁজা হচ্ছে...' : 'Getting location...')
                : (isBn ? 'বর্তমান লোকেশন ব্যবহার করুন' : 'Use My Current Location')}
            </Button>
          )}
        </div>

        {/* Default Address Toggle */}
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 space-y-0 pt-1">
              <FormControl>
                <Switch
                  id="isDefault"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel htmlFor="isDefault" className="font-normal cursor-pointer">
                {isBn ? 'এটি আমার ডিফল্ট ঠিকানা হিসেবে সেট করুন' : 'Set as my default address'}
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData
              ? (isBn ? 'আপডেট করুন' : 'Update Address')
              : (isBn ? 'সেভ করুন' : 'Save Address')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
