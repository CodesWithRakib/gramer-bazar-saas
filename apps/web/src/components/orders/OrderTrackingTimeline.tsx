import React from 'react';
import { Check, Clock, Package, Truck, Inbox, XCircle, Undo2 } from 'lucide-react';
import { OrderStatusHistoryItem } from '@/features/orders/ordersApi';
import { format } from 'date-fns';
import { enUS, bn } from 'date-fns/locale';

interface OrderTrackingTimelineProps {
  statusHistory: OrderStatusHistoryItem[];
  currentStatus: string;
  lang: string;
}

export function OrderTrackingTimeline({ statusHistory, currentStatus, lang }: OrderTrackingTimelineProps) {
  const isBn = lang === 'bn';
  const dateLocale = isBn ? bn : enUS;

  // The standard linear flow
  const flow = [
    { id: 'PENDING', label: { en: 'Order Placed', bn: 'অর্ডার করা হয়েছে' }, icon: Clock },
    { id: 'CONFIRMED', label: { en: 'Confirmed', bn: 'নিশ্চিত করা হয়েছে' }, icon: Check },
    { id: 'PROCESSING', label: { en: 'Processing', bn: 'প্রক্রিয়াধীন' }, icon: Package },
    { id: 'SHIPPED', label: { en: 'Shipped', bn: 'শিপ করা হয়েছে' }, icon: Truck },
    { id: 'DELIVERED', label: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' }, icon: Inbox },
  ];

  const currentStatusUpper = currentStatus.toUpperCase();
  const isCancelled = currentStatusUpper === 'CANCELLED' || currentStatusUpper === 'FAILED';
  const isReturned = currentStatusUpper === 'RETURNED';

  // Find the index of the current status in the normal flow
  const currentFlowIndex = flow.findIndex(f => 
    f.id === currentStatusUpper || 
    (f.id === 'SHIPPED' && currentStatusUpper === 'OUT_FOR_DELIVERY') ||
    (f.id === 'DELIVERED' && currentStatusUpper === 'PICKED_UP')
  );

  return (
    <div className="py-8">
      {/* Edge cases: Cancelled or Returned */}
      {(isCancelled || isReturned) && (
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-destructive/10 rounded-xl border border-destructive/20 mb-8">
          {isCancelled ? (
            <>
              <XCircle className="w-12 h-12 text-destructive mb-3" />
              <h3 className="text-lg font-bold text-destructive">
                {isBn ? 'অর্ডারটি বাতিল করা হয়েছে' : 'Order Cancelled'}
              </h3>
            </>
          ) : (
            <>
              <Undo2 className="w-12 h-12 text-destructive mb-3" />
              <h3 className="text-lg font-bold text-destructive">
                {isBn ? 'অর্ডারটি ফেরত দেওয়া হয়েছে' : 'Order Returned'}
              </h3>
            </>
          )}
          {statusHistory.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {format(new Date(statusHistory[statusHistory.length - 1].createdAt), 'PPP p', { locale: dateLocale })}
            </p>
          )}
        </div>
      )}

      {/* Normal Timeline */}
      <div className="relative flex flex-col md:flex-row justify-between w-full">
        {/* Horizontal Line for Desktop */}
        <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-muted -z-10" />
        
        {/* Vertical Line for Mobile */}
        <div className="block md:hidden absolute left-6 top-6 bottom-6 w-[2px] bg-muted -z-10" />

        {flow.map((step, index) => {
          // A step is completed if it exists in history OR if the current flow index is past this step
          const historyItem = statusHistory.find(h => 
            h.status === step.id || 
            (step.id === 'SHIPPED' && h.status === 'OUT_FOR_DELIVERY') ||
            (step.id === 'DELIVERED' && h.status === 'PICKED_UP')
          );
          
          const isCompleted = !!historyItem || (currentFlowIndex !== -1 && index <= currentFlowIndex);
          const isCurrent = currentFlowIndex === index && !isCancelled && !isReturned;
          
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-3 mb-8 md:mb-0 w-full md:w-1/5 group">
              {/* Desktop Progress Line Fill */}
              {index > 0 && isCompleted && (
                <div className="hidden md:block absolute top-6 right-[50%] w-full h-[2px] bg-primary -z-10" />
              )}
              {/* Mobile Progress Line Fill */}
              {index > 0 && isCompleted && (
                <div className="block md:hidden absolute left-6 bottom-[50%] h-full w-[2px] bg-primary -z-10" />
              )}

              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 z-10
                ${isCompleted ? 'bg-primary border-primary/20 text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}
                ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                ${(isCancelled || isReturned) && isCompleted && !historyItem ? 'opacity-50 grayscale' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex flex-col md:items-center text-left md:text-center mt-1">
                <span className={`font-semibold text-sm md:text-base ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {isBn ? step.label.bn : step.label.en}
                </span>
                
                {historyItem && (
                  <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    {format(new Date(historyItem.createdAt), 'MMM dd, hh:mm a', { locale: dateLocale })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
