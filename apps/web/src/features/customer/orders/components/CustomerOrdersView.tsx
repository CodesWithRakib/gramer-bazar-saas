'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderSkeleton } from '@/components/ui/Skeletons';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { Package } from 'lucide-react';

export interface CustomerOrdersViewProps {
  lang?: string;
}

export function CustomerOrdersView({ lang = 'en' }: CustomerOrdersViewProps) {
  const isBn = lang === 'bn';
  const router = useRouter();
  const searchParams = useSearchParams();
  // The active tab lives in the URL — no local state to keep in sync.
  const activeTab = searchParams.get('status') || 'all';

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();

  const handleTabChange = (val: string) => {
    setPage(1);
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
            status === 'shipped' || status === 'out_for_delivery' || status === 'ready_for_pickup'
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

  // Tab counts
  const allCount = orders?.length ?? 0;
  const toPayCount = filterOrders('to-pay').length;
  const toShipCount = filterOrders('to-ship').length;
  const toReceiveCount = filterOrders('to-receive').length;
  const completedCount = filterOrders('completed').length;
  const cancelledCount = filterOrders('cancelled').length;

  // Pagination
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

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
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors gap-1.5"
              >
                <span>{isBn ? 'সব' : 'All'}</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  {allCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="to-pay"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors gap-1.5"
              >
                <span>{isBn ? 'পেমেন্ট বাকি' : 'To Pay'}</span>
                {toPayCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    {toPayCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="to-ship"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors gap-1.5"
              >
                <span>{isBn ? 'শিপিং বাকি' : 'To Ship'}</span>
                {toShipCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                    {toShipCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="to-receive"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors gap-1.5"
              >
                <span>{isBn ? 'রিসিভ বাকি' : 'To Receive'}</span>
                {toReceiveCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {toReceiveCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors gap-1.5"
              >
                <span>{isBn ? 'সম্পন্ন' : 'Completed'}</span>
                {completedCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {completedCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-4 py-3 font-medium transition-colors gap-1.5"
              >
                <span>{isBn ? 'বাতিল' : 'Cancelled'}</span>
                {cancelledCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    {cancelledCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent
          value={activeTab}
          className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-4"
        >
          {paginatedOrders.length > 0 ? (
            <>
              <div className="space-y-3.5">
                {paginatedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} lang={lang} />
                ))}
              </div>

              {totalItems > pageSize && (
                <div className="pt-2">
                  <AdminPagination
                    totalItems={totalItems}
                    itemsPerPage={pageSize}
                    currentPage={safePage}
                    lang={lang}
                    limitOptions={[5, 10, 20]}
                    itemLabel={{
                      singular: isBn ? 'অর্ডার' : 'order',
                      plural: isBn ? 'অর্ডার' : 'orders',
                    }}
                    onPageChange={(newPage) => setPage(newPage)}
                    onLimitChange={(newLimit) => {
                      setPageSize(newLimit);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
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
