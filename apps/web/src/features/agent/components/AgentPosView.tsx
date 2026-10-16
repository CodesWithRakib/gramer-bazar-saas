'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  ShoppingCart,
  Banknote,
  DollarSign,
  Truck,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Leaf,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
  Send,
  FileText,
  TrendingUp,
  CreditCard,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  useGetActiveSessionQuery,
  useOpenDrawerSessionMutation,
  useCloseDrawerSessionMutation,
  useProcessAgentPosCheckoutMutation,
  useRecordFarmerCollectionMutation,
  useGetFarmerCollectionsQuery,
  useCreateSettlementMutation,
  useGetAgentSettlementsQuery,
  useGetAgentSummaryQuery,
  SettlementChannel,
} from '../agentCommerceApi';
import { useGetSellerProductsQuery } from '@/features/seller';
import { useGetWarehouseHubsQuery } from '@/features/warehouses/warehousesApi';

interface CartItem {
  sellerProductId: string;
  nameEn: string;
  nameBn?: string;
  price: number;
  quantity: number;
  stock: number;
}

export function AgentPosView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'pos' | 'farmer' | 'drawer' | 'settlement' | 'summary'>('pos');

  // Network offline detection
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // API Queries
  const { data: sessionData, isLoading: isSessionLoading, refetch: refetchSession } = useGetActiveSessionQuery();
  const activeSession = sessionData?.data;

  const { data: productsData, isLoading: isProductsLoading } = useGetSellerProductsQuery({ page: 1, limit: 100 });
  const products = productsData?.data || [];

  const { data: hubs = [] } = useGetWarehouseHubsQuery();
  const { data: collectionsData, refetch: refetchCollections } = useGetFarmerCollectionsQuery();
  const collections = collectionsData?.data || [];

  const { data: settlementsData, refetch: refetchSettlements } = useGetAgentSettlementsQuery();
  const settlements = settlementsData?.data || [];

  const { data: summaryData, refetch: refetchSummary } = useGetAgentSummaryQuery();
  const summary = summaryData?.data;

  // Mutations
  const [openDrawer, { isLoading: isOpenDrawerLoading }] = useOpenDrawerSessionMutation();
  const [closeDrawer, { isLoading: isCloseDrawerLoading }] = useCloseDrawerSessionMutation();
  const [posCheckout, { isLoading: isCheckoutLoading }] = useProcessAgentPosCheckoutMutation();
  const [recordCollection, { isLoading: isCollectionLoading }] = useRecordFarmerCollectionMutation();
  const [createSettlement, { isLoading: isSettlementLoading }] = useCreateSettlementMutation();

  // POS State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [amountTendered, setAmountTendered] = useState<number | ''>('');
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drawer Modals State
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openingFloat, setOpeningFloat] = useState(2000);
  const [openingNotes, setOpeningNotes] = useState('');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [countedNotes, setCountedNotes] = useState({
    n1000: 0,
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0,
  });
  const [closingNotes, setClosingNotes] = useState('');

  // Farmer Aggregation State
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [cropType, setCropType] = useState('Miniket Paddy');
  const [quantityKg, setQuantityKg] = useState<number | ''>('');
  const [unitPricePerKg, setUnitPricePerKg] = useState<number | ''>('');
  const [destinationHubId, setDestinationHubId] = useState('');
  const [payFromDrawer, setPayFromDrawer] = useState(true);
  const [farmerReceipt, setFarmerReceipt] = useState<any | null>(null);

  // Settlement State
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [settlementChannel, setSettlementChannel] = useState<SettlementChannel>('POST_OFFICE');
  const [channelReference, setChannelReference] = useState('');
  const [slipReceiptUrl, setSlipReceiptUrl] = useState('');

  // Computed Cart
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);
  const deliveryFee = 0; // In-store / hub collection
  const totalPayable = subtotal + deliveryFee;
  const changeDue = typeof amountTendered === 'number' && amountTendered >= totalPayable ? amountTendered - totalPayable : 0;

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!catalogSearch.trim()) return products;
    const q = catalogSearch.toLowerCase();
    return products.filter((p: any) =>
      p.product?.titleEn?.toLowerCase().includes(q) ||
      p.product?.titleBn?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  }, [products, catalogSearch]);

  // Denominations total
  const countedPhysicalTotal = useMemo(() => {
    return (
      countedNotes.n1000 * 1000 +
      countedNotes.n500 * 500 +
      countedNotes.n200 * 200 +
      countedNotes.n100 * 100 +
      countedNotes.n50 * 50 +
      countedNotes.n20 * 20 +
      countedNotes.n10 * 10 +
      countedNotes.coins * 1
    );
  }, [countedNotes]);

  const currentDrawerCash = activeSession
    ? Number(activeSession.openingFloat) + Number(activeSession.cashIn) - Number(activeSession.cashOut)
    : 0;

  const discrepancy = countedPhysicalTotal - currentDrawerCash;

  // Cart operations
  const addToCart = (product: any) => {
    const existing = cart.find((i) => i.sellerProductId === product.id);
    const stock = product.inventory?.quantity || 10;
    const price = Number(product.discountPrice || product.price);

    if (existing) {
      if (existing.quantity >= stock) return;
      setCart(cart.map((i) => (i.sellerProductId === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([
        ...cart,
        {
          sellerProductId: product.id,
          nameEn: product.product?.titleEn || 'Agricultural Item',
          nameBn: product.product?.titleBn || 'কৃষি পণ্য',
          price,
          quantity: 1,
          stock,
        },
      ]);
    }
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.sellerProductId === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 && newQty <= item.stock ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((i) => i.sellerProductId !== id));
  };

  // Handle POS Checkout
  const handlePosCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setOrderSuccessMessage(null);

    if (!activeSession) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে প্রথমে ক্যাশ ড্রয়ার শিফট ওপেন করুন।'
          : 'Please open an active cash drawer session first.'
      );
      return;
    }

    if (cart.length === 0) {
      setErrorMessage(isBn ? 'কার্টে কোনো পণ্য যোগ করা হয়নি।' : 'Cart cannot be empty.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage(
        isBn ? 'গ্রাহকের নাম ও মোবাইল নম্বর পূরণ করুন।' : 'Please enter customer name and phone number.'
      );
      return;
    }

    const tendered = typeof amountTendered === 'number' ? amountTendered : totalPayable;
    if (tendered < totalPayable) {
      setErrorMessage(
        isBn
          ? `গৃহীত নগদ (৳${tendered}) মোট বিল (৳${totalPayable})-এর চেয়ে কম হতে পারে না।`
          : `Amount tendered (৳${tendered}) cannot be less than total (৳${totalPayable}).`
      );
      return;
    }

    try {
      const res = await posCheckout({
        items: cart.map((i) => ({ sellerProductId: i.sellerProductId, quantity: i.quantity })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim() || 'Village Center Pickup',
        amountTendered: tendered,
        lang,
      }).unwrap();

      setLastReceipt({
        orderId: res.data.order.id,
        orderTotal: res.data.orderTotal,
        amountTendered: res.data.amountTendered,
        changeDue: res.data.changeDue,
        agentCommission: res.data.agentCommission,
        items: [...cart],
        customerName,
        customerPhone,
        date: new Date().toLocaleString(),
      });

      setOrderSuccessMessage(
        isBn
          ? `অর্ডার #${res.data.order.id.slice(0, 8).toUpperCase()} সম্পন্ন হয়েছে! ফেরত টাকা: ৳${res.data.changeDue}। অর্জিত কমিশন: ৳${res.data.agentCommission}`
          : `Order #${res.data.order.id.slice(0, 8).toUpperCase()} completed! Change Due: ৳${res.data.changeDue}. Commission: ৳${res.data.agentCommission}`
      );

      // Reset cart and customer details
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setAmountTendered('');
      refetchSession();
      refetchSummary();
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'Failed to process POS order');
    }
  };

  // Handle Open Drawer
  const handleOpenDrawer = async () => {
    try {
      await openDrawer({
        openingFloat: Number(openingFloat),
        openingNotes: openingNotes.trim() || undefined,
      }).unwrap();
      setShowOpenModal(false);
      refetchSession();
    } catch (err: any) {
      alert(err?.data?.message || err.message || 'Failed to open drawer');
    }
  };

  // Handle Close Drawer
  const handleCloseDrawer = async () => {
    try {
      await closeDrawer({
        actualClosingBalance: countedPhysicalTotal,
        closingNotes: closingNotes.trim() || undefined,
      }).unwrap();
      setShowCloseModal(false);
      refetchSession();
      refetchSummary();
    } catch (err: any) {
      alert(err?.data?.message || err.message || 'Failed to close drawer');
    }
  };

  // Handle Farmer Produce Aggregation
  const handleFarmerAggregation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qty = typeof quantityKg === 'number' ? quantityKg : 0;
    const price = typeof unitPricePerKg === 'number' ? unitPricePerKg : 0;
    const totalPayout = qty * price;

    if (!farmerName.trim() || !farmerPhone.trim() || qty <= 0 || price <= 0) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে সকল তথ্য সঠিকভাবে পূরণ করুন।' : 'Please fill all crop collection details.');
      return;
    }

    if (payFromDrawer && totalPayout > currentDrawerCash) {
      setErrorMessage(
        isBn
          ? `ড্রয়ারে পর্যাপ্ত নগদ নেই (বর্তমান ক্যাশ: ৳${currentDrawerCash})।`
          : `Insufficient cash in drawer (Available: ৳${currentDrawerCash}).`
      );
      return;
    }

    try {
      const res = await recordCollection({
        farmerName: farmerName.trim(),
        farmerPhone: farmerPhone.trim(),
        villageLocation: farmerVillage.trim() || 'Char Riverbank',
        cropType,
        quantityKg: qty,
        unitPricePerKg: price,
        paidFromDrawer: payFromDrawer,
        destinationHubId: destinationHubId || undefined,
      }).unwrap();

      setFarmerReceipt(res.data);
      setFarmerName('');
      setFarmerPhone('');
      setFarmerVillage('');
      setQuantityKg('');
      setUnitPricePerKg('');
      refetchCollections();
      refetchSession();
      refetchSummary();
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'Failed to record crop aggregation');
    }
  };

  // Handle Settlement Deposit
  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amt = typeof depositAmount === 'number' ? depositAmount : 0;
    if (amt <= 0 || !channelReference.trim()) {
      setErrorMessage(isBn ? 'ডিপোজিট পরিমাণ এবং স্লিপ নম্বর দিন।' : 'Please provide deposit amount and slip reference.');
      return;
    }

    try {
      await createSettlement({
        amount: amt,
        settlementChannel,
        channelReference: channelReference.trim(),
        slipReceiptUrl: slipReceiptUrl.trim() || undefined,
      }).unwrap();

      setDepositAmount('');
      setChannelReference('');
      setSlipReceiptUrl('');
      refetchSettlements();
      refetchSession();
      refetchSummary();
      alert(
        isBn
          ? 'ডাকঘর/ব্যাংক ক্যাশ ডিপোজিট স্লিপ সফলভাবে জমা হয়েছে। অ্যাডমিন ভেরিফিকেশন অপেক্ষমাণ।'
          : 'Cash deposit voucher submitted successfully. Awaiting Admin verification.'
      );
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'Failed to submit settlement');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: UDC Agent Terminal Title & Live Drawer Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'ইউনিয়ন ডিজিটাল সেন্টার (UDC) ও ফিল্ড এজেন্ট পিওএস' : 'Village Digital Center (UDC) Field Agent POS'}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOnline ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? (isBn ? 'অনলাইন' : 'Online') : (isBn ? 'অফলাইন মোড' : 'Offline Queue')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'চর ও হাওর অঞ্চলের কৃষকদের ফসল সংগ্রহ, গ্রামীণ গ্রাহক অর্ডার ও ডাকঘর ক্যাশ সেটেলমেন্ট হাব'
                  : 'Char & Haor farmer aggregation, rural assisted checkouts & Post Office cash reconciliation'}
              </p>
            </div>
          </div>

          {/* Active Drawer Session Status Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'ড্রয়ারে নগদ ক্যাশ' : 'Cash in Drawer'}
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ৳{currentDrawerCash.toLocaleString()}
              </div>
            </div>

            {activeSession ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isBn ? 'শিফট চালু' : 'Drawer Open'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCloseModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                >
                  {isBn ? 'শিফট সমাপনী ও ব্যালান্স মিলকরণ' : 'Close Shift & Count Notes'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold">
                  {isBn ? 'ড্রয়ার বন্ধ' : 'Drawer Closed'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowOpenModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                >
                  {isBn ? 'নতুন শিফট শুরু করুন' : 'Open Drawer Session'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isBn ? '১. দ্রুত পিওএস বিক্রয় (POS)' : '1. Rapid POS Terminal'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('farmer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'farmer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Leaf className="w-4 h-4" />
            {isBn ? '২. কৃষকের ফসল সংগ্রহ ও নগদ পরিশোধ' : '2. Farmer Produce Aggregator'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drawer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'drawer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Banknote className="w-4 h-4" />
            {isBn ? '৩. ড্রয়ার হিসাব ও লেজার' : '3. Drawer Reconciliation'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'settlement'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {isBn ? '৪. ডাকঘর ও ব্যাংক ডিপোজিট' : '4. Post Office & Bank Deposits'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {isBn ? '৫. কমিশন ও রিপোর্ট' : '5. Agent Performance'}
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {orderSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{orderSuccessMessage}</span>
          </div>
          {lastReceipt && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              {isBn ? 'থার্মাল স্লিপ প্রিন্ট' : 'Print Slip'}
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 1: RAPID POS TERMINAL
          ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Catalog Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={isBn ? 'পণ্য বা কোড খুঁজুন...' : 'Search product title or SKU...'}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {isProductsLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  {isBn ? 'পণ্য লোড হচ্ছে...' : 'Loading catalog items...'}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  {isBn ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No products found.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 max-h-[540px] overflow-y-auto pr-1">
                  {filteredProducts.map((p: any) => {
                    const title = (isBn ? p.product?.titleBn : p.product?.titleEn) || p.product?.titleEn || 'Product';
                    const price = Number(p.discountPrice || p.price);
                    const stock = p.inventory?.quantity ?? 10;
                    const inCart = cart.find((i) => i.sellerProductId === p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                          inCart
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                            {title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            SKU: {p.sku || p.id.slice(0, 6)}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            ৳{price}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                            stock > 5 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {stock} {isBn ? 'টি' : 'left'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart, Customer & Cash Settlement Checkout */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                {isBn ? 'পিওএস বিক্রয় কার্ট' : 'POS Checkout Cart'}
                <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
                  {cart.length} {isBn ? 'আইটেম' : 'items'}
                </span>
              </h2>

              {/* Cart Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto mt-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    {isBn ? 'কার্ট খালি। বাম পাশের পণ্য ক্লিক করে যোগ করুন।' : 'Cart is empty. Click catalog products to add.'}
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.sellerProductId} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="max-w-[170px]">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {isBn ? item.nameBn || item.nameEn : item.nameEn}
                        </div>
                        <div className="text-slate-400">৳{item.price} × {item.quantity} = ৳{item.price * item.quantity}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.sellerProductId, -1)}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.sellerProductId, 1)}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.sellerProductId)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Inputs */}
              <form onSubmit={handlePosCheckout} className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'গ্রাহকের নাম *' : 'Customer Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={isBn ? 'যেমন: আবুল কাশেম' : 'e.g. Abul Kashem'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isBn ? 'গ্রাম / ইউনিয়ন ঠিকানা' : 'Village / Union Address'}
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={isBn ? 'যেমন: কাজিপুর চর, ওয়ার্ড ৩' : 'e.g. Kazipur Char, Ward 3'}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {/* Amount Calculation & Tendered */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>{isBn ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{isBn ? 'ডেলিভারি ফি:' : 'Delivery Fee:'}</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>{isBn ? 'মোট প্রদেয়:' : 'Total Payable:'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">৳{totalPayable}</span>
                  </div>
                </div>

                {/* Cash Tendered & Change Due */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'গৃহীত নগদ টাকা (৳) *' : 'Amount Tendered (৳) *'}
                    </label>
                    <input
                      type="number"
                      min={totalPayable}
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value ? Number(e.target.value) : '')}
                      placeholder={`৳${totalPayable}`}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-600 text-sm font-bold bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? 'গ্রাহককে ফেরত দিন (Change)' : 'Change Due to Customer'}
                    </label>
                    <div className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-sm font-bold text-center">
                      ৳{changeDue.toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckoutLoading || cart.length === 0}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {isCheckoutLoading
                    ? (isBn ? 'অর্ডার প্রক্রিয়াধীন...' : 'Processing...')
                    : (isBn ? 'নগদ বিক্রি সম্পন্ন করুন ও ড্রয়ারে ক্যাশ জমা নিন' : 'Complete Cash Sale & Add to Drawer')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CHAR/HAOR PRODUCE AGGREGATOR
          ========================================================================= */}
      {activeTab === 'farmer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Produce Collection Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
              {isBn ? 'কৃষকের শস্য সংগ্রহ ও নগদ প্রদান' : 'Remote Farmer Produce Aggregation'}
            </h2>

            <form onSubmit={handleFarmerAggregation} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'কৃষকের নাম *' : 'Farmer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder={isBn ? 'যেমন: মোখলেসুর রহমান' : 'e.g. Moklesur Rahman'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'গ্রাম / চর এলাকা' : 'Village / Char Area'}
                  </label>
                  <input
                    type="text"
                    value={farmerVillage}
                    onChange={(e) => setFarmerVillage(e.target.value)}
                    placeholder={isBn ? 'সারিয়াকান্দি নদীঘাট' : 'Sariakandi Ghat'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ফসলের ধরন *' : 'Crop Type *'}
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Miniket Paddy">মিনিকেট ধান (Miniket Paddy)</option>
                  <option value="BRRI-28 Rice">ব্রি-২৮ চাল (BRRI-28 Rice)</option>
                  <option value="Deshi Diamond Potato">ডায়মন্ড আলু (Diamond Potato)</option>
                  <option value="Red Onion">দেশি পেঁয়াজ (Red Onion)</option>
                  <option value="Garlic">রসুন (Garlic)</option>
                  <option value="Mustard Seed">সরিষা বীজ (Mustard Seed)</option>
                  <option value="Red Lentils">মসুর ডাল (Red Lentils)</option>
                  <option value="Green Chili">কাঁচা মরিচ (Green Chili)</option>
                  <option value="Raw Jute">তোষা পাট (Raw Jute)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'পরিমাণ (কেজি) *' : 'Weight (Kg) *'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value ? Number(e.target.value) : '')}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রতি কেজি দর (৳) *' : 'Rate / Kg (৳) *'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={unitPricePerKg}
                    onChange={(e) => setUnitPricePerKg(e.target.value ? Number(e.target.value) : '')}
                    placeholder="35"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Total Payout Calculator Card */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                    {isBn ? 'কৃষককে মোট প্রদেয় টাকা:' : 'Total Farmer Payout:'}
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    ৳{((typeof quantityKg === 'number' ? quantityKg : 0) * (typeof unitPricePerKg === 'number' ? unitPricePerKg : 0)).toLocaleString()}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payFromDrawer}
                    onChange={(e) => setPayFromDrawer(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{isBn ? 'ড্রয়ার থেকে নগদ প্রদান' : 'Pay from Cash Drawer'}</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'গন্তব্য সেন্ট্রাল ওয়্যারহাউস হাব' : 'Destination Warehouse Hub'}
                </label>
                <select
                  value={destinationHubId}
                  onChange={(e) => setDestinationHubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">{isBn ? '-- হাব নির্বাচন করুন (ঐচ্ছিক) --' : '-- Select Hub (Optional) --'}</option>
                  {hubs.map((h: any) => (
                    <option key={h.id} value={h.id}>
                      {(isBn ? h.nameBn : h.nameEn) || h.name || 'Warehouse Hub'} ({h.district || 'Hub'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isCollectionLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Leaf className="w-4 h-4" />
                {isCollectionLoading
                  ? (isBn ? 'সংগ্রহ নথিভুক্ত হচ্ছে...' : 'Recording...')
                  : (isBn ? 'শস্য সংগ্রহ নিশ্চিত ও কৃষককে নগদ প্রদান' : 'Confirm Produce Intake & Pay Farmer')}
              </button>
            </form>
          </div>

          {/* Collections History & Printable Voucher */}
          <div className="lg:col-span-7 space-y-4">
            {farmerReceipt && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                      {isBn ? 'কৃষক ফসল রসিদ জেনারেট হয়েছে' : 'Farmer Intake Slip Generated'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-sm border border-emerald-300">
                    {farmerReceipt.collectionCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                  <div>
                    <span className="text-slate-500">{isBn ? 'কৃষক:' : 'Farmer:'}</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{farmerReceipt.farmerName}</strong> ({farmerReceipt.farmerPhone})
                  </div>
                  <div>
                    <span className="text-slate-500">{isBn ? 'ফসল ও পরিমাণ:' : 'Crop:'}</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{farmerReceipt.cropType} ({farmerReceipt.quantityKg} kg)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{isBn ? 'দর:' : 'Rate:'}</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">৳{farmerReceipt.unitPricePerKg} / kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{isBn ? 'পরিশোধিত নগদ:' : 'Total Cash Paid:'}</span>{' '}
                    <strong className="text-emerald-600 font-bold">৳{farmerReceipt.totalPayout}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {isBn ? 'কৃষককে রসিদ প্রিন্ট করে দিন' : 'Print Handover Receipt'}
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                {isBn ? 'সাম্প্রতিক কৃষক ফসল সংগ্রহের তালিকা' : 'Recent Produce Aggregation Log'}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">{isBn ? 'কোড' : 'Code'}</th>
                      <th className="p-2.5">{isBn ? 'কৃষক ও ফোন' : 'Farmer'}</th>
                      <th className="p-2.5">{isBn ? 'শস্য' : 'Crop'}</th>
                      <th className="p-2.5">{isBn ? 'ওজন' : 'Weight'}</th>
                      <th className="p-2.5">{isBn ? 'পরিশোধ' : 'Payout'}</th>
                      <th className="p-2.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {collections.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          {isBn ? 'কোনো ফসল সংগ্রহের রেকর্ড নেই।' : 'No produce collection records yet.'}
                        </td>
                      </tr>
                    ) : (
                      collections.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono font-semibold">{c.collectionCode}</td>
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{c.farmerName}</div>
                            <div className="text-[10px] text-slate-400">{c.farmerPhone}</div>
                          </td>
                          <td className="p-2.5">{c.cropType}</td>
                          <td className="p-2.5 font-bold">{c.quantityKg} kg</td>
                          <td className="p-2.5 font-bold text-emerald-600">৳{c.totalPayout}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CASH DRAWER RECONCILIATION & TRANSACTION LEDGER
          ========================================================================= */}
      {activeTab === 'drawer' && (
        <div className="space-y-6">
          {/* Active Drawer Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500">{isBn ? 'প্রারম্ভিক ক্যাশ ফ্লোট' : 'Opening Float'}</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                ৳{activeSession ? Number(activeSession.openingFloat).toLocaleString() : '0'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-emerald-600 font-semibold">{isBn ? 'মোট ক্যাশ জমা (Cash In)' : 'Total Cash In'}</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +৳{activeSession ? Number(activeSession.cashIn).toLocaleString() : '0'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-rose-600 font-semibold">{isBn ? 'মোট ক্যাশ খরচ (Cash Out)' : 'Total Cash Out'}</div>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                -৳{activeSession ? Number(activeSession.cashOut).toLocaleString() : '0'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                {isBn ? 'প্রত্যাশিত নগদ (Expected Balance)' : 'Expected Closing Cash'}
              </div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                ৳{currentDrawerCash.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                {isBn ? 'চলতি শিফটের ক্যাশ ড্রয়ার ট্রানজ্যাকশন লেজার' : 'Active Shift Cash Movement Ledger'}
              </h3>
              <span className="text-xs text-slate-500">
                {activeSession?.transactions?.length || 0} {isBn ? 'টি এন্ট্রি' : 'entries'}
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">{isBn ? 'সময়' : 'Time'}</th>
                    <th className="p-2.5">{isBn ? 'ধরন' : 'Type'}</th>
                    <th className="p-2.5">{isBn ? 'বিবরণ ও রেফারেন্স' : 'Description'}</th>
                    <th className="p-2.5 text-right">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {!activeSession?.transactions || activeSession.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        {isBn ? 'এই শিফটে কোনো ট্রানজ্যাকশন হয়নি।' : 'No transactions recorded in active shift.'}
                      </td>
                    </tr>
                  ) : (
                    activeSession.transactions.map((tx) => {
                      const isPositive =
                        tx.type === 'CASH_IN_ORDER' || tx.type === 'CASH_IN_FLOAT_ADD';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 text-slate-400 font-mono">
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">
                            {tx.note || (tx.orderId ? `Order #${tx.orderId.slice(0, 8)}` : 'Cash Entry')}
                          </td>
                          <td className={`p-2.5 text-right font-bold ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isPositive ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: POST OFFICE & MFI SETTLEMENTS
          ========================================================================= */}
      {activeTab === 'settlement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submit Deposit Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              {isBn ? 'ডাকঘর বা ব্যাংক ক্যাশ ডিপোজিট স্লিপ' : 'Post Office / Bank Deposit Voucher'}
            </h2>

            <form onSubmit={handleCreateSettlement} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ডিপোজিট চ্যানেল *' : 'Settlement Channel *'}
                </label>
                <select
                  value={settlementChannel}
                  onChange={(e) => setSettlementChannel(e.target.value as SettlementChannel)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="POST_OFFICE">বাংলাদেশ ডাকবিভাগ ই-পোস্ট (Bangladesh Post Office)</option>
                  <option value="MFI_BRANCH">এমএফআই শাখা - ব্র্যাক / গ্রামীণ / আশা (MFI Branch)</option>
                  <option value="AGENT_BANKING">এজেন্ট ব্যাংকিং - ব্যাংক এশিয়া / সোনালী (Agent Banking)</option>
                  <option value="BKASH_AGENT">বিকাশ / নগদ এজেন্ট পয়েন্ট (MFS Agent Outlet)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'জমা দেওয়া নগদ টাকার পরিমাণ (৳) *' : 'Amount Deposited (৳) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder={`৳${currentDrawerCash}`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'শাখা ও স্লিপ রেফারেন্স নম্বর *' : 'Branch & Deposit Slip Ref Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={channelReference}
                  onChange={(e) => setChannelReference(e.target.value)}
                  placeholder={isBn ? 'সারিয়াকান্দি উপজেলা ডাকঘর, রসিদ #৭৮২১' : 'Sariakandi Post Office, Slip #7821'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'স্লিপ বা রসিদের ছবি লিঙ্ক (ঐচ্ছিক)' : 'Receipt Photo / Slip URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={slipReceiptUrl}
                  onChange={(e) => setSlipReceiptUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isSettlementLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4" />
                {isSettlementLoading
                  ? (isBn ? 'জমা হচ্ছে...' : 'Submitting...')
                  : (isBn ? 'ডিপোজিট ভাউচার জমা দিন' : 'Submit Cash Deposit Voucher')}
              </button>
            </form>
          </div>

          {/* Settlements History */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {isBn ? 'পূর্ববর্তী ক্যাশ ডিপোজিট ভাউচার ও স্ট্যাটাস' : 'Past Cash Settlement Vouchers'}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">{isBn ? 'ভাউচার কোড' : 'Code'}</th>
                    <th className="p-2.5">{isBn ? 'চ্যানেল ও রেফারেন্স' : 'Channel & Ref'}</th>
                    <th className="p-2.5">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                    <th className="p-2.5">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {settlements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        {isBn ? 'কোনো ডিপোজিট ভাউচার নেই।' : 'No deposit vouchers submitted yet.'}
                      </td>
                    </tr>
                  ) : (
                    settlements.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-semibold">{s.settlementCode}</td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{s.settlementChannel}</div>
                          <div className="text-[10px] text-slate-400">{s.channelReference}</div>
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600">৳{s.amount}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : s.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: AGENT PERFORMANCE & COMMISSION
          ========================================================================= */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500">{isBn ? 'সহায়তাকৃত অর্ডার সংখ্যা' : 'Assisted Orders'}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {summary.totalOrdersCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isBn ? 'মোট বিক্রয়: ৳' : 'Total Sales: ৳'}{summary.totalSalesVolume.toLocaleString()}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                {isBn ? '২% এজেন্ট কমিশন অর্জিত' : '2% Commission Earned'}
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ৳{summary.totalCommissionEarned.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                {isBn ? 'সরাসরি ওয়ালেটে জমাযোগ্য' : 'Credited to Agent Wallet'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500">{isBn ? 'সংগৃহীত মোট শস্য (কেজি)' : 'Produce Collected'}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {summary.totalCollectedKg.toLocaleString()} kg
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isBn ? 'কৃষককে পরিশোধ: ৳' : 'Farmer Payout: ৳'}{summary.totalFarmerPayout.toLocaleString()}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500">{isBn ? 'ডাকঘর ভেরিফাইড ডিপোজিট' : 'Verified Deposits'}</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ৳{summary.verifiedSettlementsAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                {isBn ? 'অপেক্ষমাণ: ৳' : 'Pending: ৳'}{summary.pendingSettlementsAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OPEN CASH DRAWER
          ========================================================================= */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              {isBn ? 'নতুন ক্যাশ ড্রয়ার শিফট শুরু করুন' : 'Open New Cash Drawer Session'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'দিনের শুরুতে ড্রয়ারে রাখা প্রারম্ভিক ভাঙতি ক্যাশ ফ্লোট এন্ট্রি করুন।'
                : 'Enter your opening cash float for making change at the start of shift.'}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'প্রারম্ভিক ক্যাশ ফ্লোট (৳) *' : 'Opening Float (৳) *'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মন্তব্য (ঐচ্ছিক)' : 'Opening Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  placeholder={isBn ? 'সকালের শিফট শুরু' : 'Morning shift start'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isOpenDrawerLoading}
                onClick={handleOpenDrawer}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                {isOpenDrawerLoading
                  ? (isBn ? 'ওপেন হচ্ছে...' : 'Opening...')
                  : (isBn ? 'ড্রয়ার ওপেন করুন' : 'Confirm & Open Drawer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CLOSE CASH DRAWER & RECONCILE NOTES
          ========================================================================= */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              {isBn ? 'শিফট সমাপনী ও টাকা গণনা' : 'Close Shift & Reconcile Physical Cash'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'ড্রয়ারের সকল নোট ও কয়েন গণনা করে নোটের সংখ্যা লিখুন। সিস্টেম স্বয়ংক্রিয়ভাবে মিলিয়ে দেখবে।'
                : 'Count each bill in your cash drawer. The system will compute exact variance.'}
            </p>

            {/* Denomination Notes Counter */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold">৳১,০০০ নোট সংখ্যা:</label>
                  <input
                    type="number"
                    min="0"
                    value={countedNotes.n1000}
                    onChange={(e) => setCountedNotes({ ...countedNotes, n1000: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold">৳৫০০ নোট সংখ্যা:</label>
                  <input
                    type="number"
                    min="0"
                    value={countedNotes.n500}
                    onChange={(e) => setCountedNotes({ ...countedNotes, n500: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold">৳২০০ নোট সংখ্যা:</label>
                  <input
                    type="number"
                    min="0"
                    value={countedNotes.n200}
                    onChange={(e) => setCountedNotes({ ...countedNotes, n200: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold">৳১০০ নোট সংখ্যা:</label>
                  <input
                    type="number"
                    min="0"
                    value={countedNotes.n100}
                    onChange={(e) => setCountedNotes({ ...countedNotes, n100: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold">৳৫০ নোট সংখ্যা:</label>
                  <input
                    type="number"
                    min="0"
                    value={countedNotes.n50}
                    onChange={(e) => setCountedNotes({ ...countedNotes, n50: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold">৳২০/১০ নোট ও কয়েন:</label>
                  <input
                    type="number"
                    min="0"
                    value={countedNotes.coins}
                    onChange={(e) => setCountedNotes({ ...countedNotes, coins: Number(e.target.value) })}
                    className="w-full px-2 py-1 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Total Counted vs Expected Balance Comparison */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-400">{isBn ? 'প্রত্যাশিত নগদ' : 'Expected'}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">৳{currentDrawerCash}</div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-400">{isBn ? 'গণনাকৃত টাকা' : 'Physical Cash'}</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">৳{countedPhysicalTotal}</div>
                </div>

                <div className={`p-2 rounded-lg ${
                  discrepancy === 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : discrepancy > 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  <div className="text-[10px] font-semibold">
                    {discrepancy === 0 ? (isBn ? 'হিসাব সমান' : 'Balanced') : discrepancy > 0 ? (isBn ? 'উদ্বৃত্ত' : 'Surplus') : (isBn ? 'ঘাটতি' : 'Shortage')}
                  </div>
                  <div className="text-sm font-black">
                    {discrepancy > 0 ? `+৳${discrepancy}` : discrepancy < 0 ? `-৳${Math.abs(discrepancy)}` : '৳০'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'সমাপনী মন্তব্য (ঐচ্ছিক)' : 'Closing Notes (Optional)'}
              </label>
              <input
                type="text"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder={isBn ? 'শিফট সুষ্ঠুভাবে সমাপ্ত' : 'Shift closed smoothly'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isCloseDrawerLoading}
                onClick={handleCloseDrawer}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                {isCloseDrawerLoading
                  ? (isBn ? 'সমাপ্ত হচ্ছে...' : 'Closing...')
                  : (isBn ? 'ড্রয়ার লক ও শিফট সমাপনী' : 'Lock Drawer & Close Shift')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
