'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetUnreadCountQuery,
  useMarkMessagesAsReadMutation,
  useSendMessageRestMutation,
} from '@/features/chat/chatApi';
import { useChatSocket } from '@/hooks/useChatSocket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MessageCircle, X, ChevronLeft, Send, ShoppingBag, Package, Truck, Loader2 } from 'lucide-react';
import {
  closeChatWidget,
  selectActiveConversationId,
  selectIsWidgetOpen,
  setActiveConversation,
  toggleChatWidget,
} from '@/store/slices/chatSlice';

export function FloatingChatWidget({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const dispatch = useAppDispatch();
  const isWidgetOpen = useAppSelector(selectIsWidgetOpen);
  const activeConversationId = useAppSelector(selectActiveConversationId);

  const profile = useAppSelector((state) => state.auth.user);
  const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsQuery(undefined, {
    skip: !profile,
  });

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !profile,
    pollingInterval: 30000,
  });

  const { isConnected, sendMessage, markRead } = useChatSocket(
    activeConversationId ?? undefined,
  );
  const [sendMessageRest] = useSendMessageRestMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  const { data: messages, isLoading: isLoadingMessages } = useGetMessagesQuery(
    activeConversationId as string, 
    { skip: !activeConversationId || !isWidgetOpen }
  );

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length, isWidgetOpen]);

  // Mark as read when active
  useEffect(() => {
    if (activeConversationId && isWidgetOpen) {
      markAsRead(activeConversationId).catch(() => {});
      markRead(activeConversationId);
    }
  }, [activeConversationId, isWidgetOpen, markAsRead, markRead, messages?.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeConversationId || isSending) return;

    setIsSending(true);
    try {
      if (isConnected) {
        sendMessage(content);
      } else {
        await sendMessageRest({ conversationId: activeConversationId, content }).unwrap();
      }
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getReferenceBadge = (refType?: string | null, refId?: string | null) => {
    if (!refId && !refType) return null;
    const type = refType?.toUpperCase() || 'REF';
    let icon = <ShoppingBag className="h-2.5 w-2.5 mr-0.5" />;
    let label = refId ? `#${refId.slice(0, 6)}` : type;

    if (type.includes('PRODUCT')) {
      icon = <Package className="h-2.5 w-2.5 mr-0.5" />;
      label = `Product`;
    } else if (type.includes('DELIVERY')) {
      icon = <Truck className="h-2.5 w-2.5 mr-0.5" />;
      label = `Delivery`;
    }

    return (
      <Badge variant="outline" className="text-[9px] font-normal py-0 h-3.5 px-1 border-primary/30 text-primary">
        {icon}
        <span className="truncate max-w-[80px]">{label}</span>
      </Badge>
    );
  };

  if (!profile) return null;

  const totalUnread = unreadData?.unreadCount ?? 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* The Widget Panel */}
      {isWidgetOpen && (
        <div className="bg-background border rounded-2xl shadow-2xl w-[350px] sm:w-[390px] h-[540px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 border-b bg-primary text-primary-foreground flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              {activeConversationId && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground -ml-2"
                  onClick={() => dispatch(setActiveConversation(null))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <h3 className="font-semibold text-base">
                {activeConversationId ? (isBn ? 'চ্যাট' : 'Chat') : (isBn ? 'মেসেজ সমূহ' : 'Messages')}
              </h3>
              {!activeConversationId && isConnected && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 ml-1" title="Connected"></span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground -mr-1"
              onClick={() => dispatch(closeChatWidget())}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-muted/10">
            {!activeConversationId ? (
              /* Conversation List View */
              <ScrollArea className="flex-1">
                {isLoadingConversations && (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs">{isBn ? 'লোড হচ্ছে...' : 'Loading conversations...'}</span>
                  </div>
                )}
                {!isLoadingConversations && conversations?.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    {isBn ? 'কোন মেসেজ নেই' : 'No messages yet'}
                  </div>
                )}
                {!isLoadingConversations && conversations?.map((conv) => {
                  const otherParticipant = conv.participants.find((p) => p.id !== profile?.id) || conv.participants[0];
                  const lastMsg = conv.lastMessage || (conv.messages && conv.messages[conv.messages.length - 1]);
                  const unreadCount = conv.unreadCount || 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => dispatch(setActiveConversation(conv.id))}
                      className="p-3 border-b cursor-pointer hover:bg-accent/50 transition-colors flex items-center gap-3 bg-background"
                    >
                      <Avatar className="h-10 w-10 border flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {otherParticipant?.firstName?.charAt(0) || 'U'}{otherParticipant?.lastName?.charAt(0) || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`font-medium truncate text-sm ${unreadCount > 0 ? 'text-primary font-bold' : ''}`}>
                            {otherParticipant?.firstName} {otherParticipant?.lastName}
                          </p>
                          {(conv.referenceId || conv.referenceType) && (
                            getReferenceBadge(conv.referenceType, conv.referenceId)
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {lastMsg?.content || (isBn ? 'নতুন মেসেজ নেই' : 'No messages yet')}
                          </p>
                          {unreadCount > 0 && (
                            <span className="h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            ) : (
              /* Active Chat View */
              <div className="flex-1 flex flex-col h-full bg-background">
                <ScrollArea className="flex-1 p-3 bg-muted/5">
                  {isLoadingMessages ? (
                    <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>{isBn ? 'লোড হচ্ছে...' : 'Loading messages...'}</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages?.map((msg) => {
                        const isMine = msg.senderId === profile?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-2.5 text-sm ${isMine ? 'bg-primary text-primary-foreground rounded-br-xs' : 'bg-muted rounded-bl-xs border shadow-xs'}`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <span className={`text-[10px] mt-1 block ${isMine ? 'text-primary-foreground/75 text-right' : 'text-muted-foreground'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-3 border-t bg-background">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isBn ? 'মেসেজ লিখুন...' : 'Type a message...'}
                      className="flex-1 rounded-full bg-muted/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary text-sm h-9"
                      disabled={isSending}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full h-9 w-9 shrink-0 shadow-sm"
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button 
        onClick={() => dispatch(toggleChatWidget())}
        className={`rounded-full h-14 w-14 shadow-2xl transition-transform hover:scale-105 ${isWidgetOpen ? 'bg-muted text-muted-foreground hover:bg-muted' : 'bg-primary'}`}
        size="icon"
      >
        {isWidgetOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.2 min-w-[20px] h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-background shadow-sm animate-in zoom-in-50">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}

