import { ChatInterface } from '@/components/chat/ChatInterface';

export interface SellerMessagesViewProps {
  lang?: string;
}

export function SellerMessagesView({ lang = 'en' }: SellerMessagesViewProps) {
  const isBn = lang === 'bn';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'বার্তা' : 'Messages'}</h1>
        <p className="text-muted-foreground text-sm">
          {isBn
            ? 'গ্রাহক ও অ্যাডমিনদের সাথে সরাসরি যোগাযোগ করুন।'
            : 'Communicate directly with customers and admins.'}
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
