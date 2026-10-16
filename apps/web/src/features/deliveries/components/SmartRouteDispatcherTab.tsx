'use client';

import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  Fuel,
  Clock,
  Anchor,
  User,
  Plus,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetSuggestedClustersQuery,
  useGetDispatchRunsQuery,
  useCreateDispatchRunMutation,
  ClusterSuggestion,
  DispatchRunStatus,
} from '../logisticsApi';
import { useGetRidersQuery } from '../deliveriesApi';

export interface SmartRouteDispatcherTabProps {
  lang?: string;
}

export function SmartRouteDispatcherTab({ lang = 'en' }: SmartRouteDispatcherTabProps) {
  const isBn = lang === 'bn';
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ClusterSuggestion | null>(null);
  const [runTitle, setRunTitle] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState('');

  const districtParam = selectedDistrict === 'all' ? undefined : selectedDistrict;

  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
    refetch: refetchSuggestions,
    isFetching: isFetchingSuggestions,
  } = useGetSuggestedClustersQuery(districtParam ? { district: districtParam } : undefined);

  const {
    data: runsData,
    isLoading: isLoadingRuns,
    refetch: refetchRuns,
  } = useGetDispatchRunsQuery(districtParam ? { district: districtParam } : undefined);

  const { data: riders } = useGetRidersQuery();

  const [createDispatchRun, { isLoading: isCreating }] = useCreateDispatchRunMutation();

  const handleOpenDispatch = (sug: ClusterSuggestion) => {
    setSelectedSuggestion(sug);
    setRunTitle(`${sug.district} - ${sug.upazila} Circuit`);
    setSelectedRiderId('');
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedSuggestion) return;
    try {
      await createDispatchRun({
        title: runTitle,
        division: selectedSuggestion.division,
        district: selectedSuggestion.district,
        upazila: selectedSuggestion.upazila,
        riderId: selectedRiderId || undefined,
        deliveryIds: selectedSuggestion.deliveries.map((d) => d.deliveryId),
        ferryGhatName: selectedSuggestion.ferryGhatName || undefined,
      }).unwrap();

      setDispatchModalOpen(false);
      setSelectedSuggestion(null);
      refetchSuggestions();
      refetchRuns();
    } catch (err) {
      console.error('Failed to dispatch run', err);
    }
  };

  const activeRuns = runsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            {isBn ? 'গ্রামীণ রুট ক্লাস্টারিং ও ডিসপ্যাচার' : 'Rural Route Clustering & Dispatcher'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBn
              ? 'উপজেলা ও ইউনিয়ন অনুযায়ী অর্ডারসমূহ সমন্বয় করে স্বয়ংক্রিয় রুট ও ফুয়েল হিসাব।'
              : 'Automatically groups rural deliveries by Upazila/Union to minimize mileage and ferry crossings.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-40 text-xs h-9">
              <SelectValue placeholder={isBn ? 'জেলা ফিল্টার' : 'Filter District'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isBn ? 'সকল জেলা' : 'All Districts'}</SelectItem>
              <SelectItem value="Bogra">Bogra (বগুড়া)</SelectItem>
              <SelectItem value="Rangpur">Rangpur (রংপুর)</SelectItem>
              <SelectItem value="Dinajpur">Dinajpur (দিনাজপুর)</SelectItem>
              <SelectItem value="Jessore">Jessore (যশোর)</SelectItem>
              <SelectItem value="Faridpur">Faridpur (ফরিদপুর)</SelectItem>
              <SelectItem value="Pabna">Pabna (পাবনা)</SelectItem>
              <SelectItem value="Sirajganj">Sirajganj (সিরাজগঞ্জ)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSuggestions();
              refetchRuns();
            }}
            disabled={isFetchingSuggestions}
            className="gap-1.5 text-xs h-9"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetchingSuggestions ? 'animate-spin' : ''}`} />
            {isBn ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Suggested Circuit Proposals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            {isBn ? 'প্রস্তাবিত রুট ক্লাস্টার' : 'Proposed Delivery Route Clusters'}
          </h3>
          <span className="text-xs text-muted-foreground">
            {suggestions?.length || 0} {isBn ? 'টি ক্লাস্টার তৈরি সম্ভব' : 'cluster(s) ready'}
          </span>
        </div>

        {isLoadingSuggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : !suggestions || suggestions.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-muted-foreground">
              {isBn
                ? 'বর্তমানে কোনো আন-অ্যাসাইন্ড অর্ডার ক্লাস্টার করার মতো নেই।'
                : 'No pending unassigned deliveries available for new route clustering.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((sug, idx) => (
              <Card
                key={`${sug.district}-${sug.upazila}-${idx}`}
                className="rounded-xl border shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {sug.division}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {sug.deliveryCount} {isBn ? 'টি স্টপ' : 'Stops'}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">
                    {sug.district} → {sug.upazila}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn ? 'ক্যাশ কালেকশন:' : 'COD Total:'} ৳{sug.totalCodAmount.toLocaleString()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {sug.requiresFerryCrossing && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-xs flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      <Anchor className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isBn ? 'ফেরি পারাপার:' : 'Ferry:'} {sug.ferryGhatName || 'Ghat Crossing'}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 bg-muted/40 p-2.5 rounded-lg text-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        {isBn ? 'দূরত্ব' : 'Dist'}
                      </span>
                      <span className="text-xs font-bold">{sug.estimatedDistanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        {isBn ? 'সময়' : 'ETA'}
                      </span>
                      <span className="text-xs font-bold">{sug.estimatedDurationMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        {isBn ? 'ফুয়েল' : 'Fuel'}
                      </span>
                      <span className="text-xs font-bold text-amber-600">
                        ৳{sug.fuelAllowanceBdt}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenDispatch(sug)}
                    className="w-full text-xs h-8 gap-1.5 bg-primary text-primary-foreground"
                  >
                    <Navigation className="w-3 h-3" />
                    {isBn ? 'রাইডারে ডিসপ্যাচ করুন' : 'Dispatch to Rider'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dispatched & Active Circuit Runs */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            {isBn ? 'সক্রিয় ও সম্পন্ন ডিসপ্যাচ রান' : 'Active & Completed Delivery Runs'}
          </h3>
          <span className="text-xs text-muted-foreground">
            {activeRuns.length} {isBn ? 'টি রান রেকর্ড' : 'records'}
          </span>
        </div>

        {isLoadingRuns ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : activeRuns.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-xs text-muted-foreground">
              {isBn ? 'এখনো কোনো ডিসপ্যাচ রান তৈরি করা হয়নি।' : 'No dispatch runs created yet.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeRuns.map((run) => {
              const waypoints = run.waypoints || [];
              const delivered = waypoints.filter((w) => w.status === 'DELIVERED').length;
              const percent = waypoints.length > 0 ? Math.round((delivered / waypoints.length) * 100) : 0;

              return (
                <Card key={run.id} className="p-4 rounded-xl border shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">{run.runCode}</span>
                        <Badge
                          variant={
                            run.status === DispatchRunStatus.COMPLETED
                              ? 'default'
                              : run.status === DispatchRunStatus.IN_TRANSIT
                              ? 'secondary'
                              : 'outline'
                          }
                          className={`text-xs ${
                            run.status === DispatchRunStatus.COMPLETED
                              ? 'bg-emerald-500 text-white'
                              : run.status === DispatchRunStatus.IN_TRANSIT
                              ? 'bg-blue-500/10 text-blue-600'
                              : ''
                          }`}
                        >
                          {run.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm">{run.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {run.district} → {run.upazila} • {run.totalDistanceKm} km • Fuel: ৳
                        {run.fuelAllowanceBdt}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-muted-foreground block">
                          {isBn ? 'রাইডার:' : 'Assigned Rider:'}
                        </span>
                        <span className="text-xs font-bold">
                          {run.rider
                            ? `${run.rider.firstName} ${run.rider.lastName}`
                            : isBn
                            ? 'অনির্ধারিত'
                            : 'Unassigned'}
                        </span>
                      </div>

                      <div className="w-28 text-right">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {delivered}/{waypoints.length}
                          </span>
                          <span className="font-bold text-primary">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispatch Confirmation Modal */}
      <Dialog open={dispatchModalOpen} onOpenChange={setDispatchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              {isBn ? 'মাল্টি-স্টপ রুট ডিসপ্যাচ নিশ্চিত করুন' : 'Confirm Multi-Stop Dispatch Run'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isBn
                ? 'এই সার্কিটের সকল অর্ডার ক্রমানুসারে সাজিয়ে নির্দিষ্ট রাইডারের অ্যাপে পাঠানো হবে।'
                : 'All orders will be sequenced using nearest-neighbor optimization and assigned to the rider.'}
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="runTitle" className="text-xs">
                  {isBn ? 'রুটের নাম / সার্কিট কোড' : 'Circuit Run Title'}
                </Label>
                <Input
                  id="runTitle"
                  value={runTitle}
                  onChange={(e) => setRunTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">{isBn ? 'এলাকা:' : 'Region:'}</span>
                  <span className="font-bold">
                    {selectedSuggestion.district} ({selectedSuggestion.upazila})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isBn ? 'মোট স্টপ:' : 'Total Stops:'}</span>
                  <span className="font-bold">{selectedSuggestion.deliveryCount} orders</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isBn ? 'আনুমানিক দূরত্ব:' : 'Distance:'}</span>
                  <span className="font-bold">{selectedSuggestion.estimatedDistanceKm} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isBn ? 'ফুয়েল ভাতা:' : 'Fuel Allowance:'}</span>
                  <span className="font-bold text-amber-600">৳{selectedSuggestion.fuelAllowanceBdt}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{isBn ? 'রাইডার নির্বাচন করুন' : 'Assign to Rider'}</Label>
                <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={isBn ? 'রাইডার নির্বাচন করুন...' : 'Select a rider...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {riders?.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">
                        {r.firstName} {r.lastName} ({r.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDispatchModalOpen(false)}
              className="text-xs"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDispatch}
              disabled={isCreating}
              className="text-xs gap-1.5 bg-primary text-primary-foreground"
            >
              <Navigation className="w-3.5 h-3.5" />
              {isCreating
                ? isBn
                  ? 'ডিসপ্যাচ হচ্ছে...'
                  : 'Dispatching...'
                : isBn
                ? 'ডিসপ্যাচ সম্পন্ন করুন'
                : 'Confirm & Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
