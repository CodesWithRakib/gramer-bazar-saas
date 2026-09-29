import React from 'react';
import { Check, Clock, Package, Truck, Inbox, XCircle, Undo2, Store } from 'lucide-react';
import { OrderStatusHistoryItem } from '@/features/orders/ordersApi';
import { format } from 'date-fns';
import { enUS, bn } from 'date-fns/locale';

interface OrderTrackingTimelineProps {
  statusHistory: OrderStatusHistoryItem[];
  currentStatus: string;
  lang: string;
}

/**
 * The real fulfilment flow coming from the API is:
 * PENDING → CONFIRMED → PROCESSING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED.
 * (`ASSIGNED_TO_RIDER` is an in-between state of READY_FOR_PICKUP.)
 *
 * Earlier this timeline used a `SHIPPED` step that the API never emits and
 * treated `PICKED_UP` as `DELIVERED`, so an order that was only picked up from
 * the shop showed as delivered to the customer.
 */
const FLOW = [
  { id: 'PENDING', label: { en: 'Order Placed', bn: 'অর্ডার করা হয়েছে' }, icon: Clock },
  { id: 'CONFIRMED', label: { en: 'Confirmed', bn: 'নিশ্চিত হয়েছে' }, icon: Check },
  { id: 'PROCESSING', label: { en: 'Packing', bn: 'প্যাকিং চলছে' }, icon: Package },
  { id: 'READY_FOR_PICKUP', label: { en: 'Ready', bn: 'প্রস্তুত' }, icon: Store },
  { id: 'OUT_FOR_DELIVERY', label: { en: 'On the way', bn: 'পথে আছে' }, icon: Truck },
  { id: 'DELIVERED', label: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' }, icon: Inbox },
] as const;

/** Legacy / intermediate statuses mapped onto their nearest visible step. */
const STATUS_ALIASES: Record<string, string> = {
  ASSIGNED_TO_RIDER: 'READY_FOR_PICKUP',
  PICKED_UP: 'OUT_FOR_DELIVERY',
  SHIPPED: 'OUT_FOR_DELIVERY',
};

function normalize(status: string): string {
  const upper = status.toUpperCase();
  return STATUS_ALIASES[upper] ?? upper;
}

export function OrderTrackingTimeline({
  statusHistory,
  currentStatus,
  lang,
}: OrderTrackingTimelineProps) {
  const isBn = lang === 'bn';
  const dateLocale = isBn ? bn : enUS;

  const currentStatusUpper = currentStatus.toUpperCase();
  const isCancelled = currentStatusUpper === 'CANCELLED' || currentStatusUpper === 'FAILED';
  const isReturned = currentStatusUpper === 'RETURNED' || currentStatusUpper === 'REFUNDED';

  const normalizedCurrent = normalize(currentStatusUpper);
  const currentFlowIndex = FLOW.findIndex((step) => step.id === normalizedCurrent);

  return (
    <div className="py-6 sm:py-8">
      {/* Edge cases: Cancelled or Returned */}
      {(isCancelled || isReturned) && (
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-6">
          {isCancelled ? (
            <>
              <XCircle className="mb-3 h-12 w-12 text-destructive" />
              <h3 className="text-lg font-bold text-destructive">
                {isBn ? 'অর্ডারটি বাতিল করা হয়েছে' : 'Order cancelled'}
              </h3>
            </>
          ) : (
            <>
              <Undo2 className="mb-3 h-12 w-12 text-destructive" />
              <h3 className="text-lg font-bold text-destructive">
                {isBn ? 'অর্ডারটি ফেরত নেওয়া হয়েছে' : 'Order returned'}
              </h3>
            </>
          )}
          {statusHistory.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {format(new Date(statusHistory[statusHistory.length - 1].createdAt), 'PPP p', {
                locale: dateLocale,
              })}
            </p>
          )}
        </div>
      )}

      <div className="relative flex w-full flex-col md:flex-row md:justify-between">
        {/* Horizontal rail (desktop) — symmetric inset keeps it RTL-safe */}
        <div className="absolute inset-x-[8%] top-6 -z-10 hidden h-[2px] bg-muted md:block" />

        {/* Vertical rail (mobile) */}
        <div className="absolute bottom-6 start-6 top-6 -z-10 block w-[2px] bg-muted md:hidden" />

        {FLOW.map((step, index) => {
          const historyItem = statusHistory.find((h) => normalize(h.status) === step.id);

          const isCompleted =
            !!historyItem ||
            (!isCancelled && !isReturned && currentFlowIndex !== -1 && index <= currentFlowIndex);
          const isCurrent =
            currentFlowIndex === index &&
            !isCancelled &&
            !isReturned &&
            step.id === normalizedCurrent;

          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="group relative mb-8 flex w-full items-start gap-4 md:mb-0 md:w-[16.6%] md:flex-col md:items-center md:gap-3"
            >
              {/* Progress fill (desktop) */}
              {index > 0 && isCompleted && (
                <div className="absolute end-[50%] top-6 -z-10 hidden h-[2px] w-full bg-primary md:block" />
              )}
              {/* Progress fill (mobile) */}
              {index > 0 && isCompleted && (
                <div className="absolute start-6 bottom-[50%] -z-10 block h-full w-[2px] bg-primary md:hidden" />
              )}

              <div
                className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 transition-colors duration-300 ${
                  isCompleted
                    ? 'border-primary/20 bg-primary text-primary-foreground'
                    : 'border-muted bg-background text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="mt-1 flex min-w-0 flex-col text-start md:items-center md:text-center">
                <span
                  className={`text-sm font-semibold md:text-base ${
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {isBn ? step.label.bn : step.label.en}
                </span>

                {historyItem ? (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(historyItem.createdAt), 'MMM dd, hh:mm a', {
                      locale: dateLocale,
                    })}
                  </span>
                ) : isCurrent ? (
                  <span className="mt-1 text-xs font-medium text-primary">
                    {isBn ? 'চলছে' : 'In progress'}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
