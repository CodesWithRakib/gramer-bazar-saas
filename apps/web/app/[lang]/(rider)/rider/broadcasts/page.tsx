import { Metadata } from 'next';
import { BroadcastInboxFeed } from '@/features/broadcast/components/BroadcastInboxFeed';

export const metadata: Metadata = {
  title: 'Official Announcements & Rider Advisories | Gramer Bazar Rider Hub',
  description: 'View delivery surge notices, monsoon safety guidelines, and rider earnings announcements.',
};

export default function RiderBroadcastsPage() {
  return <BroadcastInboxFeed role="rider" />;
}
