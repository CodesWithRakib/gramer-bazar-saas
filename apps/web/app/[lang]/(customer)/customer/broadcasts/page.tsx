import { Metadata } from 'next';
import { BroadcastInboxFeed } from '@/features/broadcast/components/BroadcastInboxFeed';

export const metadata: Metadata = {
  title: 'Official Announcements & Broadcasts | Gramer Bazar',
  description: 'View official platform announcements, exclusive promotional offers, and urgent notices.',
};

export default function CustomerBroadcastsPage() {
  return <BroadcastInboxFeed role="customer" />;
}
