import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "../globals.css";
import { getDirection, type Locale } from "@/config/i18n";
import { Toaster } from "@/components/ui/sonner";

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
  title: "Gramer Bazar",
  description: "Your local hyper-marketplace",
};

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
      className={`${inter.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
