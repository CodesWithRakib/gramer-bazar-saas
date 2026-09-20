'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetMessagesQuery, useMarkMessagesAsReadMutation } from '@/features/chat/chatApi';
import { useChatSocket } from '@/hooks/useChatSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User as UserIcon } from 'lucide-react';

interface ChatWindowProps {
  conversationId: string;
  participantName: string;
}

export function ChatWindow({ conversationId, participantName }: ChatWindowProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: messages, isLoading } = useGetMessagesQuery(conversationId, {
    skip: !conversationId,
  });
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const { isConnected, sendMessage } = useChatSocket(conversationId);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
      // Mark as read if the last message is not from us and unread
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== user?.id && !lastMessage.isRead) {
        markAsRead(conversationId);
      }
    }
  }, [messages, conversationId, user?.id, markAsRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{participantName}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">Loading messages...</div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card border rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                    {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(msg.createdAt))}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button type="submit" disabled={!inputMessage.trim() || !isConnected} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
