'use client';

import React, { useState } from 'react';
import {
  Building2,
  Boxes,
  Truck,
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MapPin,
  Phone,
  User,
  Package,
  Layers,
  ArrowRight,
  Thermometer,
  Activity,
  Zap,
  Wifi,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { customToast as toast } from '@/components/ui/custom-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { formatNumber, formatDate } from '@/lib/format';
import {
  useGetWarehouseHubsQuery,
  useCreateWarehouseHubMutation,
  useGetHubStocksQuery,
  useAllocateHubStockMutation,
  useGetStockTransfersQuery,
  useCreateStockTransferMutation,
  useUpdateStockTransferStatusMutation,
  useGetTelemetryOverviewQuery,
  useGetHubTelemetryQuery,
  useIngestTelemetryMutation,
  WarehouseHub,
  StockTransfer,
  WarehouseTelemetry,
} from '../warehousesApi';


export interface AdminWarehousesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminWarehousesView({
  lang = 'en',
  namespace = 'admin',
}: AdminWarehousesViewProps) {
  const isBn = lang === 'bn';
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';

  // State
  const [activeTab, setActiveTab] = useState<'hubs' | 'stocks' | 'transfers' | 'telemetry'>('hubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubId, setSelectedHubId] = useState<string>('');

  // Dialog states
  const [isCreateHubOpen, setIsCreateHubOpen] = useState(false);
  const [isCreateTransferOpen, setIsCreateTransferOpen] = useState(false);
  const [isAllocateStockOpen, setIsAllocateStockOpen] = useState(false);
  const [isIngestTelemetryOpen, setIsIngestTelemetryOpen] = useState(false);

  // Queries
  const { data: hubs = [], isLoading: isHubsLoading, refetch: refetchHubs } = useGetWarehouseHubsQuery();
  const {
    data: stocks = [],
    isLoading: isStocksLoading,
    refetch: refetchStocks,
  } = useGetHubStocksQuery(selectedHubId, {
    skip: !selectedHubId,
  });
  const {
    data: transfers = [],
    isLoading: isTransfersLoading,
    refetch: refetchTransfers,
  } = useGetStockTransfersQuery();

  const {
    data: telemetryOverview,
    isLoading: isTelemetryOverviewLoading,
    refetch: refetchTelemetry,
  } = useGetTelemetryOverviewQuery();

  const {
    data: hubTelemetry = [],
    isLoading: isHubTelemetryLoading,
    refetch: refetchHubTelemetry,
  } = useGetHubTelemetryQuery(
    { hubId: selectedHubId },
    { skip: !selectedHubId }
  );

  // Mutations
  const [createHub, { isLoading: isCreatingHub }] = useCreateWarehouseHubMutation();
  const [createTransfer, { isLoading: isCreatingTransfer }] = useCreateStockTransferMutation();
  const [updateTransferStatus, { isLoading: isUpdatingStatus }] =
    useUpdateStockTransferStatusMutation();
  const [allocateStock, { isLoading: isAllocatingStock }] = useAllocateHubStockMutation();
  const [ingestTelemetry, { isLoading: isIngestingTelemetry }] = useIngestTelemetryMutation();

  // Form states
  const [hubForm, setHubForm] = useState({
    nameEn: '',
    nameBn: '',
    code: '',
    hubType: 'DISTRICT' as 'CENTRAL' | 'DIVISIONAL' | 'DISTRICT' | 'UPAZILA_UNION',
    division: 'Rangpur',
    district: 'Dinajpur',
    upazila: 'Khansama',
    union: '',
    address: '',
    contactName: '',
    contactPhone: '',
    maxCapacityCubicMeters: 500,
  });

  const [transferForm, setTransferForm] = useState({
    sourceHubId: '',
    destinationHubId: '',
    productVariantId: '',
    quantity: 10,
    notes: '',
  });

  const [stockForm, setStockForm] = useState({
    productVariantId: '',
    quantityOnHand: 50,
    reorderPoint: 15,
    reorderQuantity: 100,
  });

  const [telemetryForm, setTelemetryForm] = useState({
    sensorType: 'TEMPERATURE' as 'TEMPERATURE' | 'HUMIDITY' | 'ETHYLENE_GAS' | 'POWER_STATUS',
    value: 5.5,
    unit: '°C',
    notes: '',
  });


  // Automatically select first hub for stock inspection if none selected
  React.useEffect(() => {
    if (!selectedHubId && hubs.length > 0) {
      setSelectedHubId(hubs[0].id);
    }
  }, [hubs, selectedHubId]);

  // Filtered hubs
  const filteredHubs = hubs.filter((hub) => {
    const q = searchQuery.toLowerCase();
    return (
      hub.nameEn.toLowerCase().includes(q) ||
      hub.nameBn.toLowerCase().includes(q) ||
      hub.code.toLowerCase().includes(q) ||
      hub.district.toLowerCase().includes(q) ||
      hub.division.toLowerCase().includes(q)
    );
  });

  // Metrics
  const totalHubsCount = hubs.length;
  const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT').length;
  const lowStockCount = stocks.filter((s) => s.quantityOnHand <= s.reorderPoint).length;

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubForm.nameEn || !hubForm.code || !hubForm.address) {
      toast.error(isBn ? 'অনুগ্রহ করে প্রয়োজনীয় তথ্য দিন' : 'Please fill required fields');
      return;
    }
    try {
      await createHub({
        nameEn: hubForm.nameEn.trim(),
        nameBn: hubForm.nameBn.trim() || hubForm.nameEn.trim(),
        code: hubForm.code.trim().toUpperCase(),
        hubType: hubForm.hubType,
        division: hubForm.division.trim(),
        district: hubForm.district.trim(),
        upazila: hubForm.upazila.trim() || undefined,
        union: hubForm.union.trim() || undefined,
        address: hubForm.address.trim(),
        contactName: hubForm.contactName.trim() || undefined,
        contactPhone: hubForm.contactPhone.trim() || undefined,
        maxCapacityCubicMeters: Number(hubForm.maxCapacityCubicMeters) || undefined,
      }).unwrap();

      toast.success(isBn ? 'নতুন ওয়্যারহাউস হাব তৈরি হয়েছে!' : 'Warehouse hub created successfully!');
      setIsCreateHubOpen(false);
      refetchHubs();
    } catch {
      toast.error(isBn ? 'হাব তৈরিতে ত্রুটি হয়েছে' : 'Failed to create warehouse hub');
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !transferForm.sourceHubId ||
      !transferForm.destinationHubId ||
      !transferForm.productVariantId ||
      transferForm.quantity <= 0
    ) {
      toast.error(isBn ? 'সকল ঘর সঠিকভাবে পূরণ করুন' : 'Please fill all transfer fields');
      return;
    }
    if (transferForm.sourceHubId === transferForm.destinationHubId) {
      toast.error(
        isBn
          ? 'উৎস হাব ও গন্তব্য হাব একই হতে পারে না'
          : 'Source and destination hubs must be different'
      );
      return;
    }
    try {
      await createTransfer({
        sourceHubId: transferForm.sourceHubId,
        destinationHubId: transferForm.destinationHubId,
        productVariantId: transferForm.productVariantId,
        quantity: Number(transferForm.quantity),
        notes: transferForm.notes.trim() || undefined,
      }).unwrap();

      toast.success(
        isBn ? 'স্টক ট্রান্সফার শুরু হয়েছে!' : 'Stock transfer initiated successfully!'
      );
      setIsCreateTransferOpen(false);
      refetchTransfers();
      refetchStocks();
    } catch {
      toast.error(isBn ? 'ট্রান্সফার তৈরি ব্যর্থ হয়েছে' : 'Failed to initiate transfer');
    }
  };

  const handleUpdateStatus = async (
    transferId: string,
    status: 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED'
  ) => {
    try {
      await updateTransferStatus({ id: transferId, data: { status } }).unwrap();
      toast.success(
        isBn
          ? `চালানের অবস্থা আপডেট করা হয়েছে: ${status}`
          : `Transfer status updated to ${status}`
      );
      refetchTransfers();
      refetchStocks();
    } catch {
      toast.error(isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Failed to update transfer status');
    }
  };

  const handleAllocateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubId || !stockForm.productVariantId) {
      toast.error(isBn ? 'প্রোডাক্ট ভ্যারিয়েন্ট সিলেক্ট করুন' : 'Select product variant');
      return;
    }
    try {
      await allocateStock({
        hubId: selectedHubId,
        data: {
          productVariantId: stockForm.productVariantId,
          quantityOnHand: Number(stockForm.quantityOnHand),
          reorderPoint: Number(stockForm.reorderPoint),
          reorderQuantity: Number(stockForm.reorderQuantity),
        },
      }).unwrap();

      toast.success(isBn ? 'স্টক বরাদ্দ সফল হয়েছে!' : 'Stock allocated successfully!');
      setIsAllocateStockOpen(false);
      refetchStocks();
    } catch {
      toast.error(isBn ? 'স্টক বরাদ্দ ব্যর্থ হয়েছে' : 'Failed to allocate stock');
    }
  };

  const handleIngestTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubId) {
      toast.error(isBn ? 'হাব বেছে নিন' : 'Please select a hub');
      return;
    }
    try {
      await ingestTelemetry({
        hubId: selectedHubId,
        data: {
          sensorType: telemetryForm.sensorType,
          value: Number(telemetryForm.value),
          unit: telemetryForm.unit,
          notes: telemetryForm.notes || undefined,
        },
      }).unwrap();

      toast.success(
        isBn ? 'আইওটি টেলিমেট্রি রিডিং সফলভাবে যোগ করা হয়েছে' : 'IoT telemetry reading logged successfully'
      );
      setIsIngestTelemetryOpen(false);
      refetchHubTelemetry();
      refetchTelemetry();
    } catch {
      toast.error(isBn ? 'টেলিমেট্রি রিডিং সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to log telemetry reading');
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: namespace === 'super-admin' ? 'Super Admin' : 'Admin' },
          { label: isBn ? 'ওয়্যারহাউস লজিস্টিকস' : 'Warehouse Logistics' },
        ]}
        title={
          isBn
            ? 'আঞ্চলিক ওয়্যারহাউস হাব ও ইন্টার-হাব স্টক ব্যবস্থাপনা'
            : 'Regional Warehouse Hubs & Inter-Hub Stock Management'
        }
        description={
          isBn
            ? 'উপজেলা ও ইউনিয়ন পর্যায়ের ওয়্যারহাউস বিতরণ কেন্দ্র, ব্যালেন্স ইনভেন্টরি এবং নিরাপদ স্টক ট্রান্সফার তদারকি করুন।'
            : 'Centrally manage division, district, and upazila distribution hubs, inventory levels, and ACID inter-hub stock transfers.'
        }
        primaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsCreateTransferOpen(true)}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isBn ? 'স্টক ট্রান্সফার করুন' : 'Initiate Transfer'}</span>
            </Button>
            <Button className="gap-2" onClick={() => setIsCreateHubOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন হাব তৈরি' : 'Add New Hub'}</span>
            </Button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'সক্রিয় ওয়্যারহাউস হাব' : 'Total Distribution Hubs'}
              </p>
              <h3 className="text-2xl font-black mt-1 text-foreground">
                {formatNumber(totalHubsCount, lang)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'চলমান ট্রান্সফার (ইন-ট্রানজিট)' : 'In-Transit Transfers'}
              </p>
              <h3 className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400">
                {formatNumber(inTransitCount, lang)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'স্বল্প স্টক সতর্কতা' : 'Low Stock Alerts'}
              </p>
              <h3 className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
                {formatNumber(lowStockCount, lang)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'লজিস্টিকস নেটওয়ার্ক' : 'Logistics Reach'}
              </p>
              <h3 className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {isBn ? 'দিনাজপুর ও রংপুর' : 'Dinajpur & Rangpur'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'hubs' | 'stocks' | 'transfers')}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="hubs" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span>{isBn ? 'ওয়্যারহাউস কেন্দ্রসমূহ' : 'Warehouse Hubs'}</span>
            </TabsTrigger>
            <TabsTrigger value="stocks" className="gap-2">
              <Boxes className="w-4 h-4" />
              <span>{isBn ? 'স্টক ইনভেন্টরি' : 'Hub Stocks'}</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isBn ? 'ইন্টার-হাব ট্রান্সফার' : 'Stock Transfers'}</span>
              {inTransitCount > 0 && (
                <Badge variant="secondary" className="ms-1 px-1.5 py-0 text-[10px]">
                  {inTransitCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="gap-2">
              <Thermometer className="w-4 h-4" />
              <span>{isBn ? 'কোল্ড স্টোরেজ আইওটি' : 'Cold Storage IoT'}</span>
              {telemetryOverview && telemetryOverview.criticalHubs > 0 && (
                <Badge variant="destructive" className="ms-1 px-1.5 py-0 text-[10px]">
                  {telemetryOverview.criticalHubs}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>


          {activeTab === 'hubs' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder={isBn ? 'হাবের নাম বা কোড খুঁজুন...' : 'Search hub or code...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
          )}

          {activeTab === 'stocks' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedHubId} onValueChange={(val) => setSelectedHubId(val)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue
                    placeholder={isBn ? 'ওয়্যারহাউস বেছে নিন' : 'Select warehouse hub'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {hubs.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {isBn ? h.nameBn : h.nameEn} ({h.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setIsAllocateStockOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'স্টক বরাদ্দ' : 'Allocate Stock'}</span>
              </Button>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedHubId} onValueChange={(val) => setSelectedHubId(val)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue
                    placeholder={isBn ? 'ওয়্যারহাউস বেছে নিন' : 'Select warehouse hub'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {hubs.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {isBn ? h.nameBn : h.nameEn} ({h.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setIsIngestTelemetryOpen(true)}
              >
                <Activity className="w-4 h-4" />
                <span>{isBn ? 'সেন্সর রিডিং যোগ' : 'Log IoT Reading'}</span>
              </Button>
            </div>
          )}
        </div>


        {/* Tab 1: Hubs List */}
        <TabsContent value="hubs" className="m-0 space-y-4">
          {isHubsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : filteredHubs.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-muted-foreground" />}
              title={isBn ? 'কোনো হাব পাওয়া যায়নি' : 'No Warehouse Hubs Found'}
              description={
                isBn
                  ? 'নতুন বিতরণ কেন্দ্র যোগ করতে উপরের "নতুন হাব তৈরি" বোতামে ক্লিক করুন।'
                  : 'Get started by creating your first regional distribution hub.'
              }
              action={{
                label: isBn ? 'নতুন হাব তৈরি করুন' : 'Create Warehouse Hub',
                onClick: () => setIsCreateHubOpen(true),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHubs.map((hub) => (
                <Card
                  key={hub.id}
                  className="border border-border/80 shadow-xs hover:border-primary/40 transition-all rounded-2xl overflow-hidden"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold">
                            {isBn ? hub.nameBn : hub.nameEn}
                          </CardTitle>
                          <Badge variant="outline" className="font-mono text-xs font-semibold">
                            {hub.code}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs mt-1">
                          {hub.hubType.replace('_', ' ')} • {hub.district}, {hub.division}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={hub.isActive ? 'default' : 'secondary'}
                        className={hub.isActive ? 'bg-emerald-600 hover:bg-emerald-500' : ''}
                      >
                        {hub.isActive
                          ? isBn
                            ? 'সক্রিয়'
                            : 'Active'
                          : isBn
                            ? 'নিষ্ক্রিয়'
                            : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hub.address}</span>
                    </div>

                    {hub.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-mono">{hub.contactPhone}</span>
                        {hub.contactName && <span>({hub.contactName})</span>}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {isBn ? 'ধারণক্ষমতা:' : 'Capacity:'}{' '}
                        <strong className="text-foreground">
                          {hub.maxCapacityCubicMeters || 500} m³
                        </strong>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary gap-1 px-2 h-8"
                        onClick={() => {
                          setSelectedHubId(hub.id);
                          setActiveTab('stocks');
                        }}
                      >
                        <span>{isBn ? 'স্টক দেখুন' : 'View Stocks'}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Stocks List */}
        <TabsContent value="stocks" className="m-0 space-y-4">
          <Card className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold">
                    {isBn ? 'হাবে সংরক্ষিত পণ্য স্টক' : 'Allocated Inventory in Selected Hub'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {hubs.find((h) => h.id === selectedHubId)?.nameEn || 'Selected Hub'} —{' '}
                    {stocks.length} {isBn ? 'টি ভ্যারিয়েন্ট' : 'SKUs tracked'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isStocksLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : stocks.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Boxes className="w-10 h-10 mx-auto opacity-40 mb-3" />
                  <p className="font-medium text-foreground">
                    {isBn ? 'এই হাবে এখনও কোনো স্টক বরাদ্দ করা হয়নি' : 'No SKU stock allocated to this hub yet'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 gap-1.5"
                    onClick={() => setIsAllocateStockOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'প্রথম স্টক বরাদ্দ করুন' : 'Allocate First Stock'}</span>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-start">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground text-start font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-start">{isBn ? 'পণ্য ও এসকেইউ' : 'Product & SKU'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'মোট স্টক' : 'On Hand'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'সংরক্ষিত' : 'Reserved'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'বিতরণযোগ্য' : 'Available'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'পুনর্বিন্যাস মাত্রা' : 'Reorder Point'}</th>
                        <th className="py-3 px-4 text-end">{isBn ? 'অবস্থা' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {stocks.map((stock) => {
                        const isLow = stock.quantityOnHand <= stock.reorderPoint;
                        const isOut = stock.quantityOnHand === 0;

                        return (
                          <tr key={stock.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground">
                                {isBn
                                  ? stock.productVariant?.nameBn || stock.productVariant?.nameEn || 'ভ্যারিয়েন্ট'
                                  : stock.productVariant?.nameEn || 'Variant'}
                              </div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                SKU: {stock.productVariant?.sku || stock.productVariantId.slice(0, 8)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold">
                              {formatNumber(stock.quantityOnHand, lang)}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {formatNumber(stock.quantityReserved, lang)}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatNumber(stock.quantityAvailable, lang)}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {formatNumber(stock.reorderPoint, lang)}
                            </td>
                            <td className="py-3 px-4 text-end">
                              {isOut ? (
                                <Badge variant="destructive" className="text-[11px]">
                                  {isBn ? 'স্টক শেষ' : 'Out of Stock'}
                                </Badge>
                              ) : isLow ? (
                                <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px]">
                                  {isBn ? 'কম স্টক' : 'Low Stock'}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px]">
                                  {isBn ? 'পর্যাপ্ত' : 'Adequate'}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Inter-Hub Transfers */}
        <TabsContent value="transfers" className="m-0 space-y-4">
          <Card className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    {isBn ? 'ইন্টার-হাব চালান ও স্টক স্থানান্তর' : 'Inter-Hub Consignments & Stock Transfers'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {transfers.length} {isBn ? 'টি স্থানান্তর নথিভুক্ত' : 'transfers logged in ACID ledger'}
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => setIsCreateTransferOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span>{isBn ? 'নতুন চালান' : 'New Transfer'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isTransfersLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : transfers.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <ArrowRightLeft className="w-10 h-10 mx-auto opacity-40 mb-3" />
                  <p className="font-medium text-foreground">
                    {isBn ? 'কোনো স্টক স্থানান্তর চালানের ইতিহাস নেই' : 'No inter-hub transfers recorded'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-start">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground text-start font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-start">{isBn ? 'ট্র্যাকিং নম্বর' : 'Tracking #'}</th>
                        <th className="py-3 px-4 text-start">{isBn ? 'উৎস ও গন্তব্য হাব' : 'Origin & Destination'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'পরিমাণ' : 'Quantity'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                        <th className="py-3 px-4 text-start">{isBn ? 'তারিখ' : 'Date'}</th>
                        <th className="py-3 px-4 text-end">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {transfers.map((trf) => (
                        <tr key={trf.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-primary">
                              {trf.trackingNumber}
                            </span>
                            {trf.notes && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1">
                                {trf.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-medium">
                              <span>{trf.sourceHub?.nameEn || 'Origin'}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground rtl:rotate-180" />
                              <span className="text-foreground font-semibold">
                                {trf.destinationHub?.nameEn || 'Destination'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {formatNumber(trf.quantity, lang)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {trf.status === 'RECEIVED' ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-500 text-[11px]">
                                {isBn ? 'গৃহীত' : 'Received'}
                              </Badge>
                            ) : trf.status === 'IN_TRANSIT' ? (
                              <Badge className="bg-blue-600 hover:bg-blue-500 text-[11px]">
                                {isBn ? 'চলমান' : 'In Transit'}
                              </Badge>
                            ) : trf.status === 'CANCELLED' ? (
                              <Badge variant="destructive" className="text-[11px]">
                                {isBn ? 'বাতিল' : 'Cancelled'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[11px]">
                                {isBn ? 'শুরু হয়েছে' : 'Initiated'}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-[11px]">
                            {formatDate(trf.createdAt, lang)}
                          </td>
                          <td className="py-3 px-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              {trf.status === 'INITIATED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400"
                                  onClick={() => handleUpdateStatus(trf.id, 'IN_TRANSIT')}
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>{isBn ? 'রওনা করান' : 'Dispatch'}</span>
                                </Button>
                              )}
                              {trf.status === 'IN_TRANSIT' && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500"
                                  onClick={() => handleUpdateStatus(trf.id, 'RECEIVED')}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{isBn ? 'রিসিভ করুন' : 'Receive'}</span>
                                </Button>
                              )}
                              {(trf.status === 'INITIATED' || trf.status === 'IN_TRANSIT') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                  onClick={() => handleUpdateStatus(trf.id, 'CANCELLED')}
                                >
                                  <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: IoT Cold Storage Telemetry */}
        <TabsContent value="telemetry" className="m-0 space-y-6">
          {/* Telemetry Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'মনিটরকৃত স্টোরেজ হাব' : 'Monitored Storage Hubs'}
                  </p>
                  <h4 className="text-xl font-bold mt-1 text-foreground">
                    {telemetryOverview?.totalHubs || hubs.length}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'অনুকূল পরিবেশ (Optimal)' : 'Optimal Hubs'}
                  </p>
                  <h4 className="text-xl font-bold mt-1 text-emerald-600">
                    {telemetryOverview?.optimalHubs ?? hubs.length}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'সতর্কতা স্তর (Warning)' : 'Warning Alerts'}
                  </p>
                  <h4 className="text-xl font-bold mt-1 text-amber-600">
                    {telemetryOverview?.warningHubs ?? 0}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'পচন ঝুঁকি (Critical)' : 'Critical Spoilage Risks'}
                  </p>
                  <h4 className="text-xl font-bold mt-1 text-rose-600">
                    {telemetryOverview?.criticalHubs ?? 0}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Hub Telemetry Detail */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isBn
                        ? 'লাইভ পরিবেশগত সেন্সর রিডিং'
                        : 'Live Environmental Sensor Telemetry'}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {isBn
                      ? 'নির্বাচিত ওয়্যারহাউসের তাপমাত্রা, আর্দ্রতা ও বায়ুর গুণমান মনিটরিং'
                      : 'Real-time temperature, humidity and air quality tracking for the selected facility'}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsIngestTelemetryOpen(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Activity className="w-4 h-4" />
                  <span>{isBn ? 'নতুন রিডিং লগ করুন' : 'Log Sensor Reading'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isHubTelemetryLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                  ))}
                </div>
              ) : hubTelemetry.length === 0 ? (
                <EmptyState
                  icon={<Thermometer className="w-8 h-8 text-muted-foreground" />}
                  title={
                    isBn
                      ? 'এই হাবের কোনো আইওটি সেন্সর রিডিং নেই'
                      : 'No IoT sensor telemetry for this hub'
                  }
                  description={
                    isBn
                      ? 'টেলিমেট্রি সেন্সর কানেক্ট করুন অথবা সিমুলেটেড টেস্ট রিডিং রেকর্ড করুন।'
                      : 'Connect IoT hardware probes or log a test environmental packet to start tracking.'
                  }
                  action={{
                    label: isBn ? 'প্রথম রিডিং যোগ করুন' : 'Log First Reading',
                    onClick: () => setIsIngestTelemetryOpen(true),
                  }}
                />

              ) : (
                <div className="space-y-6">
                  {/* Dials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hubTelemetry.slice(0, 4).map((reading) => (
                      <div
                        key={reading.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          reading.status === 'CRITICAL'
                            ? 'bg-rose-50/60 border-rose-300 dark:bg-rose-950/20'
                            : reading.status === 'WARNING'
                              ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20'
                              : 'bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {reading.sensorType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              reading.status === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : reading.status === 'WARNING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {reading.status}
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {reading.value} {reading.unit}
                        </div>
                        {reading.notes && (
                          <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                            {reading.notes}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-2">
                          {formatDate(reading.recordedAt, lang)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* History Log Table */}
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/60">
                        <tr>
                          <th className="py-2.5 px-4">{isBn ? 'সময়' : 'Recorded At'}</th>
                          <th className="py-2.5 px-4">{isBn ? 'সেন্সর' : 'Sensor Type'}</th>
                          <th className="py-2.5 px-4">{isBn ? 'রিডিং' : 'Reading Value'}</th>
                          <th className="py-2.5 px-4 text-center">
                            {isBn ? 'স্ট্যাটাস' : 'Safety Status'}
                          </th>
                          <th className="py-2.5 px-4">{isBn ? 'মন্তব্য' : 'Notes'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {hubTelemetry.map((row) => (
                          <tr key={row.id} className="hover:bg-muted/30">
                            <td className="py-2.5 px-4 text-xs text-muted-foreground">
                              {formatDate(row.recordedAt, lang)}
                            </td>
                            <td className="py-2.5 px-4 font-medium text-xs">
                              {row.sensorType}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-sm text-foreground">
                              {row.value} {row.unit}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <Badge
                                variant={
                                  row.status === 'CRITICAL'
                                    ? 'destructive'
                                    : row.status === 'WARNING'
                                      ? 'outline'
                                      : 'default'
                                }
                                className={`text-[10px] ${
                                  row.status === 'OPTIMAL'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : row.status === 'WARNING'
                                      ? 'border-amber-500 text-amber-700 bg-amber-50'
                                      : ''
                                }`}
                              >
                                {row.status}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4 text-xs text-muted-foreground">
                              {row.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Dialog: Create Hub */}
      <Dialog open={isCreateHubOpen} onOpenChange={setIsCreateHubOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateHub}>
            <DialogHeader>
              <DialogTitle>
                {isBn ? 'নতুন ওয়্যারহাউস হাব তৈরি করুন' : 'Create Regional Warehouse Hub'}
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? 'উপজেলা বা ইউনিয়ন পর্যায়ের বিতরণ কেন্দ্রের অবস্থান ও তথ্য দিন।'
                  : 'Register a central, district or upazila-level distribution center.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div className="col-span-2 space-y-1.5">
                <Label>{isBn ? 'হাবের নাম (ইংরেজি)' : 'Hub Name (English)'} *</Label>
                <Input
                  required
                  placeholder="e.g. Khansama Central Hub"
                  value={hubForm.nameEn}
                  onChange={(e) => setHubForm({ ...hubForm, nameEn: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>{isBn ? 'হাবের নাম (বাংলা)' : 'Hub Name (Bengali)'}</Label>
                <Input
                  placeholder="যেমন: খানসামা কেন্দ্রীয় বিতরণ কেন্দ্র"
                  value={hubForm.nameBn}
                  onChange={(e) => setHubForm({ ...hubForm, nameBn: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'হাব কোড' : 'Hub Code'} *</Label>
                <Input
                  required
                  placeholder="HUB-KHA-01"
                  value={hubForm.code}
                  onChange={(e) => setHubForm({ ...hubForm, code: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'হাবের স্তর' : 'Hub Type'}</Label>
                <Select
                  value={hubForm.hubType}
                  onValueChange={(val: any) => setHubForm({ ...hubForm, hubType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CENTRAL">Central National</SelectItem>
                    <SelectItem value="DIVISIONAL">Divisional</SelectItem>
                    <SelectItem value="DISTRICT">District</SelectItem>
                    <SelectItem value="UPAZILA_UNION">Upazila / Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'বিভাগ' : 'Division'} *</Label>
                <Input
                  required
                  value={hubForm.division}
                  onChange={(e) => setHubForm({ ...hubForm, division: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'জেলা' : 'District'} *</Label>
                <Input
                  required
                  value={hubForm.district}
                  onChange={(e) => setHubForm({ ...hubForm, district: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'উপজেলা' : 'Upazila'}</Label>
                <Input
                  value={hubForm.upazila}
                  onChange={(e) => setHubForm({ ...hubForm, upazila: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'ধারণক্ষমতা (ঘনমিটার)' : 'Capacity (m³)'}</Label>
                <Input
                  type="number"
                  value={hubForm.maxCapacityCubicMeters}
                  onChange={(e) =>
                    setHubForm({ ...hubForm, maxCapacityCubicMeters: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>{isBn ? 'পূর্ণাঙ্গ ঠিকানা' : 'Full Street Address'} *</Label>
                <Input
                  required
                  placeholder="e.g. Pakerhat Bazar Road, Khansama"
                  value={hubForm.address}
                  onChange={(e) => setHubForm({ ...hubForm, address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা' : 'Contact Person'}</Label>
                <Input
                  placeholder="e.g. Rafiqul Islam"
                  value={hubForm.contactName}
                  onChange={(e) => setHubForm({ ...hubForm, contactName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</Label>
                <Input
                  placeholder="017XXXXXXXX"
                  value={hubForm.contactPhone}
                  onChange={(e) => setHubForm({ ...hubForm, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateHubOpen(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isCreatingHub}>
                {isCreatingHub ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? 'তৈরি করুন' : 'Create Hub'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Initiate Transfer */}
      <Dialog open={isCreateTransferOpen} onOpenChange={setIsCreateTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateTransfer}>
            <DialogHeader>
              <DialogTitle>
                {isBn ? 'নতুন ইন্টার-হাব স্টক স্থানান্তর' : 'Initiate Inter-Hub Stock Transfer'}
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? 'এক ওয়্যারহাউস থেকে অন্য ওয়্যারহাউসে নিরাপদ ব্যালেন্স স্থানান্তর।'
                  : 'Transfer batch inventory between verified distribution centers.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1.5">
                <Label>{isBn ? 'উৎস হাব (কোথা থেকে যাবে)' : 'Source Hub'} *</Label>
                <Select
                  value={transferForm.sourceHubId}
                  onValueChange={(val) => setTransferForm({ ...transferForm, sourceHubId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? 'উৎস হাব বেছে নিন' : 'Select source hub'} />
                  </SelectTrigger>
                  <SelectContent>
                    {hubs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.nameEn} ({h.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'গন্তব্য হাব (কোথায় পৌঁছাবে)' : 'Destination Hub'} *</Label>
                <Select
                  value={transferForm.destinationHubId}
                  onValueChange={(val) =>
                    setTransferForm({ ...transferForm, destinationHubId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? 'গন্তব্য হাব বেছে নিন' : 'Select destination hub'} />
                  </SelectTrigger>
                  <SelectContent>
                    {hubs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.nameEn} ({h.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'প্রোডাক্ট ভ্যারিয়েন্ট আইডি' : 'Product Variant ID / SKU'} *</Label>
                <Input
                  required
                  placeholder="UUID or SKU ID"
                  value={transferForm.productVariantId}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, productVariantId: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'স্থানান্তর পরিমাণ' : 'Transfer Quantity'} *</Label>
                <Input
                  type="number"
                  min={1}
                  required
                  value={transferForm.quantity}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, quantity: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'মন্তব্য বা চালান নোট' : 'Consignment Notes'}</Label>
                <Input
                  placeholder="e.g. Seasonal replenishment for harvest festival"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTransferOpen(false)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isCreatingTransfer}>
                {isCreatingTransfer
                  ? isBn
                    ? 'প্রক্রিয়াকরণ হচ্ছে...'
                    : 'Processing...'
                  : isBn
                    ? 'চালান শুরু করুন'
                    : 'Dispatch Consignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Allocate Stock */}
      <Dialog open={isAllocateStockOpen} onOpenChange={setIsAllocateStockOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAllocateStock}>
            <DialogHeader>
              <DialogTitle>
                {isBn ? 'হাবে স্টক বরাদ্দ / আপডেট করুন' : 'Allocate / Update Stock Level'}
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? 'নির্বাচিত বিতরণ কেন্দ্রে পণ্যের মজুদ ও সেফটি থ্রেশহোল্ড সেট করুন।'
                  : 'Assign stock on hand and safety reorder thresholds for this hub.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1.5">
                <Label>{isBn ? 'ওয়্যারহাউস কেন্দ্র' : 'Selected Hub'}</Label>
                <div className="p-2.5 rounded-lg bg-muted text-foreground font-semibold">
                  {hubs.find((h) => h.id === selectedHubId)?.nameEn || 'Selected Hub'}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'প্রোডাক্ট ভ্যারিয়েন্ট আইডি' : 'Product Variant UUID'} *</Label>
                <Input
                  required
                  placeholder="Variant UUID"
                  value={stockForm.productVariantId}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, productVariantId: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? 'বর্তমান স্টক' : 'Quantity on Hand'} *</Label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={stockForm.quantityOnHand}
                    onChange={(e) =>
                      setStockForm({ ...stockForm, quantityOnHand: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{isBn ? 'রিঅর্ডার পয়েন্ট' : 'Reorder Point'}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={stockForm.reorderPoint}
                    onChange={(e) =>
                      setStockForm({ ...stockForm, reorderPoint: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'রিঅর্ডার পরিমাণ' : 'Reorder Batch Quantity'}</Label>
                <Input
                  type="number"
                  min={1}
                  value={stockForm.reorderQuantity}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, reorderQuantity: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAllocateStockOpen(false)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isAllocatingStock}>
                {isAllocatingStock ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? 'বরাদ্দ সম্পন্ন করুন' : 'Confirm Allocation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ingest Telemetry */}
      <Dialog open={isIngestTelemetryOpen} onOpenChange={setIsIngestTelemetryOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleIngestTelemetry}>
            <DialogHeader>
              <DialogTitle>
                {isBn ? 'আইওটি পরিবেশগত সেন্সর রিডিং রেকর্ড করুন' : 'Log IoT Environmental Telemetry'}
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? 'ওয়্যারহাউস প্রকোষ্ঠের তাপমাত্রা, আর্দ্রতা বা গ্যাসের পরিমাপ ইনপুট দিন।'
                  : 'Transmit real-time probe measurements for perishable produce protection.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1.5">
                <Label>{isBn ? 'সেন্সর ধরন' : 'Sensor Probe Type'} *</Label>
                <Select
                  value={telemetryForm.sensorType}
                  onValueChange={(val: any) => {
                    let defaultUnit = '°C';
                    if (val === 'HUMIDITY') defaultUnit = '%';
                    if (val === 'ETHYLENE_GAS') defaultUnit = 'ppm';
                    if (val === 'POWER_STATUS') defaultUnit = 'status';
                    setTelemetryForm({
                      ...telemetryForm,
                      sensorType: val,
                      unit: defaultUnit,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEMPERATURE">
                      {isBn ? 'তাপমাত্রা (Temperature °C)' : 'Temperature (°C)'}
                    </SelectItem>
                    <SelectItem value="HUMIDITY">
                      {isBn ? 'বাতাসের আর্দ্রতা (Humidity %)' : 'Relative Humidity (%)'}
                    </SelectItem>
                    <SelectItem value="ETHYLENE_GAS">
                      {isBn ? 'ইথিলিন গ্যাস (Ethylene Gas ppm)' : 'Ethylene Gas (ppm)'}
                    </SelectItem>
                    <SelectItem value="POWER_STATUS">
                      {isBn ? 'বিদ্যুৎ সংযোগ অবস্থা (Power Status)' : 'Grid / Backup Power (1=ON, 0=OFF)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{isBn ? 'পরিমাপ মান' : 'Reading Value'} *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={telemetryForm.value}
                    onChange={(e) =>
                      setTelemetryForm({ ...telemetryForm, value: parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{isBn ? 'একক' : 'Unit'} *</Label>
                  <Input
                    required
                    value={telemetryForm.unit}
                    onChange={(e) => setTelemetryForm({ ...telemetryForm, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'মন্তব্য বা টেস্ট নোট' : 'Probe Location / Operational Notes'}</Label>
                <Input
                  placeholder={isBn ? 'যেমন: চেম্বার-২ সেন্ট্রাল র্যাক' : 'e.g. Chamber-2 Cold Vault'}
                  value={telemetryForm.notes}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIngestTelemetryOpen(false)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isIngestingTelemetry}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isIngestingTelemetry
                  ? isBn
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Transmitting...'
                  : isBn
                    ? 'রিডিং জমা দিন'
                    : 'Transmit Packet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

