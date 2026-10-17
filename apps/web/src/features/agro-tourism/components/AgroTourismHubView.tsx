'use client';

import React, { useState } from 'react';
import {
  Trees,
  MapPin,
  Calendar,
  Users,
  UtensilsCrossed,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  Sun,
  Flame,
  Sailboat,
  Compass,
  ArrowRight,
  Phone,
  Bed,
  Check,
  Lock,
} from 'lucide-react';
import {
  useGetAgroTourismOverviewStatsQuery,
  useGetFarmStaysQuery,
  useGetAgroExperiencesQuery,
  useCalculateBookingPriceMutation,
  useCreateBookingMutation,
  FarmStayListing,
  StayType,
  MealPlanOption,
} from '../agroTourismApi';

export const AgroTourismHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STAYS' | 'EXPERIENCES' | 'COST_CALCULATOR'>('STAYS');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [selectedStayType, setSelectedStayType] = useState<string>('ALL');

  // Booking Modal State
  const [selectedStay, setSelectedStay] = useState<FarmStayListing | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>('2026-10-24');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-10-26');
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childCount, setChildCount] = useState<number>(0);
  const [mealPlan, setMealPlan] = useState<MealPlanOption>('ALL_INCLUSIVE_ORGANIC');
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>([]);
  const [guestName, setGuestName] = useState<string>('Tanvir Ahmed');
  const [guestPhone, setGuestPhone] = useState<string>('01819998877');
  const [guestNid, setGuestNid] = useState<string>('19922610580004123');
  const [specialRequests, setSpecialRequests] = useState<string>('Prefer morning village walk and fresh cow milk.');
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);
  const [bookingSuccessPin, setBookingSuccessPin] = useState<string | null>(null);

  // Standalone Calculator State
  const [calcNights, setCalcNights] = useState<number>(2);
  const [calcGuests, setCalcGuests] = useState<number>(3);
  const [calcMealPlan, setCalcMealPlan] = useState<MealPlanOption>('ALL_INCLUSIVE_ORGANIC');
  const [calcRatePerNight, setCalcRatePerNight] = useState<number>(3200);

  const { data: statsData } = useGetAgroTourismOverviewStatsQuery();
  const { data: staysData, isLoading: isStaysLoading } = useGetFarmStaysQuery({
    district: searchDistrict.trim() ? searchDistrict : undefined,
    stayType: selectedStayType !== 'ALL' ? (selectedStayType as StayType) : undefined,
  });
  const { data: expData, isLoading: isExpLoading } = useGetAgroExperiencesQuery();

  const [calculatePrice, { data: priceResult, isLoading: isCalculating }] = useCalculateBookingPriceMutation();
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

  const stats = statsData?.data;
  const stays = staysData?.data || [];
  const experiences = expData?.data || [];

  // Recalculate price when modal opens or selections change
  const handleOpenBookingModal = (stay: FarmStayListing) => {
    setSelectedStay(stay);
    setSelectedExpIds(stay.experiences?.map((e) => e.id) || []);
    setBookingSuccessCode(null);
    setBookingSuccessPin(null);

    calculatePrice({
      farmStayId: stay.id,
      checkInDate,
      checkOutDate,
      adultGuestsCount: adultCount,
      childGuestsCount: childCount,
      mealPlan,
      selectedExperienceIds: stay.experiences?.map((e) => e.id) || [],
    });
  };

  const handleUpdatePrice = (
    cIn = checkInDate,
    cOut = checkOutDate,
    adults = adultCount,
    children = childCount,
    meal = mealPlan,
    expIds = selectedExpIds,
  ) => {
    if (!selectedStay) return;
    calculatePrice({
      farmStayId: selectedStay.id,
      checkInDate: cIn,
      checkOutDate: cOut,
      adultGuestsCount: adults,
      childGuestsCount: children,
      mealPlan: meal,
      selectedExperienceIds: expIds,
    });
  };

  const handleToggleExp = (expId: string) => {
    const updated = selectedExpIds.includes(expId)
      ? selectedExpIds.filter((id) => id !== expId)
      : [...selectedExpIds, expId];
    setSelectedExpIds(updated);
    handleUpdatePrice(checkInDate, checkOutDate, adultCount, childCount, mealPlan, updated);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay) return;

    try {
      const res = await createBooking({
        farmStayId: selectedStay.id,
        checkInDate,
        checkOutDate,
        adultGuestsCount: Number(adultCount),
        childGuestsCount: Number(childCount),
        mealPlan,
        guestName,
        guestPhone,
        guestNidPassport: guestNid.trim() ? guestNid : undefined,
        specialRequests: specialRequests.trim() ? specialRequests : undefined,
        selectedExperienceIds: selectedExpIds,
      }).unwrap();

      setBookingSuccessCode(res.data.bookingNumber);
      setBookingSuccessPin(res.data.checkInPinCode);
    } catch (err) {
      console.error('Booking failed', err);
    }
  };

  // Calculator computations
  const calcStayTotal = calcNights * calcRatePerNight;
  const calcMealTotal =
    calcMealPlan === 'ALL_INCLUSIVE_ORGANIC'
      ? calcNights * calcGuests * 650
      : calcMealPlan === 'BREAKFAST_ONLY'
      ? calcNights * calcGuests * 180
      : calcMealPlan === 'SELF_COOKING_FARM_INGREDIENTS'
      ? calcNights * 350
      : 0;
  const calcGrandTotal = calcStayTotal + calcMealTotal + 200;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-amber-950 text-white shadow-2xl p-8 lg:p-12 border border-emerald-500/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Trees className="w-4 h-4 text-emerald-400" />
            <span>গ্রামীণ কৃষি পর্যটন, ফার্ম স্টে ও ইকোট্যুরিজম (Rural Agro-Tourism Hub)</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
            Authentic Village Farm Stays &amp; Agro-Experiences
          </h1>

          <p className="text-emerald-100/90 text-sm lg:text-base leading-relaxed">
            Escape the concrete city to traditional clay cottages (মাটির ঘর), rain-fed tea garden retreats in Sreemangal,
            sweet litchi orchard camps in Dinajpur, and coastal mangrove gher stays in the Sundarbans. Savor 100% organic
            farm meals and handcrafted village experiences.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NID Verified Village Hosts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-400" />
              <span>100% Escrow Protected Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>Farm-to-Plate Organic Meals</span>
            </div>
          </div>
        </div>

        {/* Overview Stats Badges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-emerald-700/40 pt-6">
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">Verified Eco-Stays</div>
            <div className="text-2xl lg:text-3xl font-black text-white mt-1">
              {stats?.totalFarmStays ?? 4} <span className="text-xs font-medium text-emerald-400">Locations</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">Active Village Hosts</div>
            <div className="text-2xl lg:text-3xl font-black text-white mt-1">
              {stats?.activeVerifiedHosts ?? 4} <span className="text-xs font-medium text-emerald-400">Families</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">Guest Reservations</div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-300 mt-1">
              {stats?.totalActiveBookings ?? 1} <span className="text-xs font-medium text-white">Reserved</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">Rural Host Payouts</div>
            <div className="text-2xl lg:text-3xl font-black text-amber-300 mt-1">
              ৳{(stats?.totalRuralTourismRevenueBdt ?? 11850).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-2">
        <button
          onClick={() => setActiveTab('STAYS')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'STAYS'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Farm Stays &amp; Cottages ({stays.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPERIENCES')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'EXPERIENCES'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Agro-Activities &amp; Workshops ({experiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COST_CALCULATOR')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'COST_CALCULATOR'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tour &amp; Meal Cost Calculator</span>
        </button>
      </div>

      {/* TAB 1: FARM STAYS & COTTAGES */}
      {activeTab === 'STAYS' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search district (e.g. Sreemangal, Dinajpur, Jashore)..."
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {[
                { label: 'All Stays', value: 'ALL' },
                { label: 'মাটির ঘর (Mud House)', value: 'TRADITIONAL_MUD_HOUSE' },
                { label: 'চা বাগান কটেজ (Tea Estate)', value: 'TEA_ESTATE_ECO_COTTAGE' },
                { label: 'ফলবাগান ক্যাম্প (Orchard Camp)', value: 'MANGO_LITCHI_ORCHARD_CAMP' },
                { label: 'সুন্দরবন মোহনা ঘের (Sundarbans)', value: 'SUNDARBANS_MANGROVE_BORDER' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStayType(filter.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedStayType === filter.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stays Grid */}
          {isStaysLoading ? (
            <div className="p-16 text-center text-gray-500">Loading farm stay cottages...</div>
          ) : stays.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-2">
              <Trees className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <div className="text-base font-bold text-gray-700 dark:text-gray-300">No farm stays found</div>
              <p className="text-xs text-gray-500">Try broadening your search or clear filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stays.map((stay) => (
                <div
                  key={stay.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Stay Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          {stay.stayType.replace(/_/g, ' ')}
                        </span>
                        <div className="text-right">
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            ৳{Number(stay.nightlyRateBdt).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 font-medium"> / night</span>
                        </div>
                      </div>

                      <h3 className="mt-3 text-lg font-extrabold text-gray-900 dark:text-white leading-snug">
                        {stay.titleEn}
                      </h3>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                        {stay.titleBn}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{stay.villageAddress}, {stay.upazila}, {stay.district}</span>
                      </div>

                      <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                        {stay.description}
                      </p>
                    </div>

                    {/* Amenities & Highlights */}
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-y border-gray-100 dark:border-gray-700/60 grid grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Max {stay.maxGuests} Guests</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stay.bedroomCount} Beds</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                        <span>৳{stay.allInclusiveMealCostPerPerson}/Meal</span>
                      </div>
                    </div>

                    {/* Features Tags */}
                    <div className="p-6 pt-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {stay.hasSolarElectricity && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                            <Sun className="w-3 h-3 text-amber-500" /> Solar Power
                          </span>
                        )}
                        {stay.hasClayStoveCooking && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[11px] font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" /> Clay Stove
                          </span>
                        )}
                        {stay.hasTraditionalBoatTour && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center gap-1">
                            <Sailboat className="w-3 h-3 text-blue-500" /> Baor Boat Ride
                          </span>
                        )}
                        {stay.hasOrganicFarmHarvestAccess && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                            <Trees className="w-3 h-3 text-emerald-500" /> Fruit Picking
                          </span>
                        )}
                      </div>

                      {/* Included Experiences list */}
                      {stay.experiences && stay.experiences.length > 0 && (
                        <div className="mt-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40 text-xs">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                            Included Farm Activities:
                          </span>
                          <ul className="space-y-1 text-emerald-800 dark:text-emerald-300">
                            {stay.experiences.map((exp) => (
                              <li key={exp.id} className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{exp.titleEn} (৳{exp.pricePerPersonBdt}/person)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Host Info & Booking Button */}
                  <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700/60 mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stay.hostName}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Weekend Rate: ৳{Number(stay.weekendRateBdt).toLocaleString()}/night
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBookingModal(stay)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Reserve Stay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGRO-ACTIVITIES & WORKSHOPS */}
      {activeTab === 'EXPERIENCES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isExpLoading ? (
            <div className="p-16 text-center text-gray-500">Loading experiences...</div>
          ) : (
            experiences.map((exp) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {exp.category.replace(/_/g, ' ')}
                    </span>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ৳{Number(exp.pricePerPersonBdt).toLocaleString()}{' '}
                      <span className="text-xs font-medium text-gray-500">/ person</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-base font-extrabold text-gray-900 dark:text-white">
                    {exp.titleEn}
                  </h3>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {exp.titleBn}
                  </div>

                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {exp.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                      <div className="text-gray-400 text-[10px]">Duration</div>
                      <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                        {exp.durationHours} Hours
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                      <div className="text-gray-400 text-[10px]">Group Size</div>
                      <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                        {exp.minParticipants} to {exp.maxParticipants} Persons
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Includes fresh farm snacks &amp; coconut</span>
                  </div>
                  <span className="text-gray-400">Available all season</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: STANDALONE COST & MEAL CALCULATOR */}
      {activeTab === 'COST_CALCULATOR' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-sm max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>Transparent Rural Agro-Tourism Cost Estimator</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Estimate your family or group budget for accommodation, 100% organic farm meals, and village host facilitation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Average Nightly Rate (৳ BDT)
                </label>
                <input
                  type="number"
                  step="100"
                  value={calcRatePerNight}
                  onChange={(e) => setCalcRatePerNight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Number of Nights
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={calcNights}
                    onChange={(e) => setCalcNights(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Total Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={calcGuests}
                    onChange={(e) => setCalcGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Farm Meal Package Option
                </label>
                <select
                  value={calcMealPlan}
                  onChange={(e) => setCalcMealPlan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium"
                >
                  <option value="ALL_INCLUSIVE_ORGANIC">
                    ৩ বেলা খাঁটি গ্রামীণ খাবার (দেশি হাঁস/মুরগি ও বিলের মাছ) — ৳৬৫০/জন/দিন
                  </option>
                  <option value="BREAKFAST_ONLY">
                    সকালের গ্রামীণ নাস্তা (লাল আটার রুটি, খাঁটি ঘি ও গুড়ের চা) — ৳১৮০/জন/দিন
                  </option>
                  <option value="SELF_COOKING_FARM_INGREDIENTS">
                    মাটির চুলা ও বাগানের তরতাজা মসলা দিয়ে নিজে রান্না — ৳৩৫০/রাত
                  </option>
                  <option value="NONE">কোনো খাবার নয়</option>
                </select>
              </div>
            </div>

            {/* Estimated Output Card */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs uppercase font-extrabold text-emerald-800 dark:text-emerald-300">
                  Itemized Cost Estimation
                </div>

                <div className="mt-4 space-y-2 text-xs text-emerald-950 dark:text-emerald-100">
                  <div className="flex justify-between">
                    <span>
                      Cottage Stay ({calcNights} nights × ৳{calcRatePerNight}):
                    </span>
                    <span className="font-bold">৳{calcStayTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Farm Meals ({calcGuests} guests):</span>
                    <span className="font-bold">৳{calcMealTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Village Security &amp; Platform Fee:</span>
                    <span className="font-bold">৳200</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-300/40 dark:border-emerald-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
                    Total Estimated Budget:
                  </span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    ৳{calcGrandTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                  All guest payments are held in escrow and only released to the host upon your safe arrival and check-in confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedStay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Reserve {selectedStay.titleEn}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Host: {selectedStay.hostName} ({selectedStay.villageAddress}, {selectedStay.district})
                </p>
              </div>
              <button
                onClick={() => setSelectedStay(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {bookingSuccessCode ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white">
                  Farm Stay Reserved &amp; Escrow Activated!
                </h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl max-w-sm mx-auto space-y-2">
                  <div className="text-xs text-gray-500">Booking Confirmation Reference:</div>
                  <div className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {bookingSuccessCode}
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
                    Your Secret Check-In Verification PIN:
                  </div>
                  <div className="font-mono text-2xl font-black tracking-widest text-teal-600 dark:text-teal-300">
                    {bookingSuccessPin}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Show this PIN to your village host upon arrival to release the escrow payout.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedStay(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        handleUpdatePrice(e.target.value, checkOutDate);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        handleUpdatePrice(checkInDate, e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Adult Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedStay.maxGuests}
                      value={adultCount}
                      onChange={(e) => {
                        setAdultCount(Number(e.target.value));
                        handleUpdatePrice(checkInDate, checkOutDate, Number(e.target.value));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Children (Below 12 yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={childCount}
                      onChange={(e) => {
                        setChildCount(Number(e.target.value));
                        handleUpdatePrice(checkInDate, checkOutDate, adultCount, Number(e.target.value));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Organic Village Meal Package
                  </label>
                  <select
                    value={mealPlan}
                    onChange={(e) => {
                      setMealPlan(e.target.value as any);
                      handleUpdatePrice(checkInDate, checkOutDate, adultCount, childCount, e.target.value as any);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="ALL_INCLUSIVE_ORGANIC">
                      ৩ বেলা খাঁটি গ্রামীণ খাবার (দেশি হাঁস/মুরগি, তাজা মাছ ও পিঠাপুলি) — ৳{selectedStay.allInclusiveMealCostPerPerson}/জন/দিন
                    </option>
                    <option value="BREAKFAST_ONLY">
                      সকালের নাস্তা (হাতে বানানো লাল আটার রুটি, ঘি ও ডিম) — ৳১৮০/জন/দিন
                    </option>
                    <option value="SELF_COOKING_FARM_INGREDIENTS">
                      মাটির চুলা, রান্নার কাঠ ও বাগান থেকে তাজা মসলা উপাদান — ৳৩৫০/রাত
                    </option>
                    <option value="NONE">কোনো খাবার নয়</option>
                  </select>
                </div>

                {/* Optional Experiences */}
                {selectedStay.experiences && selectedStay.experiences.length > 0 && (
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Add-on Farm Experiences:
                    </label>
                    <div className="space-y-2">
                      {selectedStay.experiences.map((exp) => (
                        <label
                          key={exp.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedExpIds.includes(exp.id)}
                              onChange={() => handleToggleExp(exp.id)}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{exp.titleEn}</div>
                              <div className="text-[10px] text-gray-500">{exp.category.replace(/_/g, ' ')} • {exp.durationHours} hrs</div>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-600">৳{exp.pricePerPersonBdt}/person</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Lead Guest Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Number (bKash/WhatsApp)
                    </label>
                    <input
                      type="text"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Price Breakdown Banner */}
                {priceResult?.data && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Cottage Stay ({priceResult.data.nightsCount} nights):</span>
                      <span className="font-bold">৳{priceResult.data.staySubtotalBdt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meal Subtotal:</span>
                      <span className="font-bold">৳{priceResult.data.mealSubtotalBdt.toLocaleString()}</span>
                    </div>
                    {priceResult.data.experiencesSubtotalBdt > 0 && (
                      <div className="flex justify-between">
                        <span>Activities Subtotal:</span>
                        <span className="font-bold">৳{priceResult.data.experiencesSubtotalBdt.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Platform &amp; Insurance Fee:</span>
                      <span className="font-bold">৳{priceResult.data.serviceFeeBdt}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-300 dark:border-emerald-700 flex justify-between text-sm font-black text-emerald-900 dark:text-emerald-100">
                      <span>Total Escrow Commitment:</span>
                      <span>৳{priceResult.data.totalAmountBdt.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setSelectedStay(null)}
                    className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBooking || isCalculating}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-all disabled:opacity-50"
                  >
                    {isBooking ? 'Securing Escrow...' : 'Confirm & Reserve (bKash Escrow)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AgroTourismHubView;
