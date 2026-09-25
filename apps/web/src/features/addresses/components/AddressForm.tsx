'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LocationSelector } from './LocationSelector';
import { useCreateAddressMutation, useUpdateAddressMutation, Address } from '../addressApi';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { LocateFixed, Loader2, CheckCircle2, MapPin } from 'lucide-react';

const addressSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  contactName: z.string().min(1, 'Contact Name is required').max(150),
  contactPhone: z.string().min(1, 'Contact Phone is required').max(20),
  countryId: z.string().optional(),
  divisionId: z.string().optional(),
  districtId: z.string().optional(),
  upazilaId: z.string().optional(),
  unionId: z.string().optional(),
  areaId: z.string().optional(),
  streetAddress: z.string().min(1, 'Street address is required'),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Address | null;
  onSuccess?: () => void;
}

export function AddressForm({ initialData, onSuccess }: AddressFormProps) {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [pinned, setPinned] = useState(
    initialData?.lat != null && initialData?.lng != null
      ? { lat: Number(initialData.lat), lng: Number(initialData.lng) }
      : null
  );

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

  // Reset dependent location fields when parent changes
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
      setPinned({ lat, lng });
      setIsGettingLocation(false);
      setShowManualInput(false);
      toast.success('Location pinned successfully ✓');
    };

    // Attempt 1: use any cached position (instant)
    navigator.geolocation.getCurrentPosition(
      applyCoords,
      () => {
        // Attempt 2: fresh low-accuracy fix (WiFi/IP)
        navigator.geolocation.getCurrentPosition(
          applyCoords,
          (_err) => {
            setIsGettingLocation(false);
            setShowManualInput(true); // show manual input instead of error
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
      toast.error('Enter valid Latitude and Longitude values');
      return;
    }
    form.setValue('lat', parseFloat(lat.toFixed(8)));
    form.setValue('lng', parseFloat(lng.toFixed(8)));
    setPinned({ lat, lng });
    setShowManualInput(false);
    toast.success('Location pinned successfully ✓');
  };

  async function onSubmit(data: AddressFormValues) {
    try {
      if (initialData) {
        await updateAddress({ id: initialData.id, body: data }).unwrap();
        toast.success('Address updated successfully');
      } else {
        await createAddress(data).unwrap();
        toast.success('Address saved successfully');
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save address');
      console.error(error);
    }
  }

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Home, Office" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+8801..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border p-4 bg-muted/30">
          <h4 className="mb-4 text-sm font-medium">Location Details</h4>
          <LocationSelector form={form} />
        </div>

        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="House/Road No, Landmark" {...field} />
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
              <span className="text-sm font-medium">GPS Location (Optional)</span>
            </div>
            {pinned && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pinned
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Pin your exact GPS coordinates so the rider can navigate directly to your door with live tracking.
          </p>

          {showManualInput ? (
            <div className="space-y-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Auto-detection unavailable. Paste coordinates from Google Maps:
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline underline-offset-2"
              >
                Open Google Maps →
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
                  Pin Location
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                  Retry Auto
                </Button>
              </div>
            </div>
          ) : pinned ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-2 gap-2 text-xs font-mono bg-background rounded-md border px-3 py-2 text-muted-foreground">
                <span>Lat: {pinned.lat.toFixed(6)}</span>
                <span>Lng: {pinned.lng.toFixed(6)}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                Update
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
              {isGettingLocation ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LocateFixed className="w-4 h-4 mr-2" />
              )}
              {isGettingLocation ? 'Getting location...' : 'Use My Current Location'}
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
