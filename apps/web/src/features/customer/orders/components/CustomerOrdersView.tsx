'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderSkeleton } from '@/components/ui/Skeletons';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag } from 'lucide-react';

export interface CustomerOrdersViewProps {
  lang?: string;
}

export function CustomerOrdersView({ lang = 'en' }: CustomerOrdersViewProps) {
  const isBn = lang === 'bn';
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('status') || 'all';

  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status && status !== activeTab) {
      setActiveTab(status);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all') {
      params.delete('status');
    } else {
      params.set('status', val);
    }
    const query = params.toString();
    router.replace(`/${lang}/customer/orders${query ? `?${query}` : ''}`, { scroll: false });
  };

  const filterOrders = (statusGroup: string) => {
    if (!orders) return [];
    if (statusGroup === 'all') return orders;

    return orders.filter((order) => {
      const status = order.status.toLowerCase();
      switch (statusGroup) {
        case 'to-pay':
          return status === 'pending' && order.paymentStatus.toLowerCase() !== 'paid';
        case 'to-ship':
          return status === 'confirmed' || status === 'processing';
        case 'to-receive':
          return (
            status === 'shipped' ||
            status === 'out_for_delivery' ||
            status === 'ready_for_pickup'
          );
        case 'completed':
          return status === 'delivered' || status === 'picked_up';
        case 'cancelled':
          return status === 'cancelled' || status === 'failed' || status === 'returned';
        default:
          return true;
      }
    });
  };

  const filteredOrders = filterOrders(activeTab);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title={isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
          description={
            isBn
              ? 'আপনার সকল অর্ডারের বর্তমান অবস্থা এবং ইতিহাস ট্র্যাক করুন।'
              : 'Track the status and history of all your orders.'
          }
        />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title={isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
          description={
            isBn
              ? 'আপনার সকল অর্ডারের বর্তমান অবস্থা এবং ইতিহাস ট্র্যাক করুন।'
              : 'Track the status and history of all your orders.'
          }
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'অর্ডার লোড করতে সমস্যা হয়েছে' : 'Failed to load orders'}
          message={
            isBn
              ? 'সার্ভার থেকে অর্ডারের তথ্য সংগ্রহ করা যায়নি। দয়া করে একটু পর আবার চেষ্টা করুন।'
              : 'Unable to retrieve order details from the server. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
        description={
          isBn
            ? 'আপনার সকল অর্ডারের বর্তমান অবস্থা এবং ইতিহাস ট্র্যাক করুন।'
            : 'Track the status and history of all your orders.'
        }
        badge={
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
            {orders.length} {isBn ? 'টি অর্ডার' : 'orders'}
          </span>
        }
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="relative w-full mb-6">
          <div className="w-full overflow-x-auto hide-scrollbar border-b pb-[1px] scroll-smooth">
            <TabsList className="w-max sm:w-full justify-start sm:justify-between bg-transparent h-auto p-0 rounded-none border-b-0 space-x-2 md:space-x-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors"
              >
                {isBn ? 'সব' : 'All Orders'}
              </TabsTrigger>
              <TabsTrigger
                value="to-pay"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors"
              >
                {isBn ? 'পেমেন্ট বাকি' : 'To Pay'}
              </TabsTrigger>
              <TabsTrigger
                value="to-ship"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors"
              >
                {isBn ? 'শিপিং বাকি' : 'To Ship'}
              </TabsTrigger>
              <TabsTrigger
                value="to-receive"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors"
              >
                {isBn ? 'রিসিভ বাকি' : 'To Receive'}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors"
              >
                {isBn ? 'সম্পন্ন' : 'Completed'}
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancelled'}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} lang={lang} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="w-8 h-8 text-muted-foreground opacity-60" />}
              title={isBn ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
              description={
                isBn
                  ? 'এই ফিল্টারে আপনার কোনো অর্ডার নেই। কেনাকাটা শুরু করতে আমাদের পণ্যসমূহ ব্রাউজ করুন।'
                  : "You don't have any orders matching this category. Explore our catalog to place an order."
              }
              action={{
                label: isBn ? 'শপিং শুরু করুন' : 'Start Shopping',
                href: `/${lang}/categories`,
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
