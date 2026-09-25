import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "../globals.css";
import { getDirection } from "@/config/i18n";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/store/provider";
import { SocketProvider } from "@/providers/SocketProvider";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

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
  manifest: '/manifest.webmanifest',
};

import { LoginModal } from "@/components/auth/LoginModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CSPostHogProvider } from "@/providers/PostHogProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { AuthProvider } from "@/providers/AuthProvider";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dir = getDirection();

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
            <AuthProvider>
              <SocketProvider>
                <ClientLayoutWrapper lang={lang}>
                  {children}
                </ClientLayoutWrapper>
                <LoginModal lang={lang} />
                <CartDrawer lang={lang} />
                <InstallPrompt lang={lang} />
              </SocketProvider>
            </AuthProvider>
          </ReduxProvider>
        </CSPostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}
