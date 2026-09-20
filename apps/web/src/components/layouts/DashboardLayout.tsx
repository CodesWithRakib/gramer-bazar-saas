"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { DashboardRoute } from "@/config/dashboard-routes";
import { Menu, LogOut, ChevronDown, Store } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomImage } from "@/components/ui/CustomImage";

interface DashboardLayoutProps {
  children: React.ReactNode;
  routes: DashboardRoute[];
  lang: string;
}

const NavItem = ({
  href,
  icon: Icon,
  title,
  pathname,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  pathname: string;
  onClick?: () => void;
}) => {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      onClick={onClick}
      href={href}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
      />
      {title}
    </Link>
  );
};

export function DashboardLayout({
  children,
  routes,
  lang,
}: DashboardLayoutProps) {
  const isBn = lang === "bn";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${lang}/login`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Store className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">
            Gramer Bazar
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {routes.map((route) => (
          <NavItem
            key={route.href}
            href={`/${lang}${route.href}`}
            icon={route.icon}
            title={isBn ? route.titleBn : route.title}
            pathname={pathname}
          />
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {isBn ? "লগআউট" : "Logout"}
        </button>
      </div>
    </div>
  );

  // Find current route title for header
  const currentRoute = routes.find(
    (r) =>
      pathname === `/${lang}${r.href}` ||
      pathname.startsWith(`/${lang}${r.href}/`),
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[72px] bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold hidden sm:block">
              {currentRoute
                ? isBn
                  ? currentRoute.titleBn
                  : currentRoute.title
                : "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <NotificationBell lang={lang} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition-colors">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <div className="hidden md:block text-left text-sm mr-1">
                    <p className="font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {user?.roles?.[0]?.toLowerCase() || "User"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isBn ? "লগআউট" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
