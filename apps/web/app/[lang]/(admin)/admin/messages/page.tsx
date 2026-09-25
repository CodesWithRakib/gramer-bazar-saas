import { ChatInterface } from '@/components/chat/ChatInterface';

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Manage and resolve conversations with users across the platform.</p>
      </div>
      <ChatInterface />
    </div>
  );
}
