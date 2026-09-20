import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ProfileMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with sellers, riders, and support.</p>
      </div>
      <ChatInterface />
    </div>
  );
}
