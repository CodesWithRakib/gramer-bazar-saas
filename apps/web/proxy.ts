import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./src/config/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  // Determine preferred locale: 1. Cookie, 2. Fallback to defaultLocale
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const targetLocale =
    savedLocale && (locales as readonly string[]).includes(savedLocale)
      ? savedLocale
      : defaultLocale;

  // Redirect if there is no locale in the URL path, preserving search params
  request.nextUrl.pathname = `/${targetLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api) and images
    "/((?!api|_next/static|_next/image|favicon.ico|assets|docs|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)",
  ],
};
