'use client';
import { use } from 'react';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useGetConversationsQuery, Conversation } from '@/features/chat/chatApi';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageSquare, User } from 'lucide-react';

export default function RiderMessagesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: conversations, isLoading } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('RIDER')) {
      router.push(`/${lang}/login?redirect=/${lang}/rider/messages`);
    }
  }, [isAuthenticated, user?.roles, router, lang]);

  if (!isAuthenticated || !user) return null;

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.id !== user.id) || conv.participants[0];
  };

  const unreadCount = (conv: Conversation) => {
    return conv.messages?.filter(m => !m.isRead && m.senderId !== user.id).length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'বার্তা' : 'Messages'}</h1>
      </div>
      
      <div className="flex h-[calc(100vh-200px)] border rounded-2xl overflow-hidden bg-card shadow-sm">
        {/* Conversations List (Sidebar) */}
        <div className="w-full md:w-1/3 border-r flex flex-col">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {isBn ? 'চ্যাট তালিকা' : 'Chat List'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                <p>{isBn ? 'কোনো মেসেজ নেই' : 'No messages yet'}</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map(conv => {
                  const otherUser = getOtherParticipant(conv);
                  const unread = unreadCount(conv);
                  const lastMessage = conv.messages?.[conv.messages.length - 1];
                  
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-start gap-3 ${activeConversationId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-medium truncate">{otherUser.firstName} {otherUser.lastName}</h4>
                          {lastMessage && (
                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                              {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(lastMessage.createdAt))}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {lastMessage ? lastMessage.content : 'No messages yet'}
                          </p>
                          {unread > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-col flex-1 bg-muted/10">
          {activeConversationId ? (
            <ChatWindow
              conversationId={activeConversationId}
              participantName={
                (() => {
                  const conv = conversations?.find(c => c.id === activeConversationId);
                  if (!conv) return 'Unknown';
                  const p = getOtherParticipant(conv);
                  return `${p.firstName} ${p.lastName}`;
                })()
              }
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p>{isBn ? 'কথোপকথন শুরু করতে একটি নির্বাচন করুন' : 'Select a conversation to start chatting'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
