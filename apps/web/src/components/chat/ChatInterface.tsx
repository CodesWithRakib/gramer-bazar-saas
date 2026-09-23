'use client';

import { useState, useEffect, useRef } from 'react';import { 
  useGetConversationsQuery, 
  useGetMessagesQuery, 
  useMarkMessagesAsReadMutation,
  type ConversationParticipant,
} from '@/features/chat/chatApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useChatSocket } from '@/hooks/useChatSocket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function ChatInterface() {
  // Identity comes from the auth slice (populated by AuthInitializer), so this
  // page never fires /auth/me for anonymous visitors.
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: conversations, isLoading: isConversationsLoading } = useGetConversationsQuery(
    undefined,
    { skip: !user },
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  
  const { isConnected, sendMessage } = useChatSocket(
    activeConversationId ?? undefined,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: isMessagesLoading } = useGetMessagesQuery(
    activeConversationId as string,
    { skip: !activeConversationId }
  );

  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId).catch(console.error);
    }
  }, [activeConversationId, markAsRead, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || !isConnected) return;

    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const getOtherParticipant = (participants: ConversationParticipant[]) => {
    return participants.find((p) => p.id !== user?.id) || participants[0];
  };

  const filteredConversations = conversations?.filter((conv) => {
    const other = getOtherParticipant(conv.participants);
    const fullName = `${other?.firstName} ${other?.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (isConversationsLoading || !user) {
    return (
      <div className="flex h-[600px] items-center justify-center border rounded-lg bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[75vh] min-h-[600px] border rounded-lg bg-card overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b bg-card">
          <h2 className="font-semibold text-lg mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredConversations?.map((conv) => {
                const other = getOtherParticipant(conv.participants);
                const lastMessage = conv.messages[conv.messages.length - 1];
                const isUnread = lastMessage && lastMessage.senderId !== user.id && !lastMessage.isRead;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`flex items-start gap-3 p-4 border-b text-left transition-colors hover:bg-muted/50 ${
                      activeConversationId === conv.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {other?.firstName?.[0]}{other?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`font-medium text-sm truncate ${isUnread ? 'text-primary' : ''}`}>
                          {other?.firstName} {other?.lastName}
                        </span>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(lastMessage.createdAt), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className={`text-xs truncate ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {lastMessage ? (
                            lastMessage.senderId === user.id ? `You: ${lastMessage.content}` : lastMessage.content
                          ) : 'No messages yet'}
                        </span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card relative">
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] border-b p-4 flex items-center justify-between shadow-sm z-10 bg-card">
              <div className="flex items-center gap-3">
                {(() => {
                  const activeConv = conversations?.find((c) => c.id === activeConversationId);
                  const other = activeConv ? getOtherParticipant(activeConv.participants) : null;
                  return (
                    <>
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {other?.firstName?.[0]}{other?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {other?.firstName} {other?.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {other?.role?.toLowerCase()}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {isConnected ? (
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Connected</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span>Disconnected</span>
                  )}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              {isMessagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-4">
                  {messages?.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-white dark:bg-slate-800 border rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span
                            className={`text-[10px] mt-1 block ${
                              isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}
                          >
                            {format(new Date(msg.createdAt), 'HH:mm')}
                            {isMe && (
                              <span className="ml-1">
                                {msg.isRead ? '• Read' : '• Delivered'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-muted/20"
                />
                <Button type="submit" disabled={!messageInput.trim() || !isConnected}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full bg-slate-50/50 dark:bg-slate-900/20">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Send className="h-8 w-8 ml-1" />
            </div>
            <p className="text-lg font-medium">Your Messages</p>
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
