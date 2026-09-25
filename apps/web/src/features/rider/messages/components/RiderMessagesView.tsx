import { ChatInterface } from '@/components/chat/ChatInterface';

export interface RiderMessagesViewProps {
  lang?: string;
}

export function RiderMessagesView({ lang = 'en' }: RiderMessagesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with customers for delivery updates.</p>
      </div>
      <ChatInterface />
    </div>
  );
}
