'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useGetConversationsQuery, useGetMessagesQuery, chatApi } from '@/features/chat/chatApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetProfileQuery } from '@/features/auth/authApi';
import { useAppDispatch } from '@/store/hooks';

export function ChatInbox() {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();
  const { data: profile } = useGetProfileQuery();
  const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsQuery(undefined, { pollingInterval: 30000 });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const { data: messages, isLoading: isLoadingMessages } = useGetMessagesQuery(activeConversationId as string, {
    skip: !activeConversationId,
  });

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeConversationId) return;

    socket.emit('join_conversation', { conversationId: activeConversationId });

    const handleNewMessage = (message: any) => {
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
  }, [socket, activeConversationId, dispatch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeConversationId) return;

    socket.emit('send_message', { conversationId: activeConversationId, content: newMessage }, (message: any) => {
       // Optional ack callback
    });
    setNewMessage('');
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b bg-muted/20">
          <h2 className="font-semibold text-lg">Messages {isConnected ? '🟢' : '🔴'}</h2>
        </div>
        <ScrollArea className="flex-1">
          {isLoadingConversations && <div className="p-4 text-center">Loading...</div>}
          {!isLoadingConversations && conversations?.map((conv: any) => {
            const otherParticipant = conv.participants.find((p: any) => p.id !== profile?.id);
            const isActive = conv.id === activeConversationId;
            
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors flex items-center gap-3 ${isActive ? 'bg-accent' : ''}`}
              >
                <Avatar>
                  <AvatarFallback>{otherParticipant?.firstName?.charAt(0)}{otherParticipant?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{otherParticipant?.firstName} {otherParticipant?.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.content || 'No messages yet'}</p>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversationId ? (
          <>
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <h3 className="font-semibold">Chat</h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="text-center py-4">Loading messages...</div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((msg: any) => {
                    const isMine = msg.senderId === profile?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-lg p-3 ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-[10px] opacity-70 mt-1 block">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim() || !isConnected}>Send</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square-dashed text-muted-foreground/50"><path d="M10 17H7l-4 4v-7"/><path d="M14 17h1"/><path d="M14 3h1"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 14v1a2 2 0 0 1-2 2"/><path d="M21 9v1"/><path d="M3 9v1"/><path d="M5 3a2 2 0 0 0-2 2"/><path d="M9 3h1"/></svg>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
