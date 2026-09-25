"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setCartOpen } from "@/store/slices/cartSlice";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  lang: string;
}

export function MobileBottomNav({ lang }: MobileBottomNavProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isBn = lang === "bn";

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  const navItems = [
    {
      label: isBn ? "হোম" : "Home",
      icon: Home,
      href: `/${lang}`,
      isActive: pathname === `/${lang}`,
    },
    {
      label: isBn ? "ক্যাটাগরি" : "Categories",
      icon: LayoutGrid,
      href: `/${lang}/categories`,
      isActive: pathname.includes(`/${lang}/categories`),
    },
  ];

  const getProfileHref = () => {
    if (!isAuthenticated) return `/${lang}/login`;
    const roles = user?.roles || [];
    if (roles.includes("SUPER_ADMIN")) return `/${lang}/super-admin`;
    if (roles.includes("ADMIN")) return `/${lang}/admin`;
    if (roles.includes("SELLER")) return `/${lang}/seller`;
    if (roles.includes("RIDER")) return `/${lang}/rider`;
    return `/${lang}/customer/profile`;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              item.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        <button
          onClick={() => dispatch(setCartOpen(true))}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary relative"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center border border-background">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{isBn ? "কার্ট" : "Cart"}</span>
        </button>

        <Link
          href={getProfileHref()}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            pathname.includes(`/${lang}/customer`) || 
            pathname.includes(`/${lang}/profile`) || 
            pathname.includes(`/${lang}/super-admin`) || 
            pathname.includes(`/${lang}/admin`) || 
            pathname.includes(`/${lang}/seller`) || 
            pathname.includes(`/${lang}/rider`) ||
            pathname.includes(`/${lang}/login`)
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">{isBn ? "অ্যাকাউন্ট" : "Account"}</span>
        </Link>
      </nav>
    </div>
  );
}
