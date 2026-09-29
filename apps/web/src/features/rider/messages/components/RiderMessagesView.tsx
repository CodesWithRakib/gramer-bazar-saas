import { ChatInterface } from '@/components/chat/ChatInterface';

export interface RiderMessagesViewProps {
  lang?: string;
}

export function RiderMessagesView({ lang = 'en' }: RiderMessagesViewProps) {
  const isBn = lang === 'bn';

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'বার্তা' : 'Messages'}</h1>
        <p className="text-muted-foreground">
          {isBn
            ? 'ডেলিভারি নিয়ে গ্রাহকদের সাথে যোগাযোগ করুন।'
            : 'Communicate with customers about deliveries.'}
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
