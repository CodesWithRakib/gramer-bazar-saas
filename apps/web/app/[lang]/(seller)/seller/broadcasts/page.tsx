import { Metadata } from 'next';
import { BroadcastInboxFeed } from '@/features/broadcast/components/BroadcastInboxFeed';

export const metadata: Metadata = {
  title: 'Official Announcements & Policy Updates | Gramer Bazar Seller Center',
  description: 'View platform commission advisories, campaign notices, and seller policy announcements.',
};

export default function SellerBroadcastsPage() {
  return <BroadcastInboxFeed role="seller" />;
}
