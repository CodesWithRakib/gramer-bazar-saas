'use client';

import React, { useState, use } from 'react';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import { OrderCard } from '@/components/orders/OrderCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface CustomerOrdersViewProps {
  lang?: string;
}

export function CustomerOrdersView({ lang = 'en' }: CustomerOrdersViewProps) {
  const isBn = lang === 'bn';
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [activeTab, setActiveTab] = useState('all');

  const filterOrders = (statusGroup: string) => {
    if (!orders) return [];
    if (statusGroup === 'all') return orders;
    
    return orders.filter(order => {
      const status = order.status.toLowerCase();
      switch (statusGroup) {
        case 'to-pay':
          return status === 'pending' && order.paymentStatus.toLowerCase() !== 'paid';
        case 'to-ship':
          return status === 'confirmed' || status === 'processing';
        case 'to-receive':
          return status === 'shipped' || status === 'out_for_delivery' || status === 'ready_for_pickup';
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
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-12 w-full mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="w-full py-16 text-center">
        <PackageX className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">
          {isBn ? 'অর্ডার লোড করতে সমস্যা হয়েছে' : 'Failed to load orders'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isBn ? 'দয়া করে একটু পর আবার চেষ্টা করুন।' : 'Please try again after some time.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
        {isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
      </h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto hide-scrollbar border-b pb-[1px] mb-6">
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

        <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border mt-4">
              <PackageX className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {isBn ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isBn 
                  ? 'এই বিভাগে আপনার কোনো অর্ডার নেই।' 
                  : "You don't have any orders in this category yet."}
              </p>
              <Button asChild>
                <Link href={`/${lang}/categories`}>
                  {isBn ? 'শপিং শুরু করুন' : 'Start Shopping'}
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
