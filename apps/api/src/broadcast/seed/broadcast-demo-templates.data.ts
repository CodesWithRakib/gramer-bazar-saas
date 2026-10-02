import {
  BroadcastTemplateCategory,
  BroadcastProviderName,
  BroadcastTemplateProviderStatus,
  BroadcastTemplateStatus,
} from '../enums/broadcast.enums.js';

/**
 * DEVELOPMENT / DEMO broadcast templates.
 *
 * These are NOT approved WhatsApp templates. They are created with the mock
 * provider and LOCAL_ONLY provider status. Clearly labelled as demo content so
 * no one mistakes them for real, provider-approved templates.
 */
export interface BroadcastDemoTemplate {
  name: string;
  description: string;
  language: string;
  category: BroadcastTemplateCategory;
  body: string;
  variables: { key: string; label?: string; example?: string; required?: boolean }[];
  status: BroadcastTemplateStatus;
}

export const BROADCAST_DEMO_TEMPLATES: BroadcastDemoTemplate[] = [
  {
    name: '[DEMO] Flash Sale Template (BN)',
    description: 'Demo marketing template for a flash sale announcement.',
    language: 'bn',
    category: BroadcastTemplateCategory.MARKETING,
    body:
      'হ্যালো {{customer_name}}, {{shop_name}} এ আজ {{discount}}% ছাড়ে বিশেষ ফ্ল্যাশ সেল!\nএখনই দেখুন: {{offer_link}}',
    variables: [
      { key: 'customer_name', label: 'Customer name', example: 'রাকিব' },
      { key: 'shop_name', label: 'Shop name', example: 'গ্রামের বাজার' },
      { key: 'discount', label: 'Discount %', example: '20' },
      { key: 'offer_link', label: 'Offer link', example: 'https://gramerbazar.com/offers' },
    ],
    status: BroadcastTemplateStatus.DRAFT,
  },
  {
    name: '[DEMO] New Product Template (BN)',
    description: 'Demo marketing template announcing a new product.',
    language: 'bn',
    category: BroadcastTemplateCategory.MARKETING,
    body:
      'প্রিয় {{customer_name}}, {{product_name}} এখন {{shop_name}} এ পাওয়া যাচ্ছে!\nদাম: {{price}} টাকা। বিস্তারিত: {{offer_link}}',
    variables: [
      { key: 'customer_name', label: 'Customer name', example: 'রাকিব' },
      { key: 'product_name', label: 'Product', example: 'মিনিকেট চাল' },
      { key: 'shop_name', label: 'Shop name', example: 'গ্রামের বাজার' },
      { key: 'price', label: 'Price', example: '1250' },
      { key: 'offer_link', label: 'Product link', example: 'https://gramerbazar.com/products/1' },
    ],
    status: BroadcastTemplateStatus.DRAFT,
  },
  {
    name: '[DEMO] Coupon Template (EN)',
    description: 'Demo marketing template promoting a coupon code.',
    language: 'en',
    category: BroadcastTemplateCategory.MARKETING,
    body:
      'Hi {{customer_name}}, use coupon {{coupon_code}} to get {{discount}}% off your next order at {{shop_name}}.\n{{offer_link}}',
    variables: [
      { key: 'customer_name', label: 'Customer name', example: 'Rakib' },
      { key: 'coupon_code', label: 'Coupon code', example: 'EID20' },
      { key: 'discount', label: 'Discount %', example: '20' },
      { key: 'shop_name', label: 'Shop name', example: 'Gramer Bazar' },
      { key: 'offer_link', label: 'Link', example: 'https://gramerbazar.com/offers' },
    ],
    status: BroadcastTemplateStatus.DRAFT,
  },
  {
    name: '[DEMO] Order Update Template (EN)',
    description: 'Demo transactional template (utility category) for order updates.',
    language: 'en',
    category: BroadcastTemplateCategory.UTILITY,
    body:
      'Hi {{customer_name}}, your order {{order_number}} is now {{order_status}}.',
    variables: [
      { key: 'customer_name', label: 'Customer name', example: 'Rakib' },
      { key: 'order_number', label: 'Order number', example: 'ORD-10023' },
      { key: 'order_status', label: 'Order status', example: 'delivered' },
    ],
    status: BroadcastTemplateStatus.DRAFT,
  },
];

export const BROADCAST_DEMO_TEMPLATE_DEFAULTS = {
  provider: BroadcastProviderName.MOCK,
  providerStatus: BroadcastTemplateProviderStatus.LOCAL_ONLY,
};
