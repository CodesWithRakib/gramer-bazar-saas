'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useCreateConversationMutation } from '@/features/chat/chatApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { openChatWidget } from '@/store/slices/chatSlice';

interface StartChatButtonProps {
  participantId: string;
  lang: string;
  referenceId?: string;
  referenceType?: string;
  redirectPath?: string; // e.g., /en/messages or /en/seller/messages
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function StartChatButton({ 
  participantId, 
  lang, 
  referenceId,
  referenceType,
  redirectPath = `/${lang}/messages`, 
  buttonText, 
  variant = 'outline',
  size = 'default',
  className
}: StartChatButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createConversation, { isLoading }] = useCreateConversationMutation();

  const handleStartChat = async () => {
    try {
      if (!participantId) {
        toast.error(lang === 'bn' ? 'বিক্রেতার তথ্য অনুপস্থিত' : 'Seller information missing');
        return;
      }
      const conversation = await createConversation({ 
        participantId, 
        referenceId, 
        referenceType 
      }).unwrap();
      
      const isDashboardRoute = redirectPath.includes('/admin') || redirectPath.includes('/seller') || redirectPath.includes('/rider');
      
      if (isDashboardRoute) {
        router.push(redirectPath);
      } else {
        // Open the floating widget for storefront
        dispatch(openChatWidget(conversation.id));
      }
    } catch (error: unknown) {
      console.error('Failed to start chat:', error);
      const isBn = lang === 'bn';
      const msg = getApiErrorMessage(error);
      toast.error(
        msg || (isBn ? 'চ্যাট শুরু করতে সমস্যা হয়েছে' : 'Failed to start chat')
      );
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleStartChat} 
      disabled={isLoading}
      className={className}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      {buttonText || (lang === 'bn' ? 'মেসেজ দিন' : 'Message')}
    </Button>
  );
}
