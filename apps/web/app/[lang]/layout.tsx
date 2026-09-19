import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "../globals.css";
import { getDirection, type Locale } from "@/config/i18n";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/store/provider";
import { SocketProvider } from "@/providers/SocketProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  keywords: ["ecommerce", "rural", "grocery", "bangladesh", "gramer bazar"],
  title: {
    default: "Gramer Bazar | Rural Hyper-marketplace",
    template: "%s | Gramer Bazar",
  },
  description: "Your local hyper-marketplace for authentic rural products and fresh groceries delivered to your door.",
  openGraph: {
    title: "Gramer Bazar",
    description: "Your local hyper-marketplace for authentic rural products.",
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    siteName: "Gramer Bazar",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Gramer Bazar Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gramer Bazar",
    description: "Your local hyper-marketplace for authentic rural products.",
  },
  manifest: '/manifest.ts',
};

import { LoginModal } from "@/components/auth/LoginModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CSPostHogProvider } from "@/providers/PostHogProvider";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dir = getDirection(lang as Locale);

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CSPostHogProvider>
          <ReduxProvider>
            <SocketProvider>
              <Header lang={lang} />
              <main className="flex-grow flex flex-col pb-16 md:pb-0">
                {children}
              </main>
              <Footer lang={lang} />
              <LoginModal lang={lang} />
              <CartDrawer lang={lang} />
              <MobileBottomNav lang={lang} />
            </SocketProvider>
          </ReduxProvider>
        </CSPostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}
