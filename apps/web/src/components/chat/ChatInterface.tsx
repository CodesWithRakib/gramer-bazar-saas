'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  useGetConversationsQuery, 
  useGetMessagesQuery, 
  useMarkMessagesAsReadMutation,
  useSendMessageRestMutation,
  type ConversationParticipant,
} from '@/features/chat/chatApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useChatSocket } from '@/hooks/useChatSocket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search, 
  Loader2, 
  ArrowLeft, 
  Package, 
  ShoppingBag, 
  Truck, 
  HelpCircle,
  CheckCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export function ChatInterface() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { 
    data: conversations, 
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    refetch: refetchConversations,
  } = useGetConversationsQuery(undefined, { skip: !user });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { isConnected, sendMessage, markRead } = useChatSocket(
    activeConversationId ?? undefined,
  );
  const [sendMessageRest] = useSendMessageRestMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  const { 
    data: messages, 
    isLoading: isMessagesLoading,
    isFetching: isMessagesFetching,
  } = useGetMessagesQuery(
    activeConversationId as string,
    { skip: !activeConversationId }
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages?.length]);

  // Mark conversation as read when active
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId).catch(() => {});
      markRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead, markRead, messages?.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content || !activeConversationId || isSending) return;

    setIsSending(true);
    try {
      if (isConnected) {
        sendMessage(content);
      } else {
        // REST fallback if socket is disconnected
        await sendMessageRest({ conversationId: activeConversationId, content }).unwrap();
      }
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = useCallback(
    (participants: ConversationParticipant[]) => {
      return participants?.find((p) => p.id !== user?.id) || participants?.[0];
    },
    [user?.id],
  );

  const getParticipantRoleName = (participant?: ConversationParticipant | null) => {
    if (!participant) return '';
    if (participant.roles && participant.roles.length > 0) {
      return participant.roles[0].name;
    }
    return participant.role || '';
  };

  const getReferenceBadge = (refType?: string | null, refId?: string | null) => {
    if (!refId && !refType) return null;
    const type = refType?.toUpperCase() || 'REF';
    let icon = <HelpCircle className="h-3 w-3 mr-1" />;
    let label = refId ? `#${refId.slice(0, 8)}` : type;

    if (type.includes('ORDER')) {
      icon = <ShoppingBag className="h-3 w-3 mr-1" />;
      label = `Order ${refId ? `#${refId}` : ''}`;
    } else if (type.includes('PRODUCT')) {
      icon = <Package className="h-3 w-3 mr-1" />;
      label = `Product ${refId ? `#${refId.slice(0, 8)}` : ''}`;
    } else if (type.includes('DELIVERY')) {
      icon = <Truck className="h-3 w-3 mr-1" />;
      label = `Delivery ${refId ? `#${refId.slice(0, 8)}` : ''}`;
    }

    return (
      <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 border-primary/30 text-primary">
        {icon}
        <span className="truncate max-w-[110px]">{label}</span>
      </Badge>
    );
  };

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations
      .filter((conv) => {
        const other = getOtherParticipant(conv.participants);
        const fullName = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
        const refInfo = `${conv.referenceId || ''} ${conv.referenceType || ''}`.toLowerCase();
        const search = searchQuery.toLowerCase();
        return fullName.includes(search) || refInfo.includes(search);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations, getOtherParticipant, searchQuery]);

  const activeConversation = useMemo(
    () => conversations?.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  );

  const activeOtherParticipant = useMemo(
    () => (activeConversation ? getOtherParticipant(activeConversation.participants) : null),
    [activeConversation, getOtherParticipant],
  );

  if (isConversationsLoading || !user) {
    return (
      <div className="flex h-[75vh] min-h-[600px] items-center justify-center border rounded-xl bg-card shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (isConversationsError) {
    return (
      <div className="flex h-[75vh] min-h-[600px] flex-col items-center justify-center border rounded-xl bg-card shadow-sm p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h3 className="font-semibold text-lg">Unable to load messages</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          There was an issue connecting to the chat service.
        </p>
        <Button onClick={() => refetchConversations()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[78vh] min-h-[600px] border rounded-xl bg-card overflow-hidden shadow-sm">
      {/* Sidebar (Conversation List) */}
      <div 
        className={`${
          activeConversationId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 border-r flex-col bg-muted/15 flex-shrink-0 transition-all`}
      >
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Messages</h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span 
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              />
              <span className="text-muted-foreground">
                {isConnected ? 'Real-time' : 'Reconnecting...'}
              </span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-background/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm font-medium">No conversations found</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                When someone messages you, it will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv.participants);
                const roleName = getParticipantRoleName(other);
                const isSelected = activeConversationId === conv.id;
                const lastMsg = (isSelected && messages && messages.length > 0)
                  ? messages[messages.length - 1]
                  : (conv.lastMessage || (conv.messages && conv.messages[conv.messages.length - 1]));
                const unreadCount = conv.unreadCount || 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`flex items-start gap-3 p-3.5 text-left transition-colors hover:bg-muted/60 ${
                      isSelected ? 'bg-primary/10 border-l-4 border-primary pl-2.5' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-11 w-11 border border-border/80">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {other?.firstName?.[0] || 'U'}{other?.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      {roleName && (
                        <span 
                          className="absolute -bottom-1 -right-1 px-1 py-0.2 text-[9px] font-semibold uppercase rounded bg-muted-foreground text-background border"
                        >
                          {roleName.slice(0, 3)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`font-medium text-sm truncate ${unreadCount > 0 ? 'text-primary font-bold' : ''}`}>
                          {other?.firstName || 'User'} {other?.lastName || ''}
                        </span>
                        {lastMsg?.createdAt && (
                          <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-1">
                            {format(new Date(lastMsg.createdAt), 'HH:mm')}
                          </span>
                        )}
                      </div>

                      {/* Reference Badge if order/product attached */}
                      {(conv.referenceId || conv.referenceType) && (
                        <div className="mb-1">
                          {getReferenceBadge(conv.referenceType, conv.referenceId)}
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {lastMsg ? (
                            lastMsg.senderId === user.id ? (
                              <span className="flex items-center gap-1">
                                <span className="text-muted-foreground">You:</span> {lastMsg.content}
                              </span>
                            ) : (
                              lastMsg.content
                            )
                          ) : (
                            <span className="italic">No messages yet</span>
                          )}
                        </p>
                        {unreadCount > 0 && (
                          <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
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
      <div 
        className={`${
          activeConversationId ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col bg-card relative min-w-0`}
      >
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] border-b px-4 py-2 flex items-center justify-between shadow-sm z-10 bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-9 w-9 -ml-2 text-muted-foreground"
                  onClick={() => setActiveConversationId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10 border border-border/80 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {activeOtherParticipant?.firstName?.[0] || 'U'}
                    {activeOtherParticipant?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {activeOtherParticipant?.firstName || 'User'} {activeOtherParticipant?.lastName || ''}
                    </h3>
                    {activeOtherParticipant && getParticipantRoleName(activeOtherParticipant) && (
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-4">
                        {getParticipantRoleName(activeOtherParticipant)}
                      </Badge>
                    )}
                  </div>
                  
                  {activeConversation && (activeConversation.referenceId || activeConversation.referenceType) && (
                    <div className="mt-0.5">
                      {getReferenceBadge(activeConversation.referenceType, activeConversation.referenceId)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isConnected ? 'Connected' : 'Offline Mode'}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/60 dark:bg-slate-900/30" ref={scrollAreaViewportRef}>
              {isMessagesLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-16 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Loading message history...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-2">
                  {messages?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      <p>No messages in this conversation yet.</p>
                      <p className="text-xs mt-1">Send a message below to start the conversation.</p>
                    </div>
                  )}

                  {messages?.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    const senderRole = msg.senderRole;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {!isMe && senderRole && senderRole !== 'CUSTOMER' && (
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground ml-2 mb-0.5 tracking-wider">
                            {senderRole}
                          </span>
                        )}

                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-tr-xs'
                              : 'bg-background border rounded-tl-xs text-foreground shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                              isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}
                          >
                            <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                            {isMe && (
                              <span>
                                {msg.isRead ? (
                                  <span title="Read">
                                    <CheckCheck className="h-3.5 w-3.5 text-blue-200 inline" />
                                  </span>
                                ) : (
                                  <span title="Delivered">
                                    <Check className="h-3 w-3 opacity-70 inline" />
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 sm:p-4 pb-safe border-t bg-card shadow-xs">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-muted/20 focus-visible:ring-primary"
                  disabled={isSending}
                />
                <Button 
                  type="submit" 
                  disabled={!messageInput.trim() || isSending}
                  className="shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full p-6 text-center">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Send className="h-8 w-8 ml-1" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Your Messages</h3>
            <p className="text-sm max-w-sm mt-1 text-muted-foreground">
              Select a conversation from the sidebar to view chat history and reply in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

