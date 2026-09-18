import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "../globals.css";
import { getDirection, type Locale } from "@/config/i18n";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/store/provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
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
        <ReduxProvider>
          <Header lang={lang} />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer lang={lang} />
          <LoginModal lang={lang} />
          <CartDrawer lang={lang} />
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
