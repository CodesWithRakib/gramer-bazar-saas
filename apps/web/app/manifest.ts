import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'com.gramerbazar.app',
    name: 'Gramer Bazar — গ্রামীণ ই-কমার্স',
    short_name: 'Gramer Bazar',
    description:
      'সরাসরি কৃষক ও গ্রামীণ উদ্যোক্তাদের পণ্য কেনার সবচেয়ে নির্ভরযোগ্য ডিজিটাল বাজার।',
    start_url: '/bn',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fcfbf9',
    theme_color: '#ea580c', // Terracotta Warm Primary
    lang: 'bn-BD',
    dir: 'ltr',
    categories: ['shopping', 'business', 'agriculture', 'food'],
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'আমার অর্ডার (My Orders)',
        short_name: 'অর্ডার',
        description: 'আপনার সক্রিয় অর্ডার ও ডেলিভারি ট্র্যাকিং দেখুন',
        url: '/bn/customer/orders',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'সকল পণ্য (Products)',
        short_name: 'পণ্য',
        description: 'গ্রামের বাজারের টাটকা পণ্য ও ক্যাটালগ দেখুন',
        url: '/bn/products',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'ডিজিটাল ওয়ালেট (Wallet)',
        short_name: 'ওয়ালেট',
        description: 'রিফান্ড ব্যালেন্স ও ক্যাশব্যাক রিওয়ার্ড দেখুন',
        url: '/bn/customer/wallet',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'ভয়েস সার্চ (Voice Search)',
        short_name: 'সার্চ',
        description: 'মুখে বলে বাংলায় পণ্য খুঁজুন',
        url: '/bn/search',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
    ],
    related_applications: [
      {
        platform: 'play',
        id: 'com.gramerbazar.app',
        url: 'https://play.google.com/store/apps/details?id=com.gramerbazar.app',
      },
    ],
  };
}
