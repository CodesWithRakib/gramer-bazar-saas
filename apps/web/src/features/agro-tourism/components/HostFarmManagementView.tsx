'use client';

import React, { useState } from 'react';
import {
  Trees,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Lock,
  KeyRound,
  ShieldCheck,
  Calendar,
  Users,
  MapPin,
  Bed,
  UtensilsCrossed,
  DollarSign,
  Sun,
  Flame,
  Sparkles,
  Phone,
} from 'lucide-react';
import {
  useGetHostListingsQuery,
  useGetHostBookingsQuery,
  useCreateFarmStayMutation,
  useCreateExperienceMutation,
  useVerifyCheckInMutation,
  FarmStayListing,
  StayType,
  ExperienceCategory,
} from '../agroTourismApi';

export const HostFarmManagementView: React.FC = () => {
  const { data: listingsData, isLoading: isListingsLoading } = useGetHostListingsQuery();
  const { data: bookingsData, isLoading: isBookingsLoading } = useGetHostBookingsQuery();

  const [createStay, { isLoading: isCreatingStay }] = useCreateFarmStayMutation();
  const [createExp, { isLoading: isCreatingExp }] = useCreateExperienceMutation();
  const [verifyPin, { isLoading: isVerifyingPin }] = useVerifyCheckInMutation();

  const [showAddStayModal, setShowAddStayModal] = useState<boolean>(false);
  const [showAddExpModal, setShowAddExpModal] = useState<boolean>(false);
  const [selectedStayForExp, setSelectedStayForExp] = useState<string>('');

  // PIN Verification State
  const [verifyBookingNumber, setVerifyBookingNumber] = useState<string>('');
  const [verifyPinCode, setVerifyPinCode] = useState<string>('');
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);
  const [verifyErrorMsg, setVerifyErrorMsg] = useState<string | null>(null);

  // New Stay Form State
  const [titleEn, setTitleEn] = useState<string>('Bao-r Cottage & Organic Fruit Farm');
  const [titleBn, setTitleBn] = useState<string>('বাঁওড় কটেজ ও অর্গানিক ফলবাগান');
  const [stayType, setStayType] = useState<StayType>('TRADITIONAL_MUD_HOUSE');
  const [district, setDistrict] = useState<string>('Jashore');
  const [upazila, setUpazila] = useState<string>('Chaugachha');
  const [villageAddress, setVillageAddress] = useState<string>('Singhejulia Baor Belt');
  const [hostName, setHostName] = useState<string>('Mokhlesur Rahman');
  const [hostPhone, setHostPhone] = useState<string>('01819345678');
  const [maxGuests, setMaxGuests] = useState<number>(6);
  const [bedroomCount, setBedroomCount] = useState<number>(2);
  const [bedCount, setBedCount] = useState<number>(3);
  const [nightlyRateBdt, setNightlyRateBdt] = useState<number>(2800);
  const [weekendRateBdt, setWeekendRateBdt] = useState<number>(3400);
  const [mealRate, setMealRate] = useState<number>(650);
  const [hasSolarElectricity, setHasSolarElectricity] = useState<boolean>(true);
  const [hasClayStoveCooking, setHasClayStoveCooking] = useState<boolean>(true);
  const [hasOrganicHarvest, setHasOrganicHarvest] = useState<boolean>(true);
  const [description, setDescription] = useState<string>(
    'Authentic village clay house with natural airflow, pond fishing, and evening baul songs.'
  );

  // New Experience Form State
  const [expTitleEn, setExpTitleEn] = useState<string>('Baor Dingi Fishing & Catch-and-Cook');
  const [expTitleBn, setExpTitleBn] = useState<string>('ডিঙ্গি নৌকায় মাছ ধরা ও রান্না');
  const [expCategory, setExpCategory] = useState<ExperienceCategory>('TRADITIONAL_FISHING_CATCH_COOK');
  const [expDuration, setExpDuration] = useState<number>(3.5);
  const [expPrice, setExpPrice] = useState<number>(600);

  const listings = listingsData?.data || [];
  const bookings = bookingsData?.data || [];

  const handleVerifyCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifySuccessMsg(null);
    setVerifyErrorMsg(null);

    try {
      await verifyPin({
        bookingNumber: verifyBookingNumber.trim(),
        checkInPinCode: verifyPinCode.trim(),
      }).unwrap();

      setVerifySuccessMsg(`Guest check-in confirmed for #${verifyBookingNumber}! Escrow payout unlocked.`);
      setVerifyBookingNumber('');
      setVerifyPinCode('');
    } catch (err: any) {
      setVerifyErrorMsg(err?.data?.message || 'Verification failed. Please check booking number and PIN.');
    }
  };

  const handleCreateStay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStay({
        titleEn,
        titleBn,
        stayType,
        district,
        upazila,
        villageAddress,
        hostName,
        hostPhone,
        maxGuests: Number(maxGuests),
        bedroomCount: Number(bedroomCount),
        bedCount: Number(bedCount),
        nightlyRateBdt: Number(nightlyRateBdt),
        weekendRateBdt: Number(weekendRateBdt),
        allInclusiveMealCostPerPerson: Number(mealRate),
        hasSolarElectricity,
        hasClayStoveCooking,
        hasOrganicFarmHarvestAccess: hasOrganicHarvest,
        description,
      }).unwrap();

      setShowAddStayModal(false);
    } catch (err) {
      console.error('Failed to create stay', err);
    }
  };

  const handleCreateExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStayForExp) return;

    try {
      await createExp({
        farmStayId: selectedStayForExp,
        titleEn: expTitleEn,
        titleBn: expTitleBn,
        category: expCategory,
        durationHours: Number(expDuration),
        pricePerPersonBdt: Number(expPrice),
        includesSafetyGear: true,
        includesFarmRefreshment: true,
      }).unwrap();

      setShowAddExpModal(false);
    } catch (err) {
      console.error('Failed to create experience', err);
    }
  };

  const totalEarningsBdt = bookings
    .filter((b) => b.escrowStatus === 'CHECKED_IN_VERIFIED' || b.escrowStatus === 'COMPLETED_PAYOUT_RELEASED')
    .reduce((sum, b) => sum + Number(b.totalAmountBdt) - Number(b.serviceFeeBdt), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-green-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Trees className="w-4 h-4" />
            <span>Village Farm Stay &amp; Eco-Host Terminal (গ্রামীন খামার কটেজ হোস্ট)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Farm Stay Host &amp; Eco-Experience Manager
          </h1>
          <p className="mt-2 text-xs lg:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Manage your village cottages, publish seasonal fruit-picking and fishing workshops, verify guest check-in
            secret PINs, and receive secure escrow payouts directly to your bKash or bank.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddStayModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-all shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Cottage (নতুন কটেজ)</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">MY ACTIVE COTTAGES</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            {listings.length} <span className="text-xs font-medium text-gray-400">Listed</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Available for online booking</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">RESERVED GUEST BOOKINGS</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-2">
            {bookings.length} <span className="text-xs font-medium text-gray-400">Total</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Escrow deposit locked &amp; guaranteed</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">UNLOCKED HOST EARNINGS</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ৳{totalEarningsBdt.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Net host revenue after check-in</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">ESCROW SAFETY RATING</div>
          <div className="text-2xl font-black text-amber-500 mt-2">100%</div>
          <div className="text-xs text-gray-500 mt-1">Zero payment dispute record</div>
        </div>
      </div>

      {/* Guest Check-In PIN Verification Desk */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Guest Arrival PIN Verification Desk (অতিথি আগমন ও পিন ভেরিফিকেশন)
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          When guests arrive at your farm cottage, request their secret 4-digit check-in PIN code from their booking voucher to verify arrival and unlock your escrow payout.
        </p>

        {verifySuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{verifySuccessMsg}</span>
          </div>
        )}

        {verifyErrorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-800 dark:text-red-200 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{verifyErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerifyCheckIn} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Booking Ref # (e.g. AGRO-2026-SR-1094)"
            value={verifyBookingNumber}
            onChange={(e) => setVerifyBookingNumber(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-xs w-full sm:w-64"
          />
          <input
            type="text"
            required
            maxLength={6}
            placeholder="4-digit PIN (e.g. 7482)"
            value={verifyPinCode}
            onChange={(e) => setVerifyPinCode(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-center text-sm tracking-widest w-full sm:w-40"
          />
          <button
            type="submit"
            disabled={isVerifyingPin}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isVerifyingPin ? 'Verifying...' : 'Verify Arrival & Unlock Escrow'}
          </button>
        </form>
      </div>

      {/* Host Cottages List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              My Farm Cottages &amp; Eco-Lodges ({listings.length})
            </h2>
          </div>
          <button
            onClick={() => {
              if (listings.length > 0) {
                setSelectedStayForExp(listings[0].id);
                setShowAddExpModal(true);
              }
            }}
            disabled={listings.length === 0}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-40"
          >
            + Add Activity Package
          </button>
        </div>

        {isListingsLoading ? (
          <div className="p-12 text-center text-gray-500 text-xs">Loading cottage listings...</div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs space-y-2">
            <Trees className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <div>You have not listed any farm cottages yet.</div>
            <button
              onClick={() => setShowAddStayModal(true)}
              className="text-emerald-600 font-bold hover:underline"
            >
              List your first cottage now &rarr;
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {listings.map((stay) => (
              <div key={stay.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">{stay.titleEn}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      {stay.stayType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{stay.villageAddress}, {stay.upazila}, {stay.district}</span>
                    <span>• {stay.maxGuests} Guests • {stay.bedroomCount} Beds</span>
                  </div>

                  {stay.experiences && stay.experiences.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {stay.experiences.map((exp) => (
                        <span
                          key={exp.id}
                          className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-medium"
                        >
                          {exp.titleEn} (৳{exp.pricePerPersonBdt})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-emerald-600">
                    ৳{Number(stay.nightlyRateBdt).toLocaleString()}{' '}
                    <span className="text-[10px] text-gray-400 font-normal">/ night (Weekend: ৳{stay.weekendRateBdt})</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Meals: ৳{stay.allInclusiveMealCostPerPerson}/person
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE COTTAGE MODAL */}
      {showAddStayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 my-8 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                List New Farm Stay Cottage (নতুন খামার কটেজ নিবন্ধন)
              </h3>
              <button
                onClick={() => setShowAddStayModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateStay} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Cottage Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Cottage Title (বাংলা)
                  </label>
                  <input
                    type="text"
                    required
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Stay Architecture Type
                  </label>
                  <select
                    value={stayType}
                    onChange={(e) => setStayType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  >
                    <option value="TRADITIONAL_MUD_HOUSE">Traditional Mud House (মাটির ঘর)</option>
                    <option value="TEA_ESTATE_ECO_COTTAGE">Tea Estate Cottage (চা বাগান কটেজ)</option>
                    <option value="MANGO_LITCHI_ORCHARD_CAMP">Orchard Agro-Camp (ফলবাগান ক্যাম্প)</option>
                    <option value="RIVER_BEEL_WATER_VILLA">River/Beel Villa (হাওর ওয়াটার হাউস)</option>
                    <option value="HILL_TRACT_BAMBOO_LODGE">Hill Bamboo Lodge (পাহাড়ি মাচাং)</option>
                    <option value="SUNDARBANS_MANGROVE_BORDER">Sundarbans Gher (সুন্দরবন কটেজ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Upazila</label>
                  <input
                    type="text"
                    required
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Village &amp; Landmark Address
                </label>
                <input
                  type="text"
                  required
                  value={villageAddress}
                  onChange={(e) => setVillageAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nightly Rate (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={nightlyRateBdt}
                    onChange={(e) => setNightlyRateBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Weekend Rate (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={weekendRateBdt}
                    onChange={(e) => setWeekendRateBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Meal/Person (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={mealRate}
                    onChange={(e) => setMealRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSolarElectricity}
                    onChange={(e) => setHasSolarElectricity(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Solar Electricity Backed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasClayStoveCooking}
                    onChange={(e) => setHasClayStoveCooking(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Clay Stove Kitchen Access</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOrganicHarvest}
                    onChange={(e) => setHasOrganicHarvest(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Organic Garden Harvest Access</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description &amp; Scenic Highlights
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddStayModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStay}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  {isCreatingStay ? 'Publishing...' : 'Publish Farm Cottage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXPERIENCE MODAL */}
      {showAddExpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Add Farm Activity Package
              </h3>
              <button
                onClick={() => setShowAddExpModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateExp} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Activity Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={expTitleEn}
                  onChange={(e) => setExpTitleEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Activity Title (বাংলা)
                </label>
                <input
                  type="text"
                  required
                  value={expTitleBn}
                  onChange={(e) => setExpTitleBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                  >
                    <option value="TRADITIONAL_FISHING_CATCH_COOK">Catch &amp; Cook Fishing</option>
                    <option value="FRUIT_HARVEST_TASTING">Fruit Orchard Harvesting</option>
                    <option value="ARTISANAL_HONEY_EXTRACTION">Honey Extraction</option>
                    <option value="CLAY_STOVE_VILLAGE_COOKING">Clay Stove Cooking</option>
                    <option value="ORGANIC_FARMING_HARVEST">Organic Harvest Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Price/Person (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={expPrice}
                    onChange={(e) => setExpPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={expDuration}
                  onChange={(e) => setExpDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddExpModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingExp}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  {isCreatingExp ? 'Saving...' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HostFarmManagementView;
