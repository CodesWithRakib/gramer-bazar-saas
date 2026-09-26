import { DisputeReason } from '../../disputes/enums/dispute-reason.enum.js';
import { DisputeStatus } from '../../disputes/enums/dispute-status.enum.js';

export interface SeedDisputeItem {
  orderIndex: number;
  reason: DisputeReason;
  description: string;
  evidenceImages: string[];
  status: DisputeStatus;
  adminDecision: string | null;
  messages: {
    senderRole: 'CUSTOMER' | 'SELLER' | 'ADMIN';
    message: string;
    attachment?: string;
    minutesOffset: number;
  }[];
}

export const SEED_DISPUTES: SeedDisputeItem[] = [
  {
    orderIndex: 0, // First delivered order
    reason: DisputeReason.DAMAGED,
    description: 'Mustard oil bottle was cracked during transit and leaked inside packaging.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    ],
    status: DisputeStatus.RESOLVED_REFUNDED,
    adminDecision: 'Refund of 380 BDT approved and credited directly to customer wallet balance.',
    messages: [
      {
        senderRole: 'CUSTOMER',
        message: 'The mustard oil bottle cap was cracked and half of the oil leaked inside the courier box upon arrival.',
        minutesOffset: 0,
      },
      {
        senderRole: 'SELLER',
        message: 'We apologize sincerely for the damage. Our packaging team will add heavy double bubble wrap for all oil bottles.',
        minutesOffset: 120,
      },
      {
        senderRole: 'ADMIN',
        message: 'Photo evidence verified. Refund of 380 BDT has been credited to customer wallet. Order closed.',
        minutesOffset: 360,
      },
    ],
  },
  {
    orderIndex: 1, // Another order
    reason: DisputeReason.WRONG_ITEM,
    description: 'Received BR-28 Atash rice sack instead of the Premium Miniket rice ordered.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    ],
    status: DisputeStatus.UNDER_REVIEW,
    adminDecision: null,
    messages: [
      {
        senderRole: 'CUSTOMER',
        message: 'I ordered 10kg Miniket Rice, but the sack delivered is clearly labeled BR-28 Atash Rice.',
        minutesOffset: 0,
      },
      {
        senderRole: 'SELLER',
        message: 'Checking warehouse dispatch log with our Debiganj packer right now. We will arrange exchange delivery.',
        minutesOffset: 90,
      },
      {
        senderRole: 'ADMIN',
        message: 'Case is under review. Seller requested to dispatch correct sack within 24 hours.',
        minutesOffset: 240,
      },
    ],
  },
  {
    orderIndex: 2,
    reason: DisputeReason.MISSING_ITEM,
    description: 'Packet of Radhuni Turmeric Powder (হলুদ গুঁড়া) was missing from delivery basket.',
    evidenceImages: [],
    status: DisputeStatus.OPEN,
    adminDecision: null,
    messages: [
      {
        senderRole: 'CUSTOMER',
        message: 'All other items arrived intact, but the 200g turmeric powder packet was not inside the bag.',
        minutesOffset: 0,
      },
    ],
  },
  {
    orderIndex: 3,
    reason: DisputeReason.NOT_AS_DESCRIBED,
    description: 'Customer claimed dry red chili powder shade was darker than online photo.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    ],
    status: DisputeStatus.RESOLVED_REJECTED,
    adminDecision: 'Product batch tested. Conforms to authentic 100% natural sun-dried chili standards without synthetic color dyes. Dispute dismissed.',
    messages: [
      {
        senderRole: 'CUSTOMER',
        message: 'The red chili powder looks darker in color compared to the bright red photo in the app.',
        minutesOffset: 0,
      },
      {
        senderRole: 'SELLER',
        message: 'Our chili is 100% naturally ground without any added artificial red food coloring or brick dust.',
        minutesOffset: 60,
      },
      {
        senderRole: 'ADMIN',
        message: 'Inspection confirms natural seasonal batch purity. No artificial coloring added. Claim dismissed.',
        minutesOffset: 300,
      },
    ],
  },
];
