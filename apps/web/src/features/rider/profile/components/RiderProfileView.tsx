'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Bike, Mail, Phone, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorState } from '@/components/common/ErrorState';
import {
  RiderProfile,
  useGetRiderProfileQuery,
  useUpdateRiderProfileMutation,
} from '@/features/riders/ridersApi';

export interface RiderProfileViewProps {
  lang?: string;
}

const VEHICLE_TYPES = ['BIKE', 'MOTORCYCLE', 'BICYCLE', 'SCOOTER', 'WALKING'] as const;

function ProfileEditForm({ profile, isBn }: { profile: RiderProfile; isBn: boolean }) {
  const [updateProfile, { isLoading: isSaving }] = useUpdateRiderProfileMutation();

  const [address, setAddress] = useState(profile.address ?? '');
  const [preferredZone, setPreferredZone] = useState(profile.preferredZone ?? '');
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact ?? '');
  const [vehicleType, setVehicleType] = useState<string>(profile.vehicleType || 'BIKE');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(profile.vehiclePlateNumber ?? '');

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({
        address,
        preferredZone,
        emergencyContact,
        vehicleType,
        vehiclePlateNumber,
      }).unwrap();
      toast.success(isBn ? 'প্রোফাইল সংরক্ষণ হয়েছে' : 'Profile updated successfully');
    } catch {
      toast.error(isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Could not save your profile');
    }
  };

  return (
    <Card className="rounded-2xl border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bike className="h-4 w-4 text-primary" />
          {isBn ? 'যানবাহন ও যোগাযোগ' : 'Vehicle & Contact'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{isBn ? 'যানবাহনের ধরন' : 'Vehicle Type'}</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">{isBn ? 'নম্বর প্লেট' : 'Plate Number'}</Label>
              <Input
                id="plate"
                value={vehiclePlateNumber}
                onChange={(event) => setVehiclePlateNumber(event.target.value)}
                placeholder="DHK-METRO-HA-0000"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone">{isBn ? 'কাজের এলাকা' : 'Service Zone'}</Label>
            <Input
              id="zone"
              value={preferredZone}
              onChange={(event) => setPreferredZone(event.target.value)}
              placeholder={isBn ? 'যেমন: দেবীগঞ্জ সদর' : 'e.g. Debiganj Sadar'}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{isBn ? 'ঠিকানা' : 'Address'}</Label>
            <Input
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={isBn ? 'আপনার ঠিকানা' : 'Your address'}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency">{isBn ? 'জরুরি যোগাযোগ' : 'Emergency Contact'}</Label>
            <Input
              id="emergency"
              value={emergencyContact}
              onChange={(event) => setEmergencyContact(event.target.value)}
              placeholder="017... (Relationship)"
              className="h-11"
            />
          </div>

          <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isSaving}>
            {isSaving
              ? isBn
                ? 'সংরক্ষণ হচ্ছে...'
                : 'Saving...'
              : isBn
                ? 'সংরক্ষণ করুন'
                : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function RiderProfileView({ lang = 'en' }: RiderProfileViewProps) {
  const isBn = lang === 'bn';

  const { data: profile, isLoading, isError, refetch } = useGetRiderProfileQuery();

  if (isLoading) {
    return (
      <div className="space-y-5 pt-2">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="pt-2">
        <ErrorState isBn={isBn} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Identity */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold text-foreground">{profile.fullName}</h1>
              {profile.isVerified && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <BadgeCheck className="h-3 w-3" />
                  {isBn ? 'ভেরিফাইড' : 'Verified'}
                </Badge>
              )}
            </div>
            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {profile.phone}
              </p>
              {profile.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{profile.email}</span>
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={profile.availability === 'OFFLINE' ? 'secondary' : 'default'}
            className="shrink-0 text-[10px] uppercase"
          >
            {profile.availability}
          </Badge>
        </CardContent>
      </Card>

      {/* Verified identity (read-only) */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {isBn ? 'যাচাইকৃত তথ্য' : 'Verified Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{isBn ? 'জাতীয় পরিচয়পত্র নম্বর' : 'National ID'}</Label>
            <Input value={profile.nidNumber || '—'} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? 'ড্রাইভিং লাইসেন্স' : 'Driving License'}</Label>
            <Input value={profile.drivingLicenseNumber || '—'} readOnly className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Remounts when the profile is (re)fetched so the form reflects server state. */}
      <ProfileEditForm
        key={`${profile.userId}-${profile.updatedAt}`}
        profile={profile}
        isBn={isBn}
      />
    </div>
  );
}
