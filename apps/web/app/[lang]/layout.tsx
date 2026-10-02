import type { Metadata, Viewport } from 'next';
import {
  Plus_Jakarta_Sans,
  Hind_Siliguri,
  Noto_Sans_Bengali,
  Inter,
  DM_Sans,
  Outfit,
  Anek_Bangla,
  Tiro_Bangla,
} from 'next/font/google';
import '../globals.css';
import { getDirection } from '@/config/i18n';
import { Toaster } from '@/components/ui/toast';
import { ReduxProvider } from '@/store/provider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';

// ─── Premium English Fonts ────────────────────────────────────────────
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// ─── Premium Bangla Fonts ─────────────────────────────────────────────
const anekBangla = Anek_Bangla({
  variable: '--font-anek-bangla',
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const tiroBangla = Tiro_Bangla({
  variable: '--font-tiro-bangla',
  subsets: ['bengali', 'latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: '--font-noto-bengali',
  subsets: ['bengali'],
  // Weight 400 (Regular) only — matches Bangladesh govt site rendering quality
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'),
  keywords: ['ecommerce', 'rural', 'grocery', 'bangladesh', 'gramer bazar', 'terracotta'],
  title: {
    default: 'Gramer Bazar | Rural Hyper-marketplace',
    template: '%s | Gramer Bazar',
  },
  description:
    'Your local hyper-marketplace for authentic rural products and fresh groceries delivered to your door.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'Gramer Bazar',
    description: 'Your local hyper-marketplace for authentic rural products.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'bn_BD',
    siteName: 'Gramer Bazar',
    images: [
      {
        url: '/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'Gramer Bazar Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gramer Bazar',
    description: 'Your local hyper-marketplace for authentic rural products.',
  },
  manifest: '/manifest.webmanifest',
};

import { LoginModal } from '@/components/auth/LoginModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CSPostHogProvider } from '@/providers/PostHogProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { AuthProvider } from '@/providers/AuthProvider';
import { ImpersonationBanner } from '@/components/impersonation/ImpersonationBanner';

import { ThemePaletteProvider } from '@/providers/ThemePaletteProvider';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isBn = lang === 'bn';
  const dir = getDirection(lang);

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${inter.variable} ${dmSans.variable} ${outfit.variable} ${plusJakartaSans.variable} ${anekBangla.variable} ${tiroBangla.variable} ${hindSiliguri.variable} ${notoSansBengali.variable} antialiased`}
    >
      <body
        className={`min-h-screen flex flex-col ${isBn ? 'font-bengali' : 'font-sans'} w-full max-w-full`}
        suppressHydrationWarning
      >
        <ThemePaletteProvider>
          <CSPostHogProvider>
            <ReduxProvider>
              <AuthProvider>
                <SocketProvider>
                  <ImpersonationBanner lang={lang} />
                  <ClientLayoutWrapper lang={lang}>{children}</ClientLayoutWrapper>
                  <LoginModal lang={lang} />
                  <CartDrawer lang={lang} />
                  <InstallPrompt lang={lang} />
                </SocketProvider>
              </AuthProvider>
            </ReduxProvider>
          </CSPostHogProvider>
          <Toaster />
        </ThemePaletteProvider>
      </body>
    </html>
  );
}
