import { ChatInterface } from '@/components/chat/ChatInterface';

export default function SellerMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with customers and admins.</p>
      </div>
      <ChatInterface />
    </div>
  );
}
