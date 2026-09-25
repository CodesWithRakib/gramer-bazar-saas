'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { userHasRole } from '@/lib/roles';
import {
  useSubmitRiderApplicationMutation,
  useGetMyRiderApplicationQuery,
} from '@/features/applications/applicationsApi';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Coins,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  Bike,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function BecomeARiderPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const router = useRouter();
  const isBn = lang === 'bn';

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isAlreadyRider = userHasRole(user, 'RIDER');

  const { data: myApp, refetch } = useGetMyRiderApplicationQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [submitApp, { isLoading: isSubmitting }] = useSubmitRiderApplicationMutation();

  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    email: user?.email || '',
    nidNumber: '',
    vehicleType: 'BIKE',
    vehiclePlateNumber: '',
    drivingLicenseNumber: '',
    preferredZone: 'Khansama Sadar',
    emergencyContact: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await submitApp({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        nidNumber: formData.nidNumber.trim(),
        vehicleType: formData.vehicleType,
        vehiclePlateNumber: formData.vehiclePlateNumber.trim() || undefined,
        drivingLicenseNumber: formData.drivingLicenseNumber.trim() || undefined,
        preferredZone: formData.preferredZone.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
      }).unwrap();

      toast.success(
        isBn
          ? 'আবেদনটি সফলভাবে জমা দেওয়া হয়েছে!'
          : 'Application submitted! Our team will review your rider credentials.'
      );
      refetch();
    } catch (err) {
      const msg =
        getApiErrorMessage(err) ||
        (isBn ? 'আবেদন জমা দিতে ব্যর্থ হয়েছে' : 'Failed to submit application');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-500/10 via-background to-background py-16 md:py-24 border-b">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-semibold text-blue-600">
            <Bike className="w-4 h-4" />
            <span>{isBn ? 'গ্রামের বাজার রাইডার পার্টনার' : 'Gramer Bazar Rider Partner'}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            {isBn ? 'নিজের সুবিধাজনক সময়ে ডেলিভারি দিন, আয় করুন সম্মানজনক অর্থ' : 'Earn With Pride in Your Own Community'}
          </h1>

          <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg leading-relaxed">
            {isBn
              ? 'বাইক, সাইকেল বা স্কুটারে আপনার ইউনিয়নে তাজা মুদি ও পণ্য ডেলিভারি করুন। সাপ্তাহিক পেমেন্ট এবং বোনাস সুবিধা উপভোগ করুন।'
              : 'Flexible local shifts, competitive per-delivery payouts, and weekly settlements. Become an essential delivery hero connecting village markets to doorstep.'}
          </p>

          {!isAuthenticated && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-2xl px-8 shadow-md" asChild>
                <Link href={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/become-a-rider`)}`}>
                  {isBn ? 'লগইন করে আবেদন করুন' : 'Login to Apply'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl px-8" asChild>
                <Link href={`/${lang}/register`}>
                  {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Free Account'}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Perks */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{isBn ? 'প্রতি ডেলিভারিতে নিশ্চিত আয়' : 'Guaranteed Trip Earnings'}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'দূরত্ব অনুযায়ী স্বচ্ছ ডেলিভারি চার্জ এবং বেশি ডেলিভারির জন্য অতিরিক্ত বোনাস।'
                : 'Fair distance-based trip payouts with weekly direct bank or bKash transfers.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{isBn ? 'কাজের পূর্ণ স্বাধীনতা' : 'Flexible Hours'}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'যখন ইচ্ছা অনলাইন হোন। কোনো নির্দিষ্ট সময়ের বাধ্যবাধকতা নেই।'
                : 'Turn your status online whenever you are free. Full control over your daily schedule.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">{isBn ? 'স্থানীয় এরিয়ায় ডেলিভারি' : 'Local Neighborhoods'}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'আপনার চেনা ইউনিয়ন এবং উপজেলায় কাজ করার সুবিধা, কোনো অজানা রুটের চাপ নেই।'
                : 'Deliver inside your familiar upazila roads with real-time GPS route assistance.'}
            </p>
          </div>
        </div>
      </section>

      {/* Form or Status */}
      <section className="container max-w-3xl mx-auto px-4 py-8">
        {isAlreadyRider ? (
          <div className="p-8 rounded-3xl bg-card border shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">
              {isBn ? 'আপনি একজন অনুমোদিত রাইডার!' : 'You Are an Approved Rider!'}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isBn
                ? 'আপনার রাইডার প্রোফাইল সক্রিয় রয়েছে। রাইডার পোর্টালে গিয়ে ডেলিভারি গ্রহণ ও ট্র্যাক করুন।'
                : 'Your rider account is active. Open your rider dashboard to accept new local deliveries.'}
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="rounded-2xl px-8 shadow-sm">
                <Link href={`/${lang}/rider`}>
                  {isBn ? 'রাইডার অ্যাপ খুলুন' : 'Open Rider Portal'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        ) : myApp ? (
          <div className="p-8 rounded-3xl bg-card border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {isBn ? 'আপনার আবেদনের বর্তমান অবস্থা' : 'Your Rider Application Status'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn ? 'জমা দেওয়ার তারিখ:' : 'Submitted on:'} {new Date(myApp.createdAt).toLocaleDateString()}
                </p>
              </div>

              {myApp.status === 'PENDING' && (
                <Badge className="bg-amber-50 text-amber-800 border-amber-300 gap-1.5 px-3 py-1 text-sm font-semibold">
                  <Clock className="w-4 h-4" />
                  {isBn ? 'পর্যালোচনাধীন' : 'Under Review'}
                </Badge>
              )}

              {myApp.status === 'APPROVED' && (
                <Badge className="bg-emerald-500 text-white gap-1.5 px-3 py-1 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {isBn ? 'অনুমোদিত' : 'Approved'}
                </Badge>
              )}

              {myApp.status === 'REJECTED' && (
                <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm font-semibold">
                  <XCircle className="w-4 h-4" />
                  {isBn ? 'বাতিল' : 'Rejected'}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">{isBn ? 'নাম' : 'Name'}</span>
                <span className="font-semibold">{myApp.fullName}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</span>
                <span className="font-semibold">{myApp.phone}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{isBn ? 'যানবাহন' : 'Vehicle'}</span>
                <span className="font-medium">{myApp.vehicleType}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{isBn ? 'পছন্দের জোন' : 'Preferred Zone'}</span>
                <span>{myApp.preferredZone || '—'}</span>
              </div>
            </div>

            {myApp.status === 'PENDING' && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-sm text-muted-foreground flex gap-3 items-start">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  {isBn
                    ? 'আমাদের অপারেশন টিম আপনার জাতীয় পরিচয়পত্র এবং যানবাহনের বিবরণ যাচাই করছে। অনুমোদনের পর আপনি অর্ডার ডেলিভারি শুরু করতে পারবেন।'
                    : 'Our verification team is vetting your license and vehicle details. Once verified, your rider account will be immediately activated.'}
                </p>
              </div>
            )}

            {myApp.status === 'REJECTED' && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <span className="font-bold block mb-1">{isBn ? 'বাতিলের কারণ:' : 'Reason:'}</span>
                <p>{myApp.adminNotes || (isBn ? 'প্রদত্ত তথ্য অসঙ্গতিপূর্ণ।' : 'Submitted details did not meet the criteria.')}</p>
              </div>
            )}

            {myApp.status === 'APPROVED' && (
              <div className="pt-2 text-center">
                <Button asChild size="lg" className="rounded-2xl px-8 shadow-sm">
                  <Link href={`/${lang}/rider`}>
                    {isBn ? 'রাইডার অ্যাপ খুলুন' : 'Open Rider Portal'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : !isAuthenticated ? (
          <div className="p-8 rounded-3xl bg-card border shadow-sm text-center space-y-4">
            <h2 className="text-2xl font-bold">{isBn ? 'আবেদন করতে সাইন ইন করুন' : 'Sign In to Apply'}</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isBn
                ? 'রাইডার পার্টনার হতে অনুগ্রহ করে প্রথমে লগইন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।'
                : 'To submit your rider application, sign in with your customer account.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button asChild className="rounded-xl px-6">
                <Link href={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/become-a-rider`)}`}>
                  {isBn ? 'লগইন' : 'Login'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-6">
                <Link href={`/${lang}/register`}>
                  {isBn ? 'রেজিস্টার' : 'Register'}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="p-8 rounded-3xl bg-card border shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isBn ? 'রাইডার আবেদন ফরম' : 'Rider Partner Application Form'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isBn
                  ? 'আপনার সঠিক ব্যক্তিগত ও যানবাহনের বিবরণ দিয়ে ফরমটি পূরণ করুন।'
                  : 'Submit accurate personal and vehicle credentials for safety verification.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{isBn ? 'পূর্ণ নাম' : 'Full Legal Name'}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  placeholder="Md. Rahim Uddin"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    placeholder="01711223344"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="rider@example.com"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nidNumber">{isBn ? 'এনআইডি নম্বর' : 'National ID No.'}</Label>
                  <Input
                    id="nidNumber"
                    value={formData.nidNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, nidNumber: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    placeholder="1990123456789"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? 'যানবাহনের ধরন' : 'Vehicle Type'}</Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(val) => setFormData((p) => ({ ...p, vehicleType: val }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">{isBn ? 'মোটরসাইকেল (Bike)' : 'Motorcycle (Bike)'}</SelectItem>
                      <SelectItem value="BICYCLE">{isBn ? 'বাইসাইকেল (Bicycle)' : 'Bicycle'}</SelectItem>
                      <SelectItem value="SCOOTER">{isBn ? 'স্কুটার (Scooter)' : 'Scooter'}</SelectItem>
                      <SelectItem value="WALKING">{isBn ? 'হাঁটা (Walking/Local)' : 'Walking / Foot'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vehiclePlateNumber">
                    {isBn ? 'যানবাহন নম্বর (বাইকের ক্ষেত্রে)' : 'Plate Number (if motorized)'}
                  </Label>
                  <Input
                    id="vehiclePlateNumber"
                    value={formData.vehiclePlateNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, vehiclePlateNumber: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="DINAJPUR-HA-1234"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="drivingLicenseNumber">
                    {isBn ? 'ড্রাইভিং লাইসেন্স নম্বর' : 'Driving License No.'}
                  </Label>
                  <Input
                    id="drivingLicenseNumber"
                    value={formData.drivingLicenseNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, drivingLicenseNumber: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="DL-882736"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="preferredZone">{isBn ? 'পছন্দের ডেলিভারি জোন' : 'Preferred Zone'}</Label>
                  <Input
                    id="preferredZone"
                    value={formData.preferredZone}
                    onChange={(e) => setFormData((p) => ({ ...p, preferredZone: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="Khansama Sadar / Bhabanipur"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyContact">
                    {isBn ? 'জরুরি যোগাযোগের নম্বর' : 'Emergency Contact'}
                  </Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData((p) => ({ ...p, emergencyContact: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="01799887766 (Brother)"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-2xl shadow-sm mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isBn
                    ? 'আবেদন জমা হচ্ছে...'
                    : 'Submitting Application...'
                  : isBn
                  ? 'আবেদন জমা দিন'
                  : 'Submit Rider Application'}
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
