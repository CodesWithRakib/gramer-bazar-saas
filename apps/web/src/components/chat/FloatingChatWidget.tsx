'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  chatApi,
  ChatMessage,
} from '@/features/chat/chatApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetProfileQuery } from '@/features/auth/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MessageCircle, X, ChevronLeft, Send } from 'lucide-react';
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

  const { socket, isConnected } = useSocket();
  const { data: profile } = useGetProfileQuery();
  const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsQuery(undefined, {
    pollingInterval: 30000,
    skip: !profile, // Don't fetch if not logged in
  });

  const { data: messages, isLoading: isLoadingMessages } = useGetMessagesQuery(activeConversationId as string, {
    skip: !activeConversationId || !isWidgetOpen,
  });

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWidgetOpen]);

  useEffect(() => {
    if (!socket || !activeConversationId || !isWidgetOpen) return;

    socket.emit('join_conversation', { conversationId: activeConversationId });

    const handleNewMessage = (message: ChatMessage) => {
      // Optimistically update the RTK cache
      dispatch(
        chatApi.util.updateQueryData('getMessages', activeConversationId, (draft) => {
          draft.push(message);
        })
      );
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_conversation', { conversationId: activeConversationId });
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeConversationId, isWidgetOpen, dispatch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeConversationId) return;

    socket.emit('send_message', { conversationId: activeConversationId, content: newMessage }, () => {});
    setNewMessage('');
  };

  if (!profile) return null; // Hide if not authenticated

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* The Widget Panel */}
      {isWidgetOpen && (
        <div className="bg-background border rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[550px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 border-b bg-primary text-primary-foreground flex items-center justify-between shadow-sm">
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
              <h3 className="font-semibold text-lg">
                {activeConversationId ? (isBn ? 'চ্যাট' : 'Chat') : (isBn ? 'মেসেজ সমূহ' : 'Messages')}
              </h3>
              {!activeConversationId && isConnected && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 ml-2" title="Connected"></span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground -mr-2"
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
                {isLoadingConversations && <div className="p-8 text-center text-muted-foreground">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>}
                {!isLoadingConversations && conversations?.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    {isBn ? 'কোন মেসেজ নেই' : 'No messages yet'}
                  </div>
                )}
                {!isLoadingConversations && conversations?.map((conv) => {
                  const otherParticipant = conv.participants.find((p) => p.id !== profile?.id);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => dispatch(setActiveConversation(conv.id))}
                      className="p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors flex items-center gap-3 bg-background"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {otherParticipant?.firstName?.charAt(0)}{otherParticipant?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden flex-1">
                        <p className="font-medium truncate text-sm">{otherParticipant?.firstName} {otherParticipant?.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.messages?.[conv.messages.length - 1]?.content ||
                            (isBn ? 'নতুন মেসেজ নেই' : 'No messages yet')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            ) : (
              /* Active Chat View */
              <div className="flex-1 flex flex-col h-full bg-background">
                <ScrollArea className="flex-1 p-4 bg-muted/5">
                  {isLoadingMessages ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">{isBn ? 'লোড হচ্ছে...' : 'Loading messages...'}</div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((msg) => {
                        const isMine = msg.senderId === profile?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 ${isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm border'}`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <span className={`text-[10px] mt-1 block ${isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
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
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isBn ? 'মেসেজ লিখুন...' : 'Type a message...'}
                      className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full h-10 w-10 shrink-0 shadow-sm"
                      disabled={!newMessage.trim() || !isConnected}
                    >
                      <Send className="h-4 w-4" />
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
            {/* Real unread counts would go here if backend supported it, for now a generic dot if there are conversations */}
            {conversations && conversations.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}
