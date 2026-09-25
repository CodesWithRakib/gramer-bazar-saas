"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import {
  DashboardRoute,
  adminRoutes,
  superAdminRoutes,
  sellerRoutes,
  riderRoutes,
  customerRoutes,
} from "@/config/dashboard-routes";
import { api } from "@/store/api";
import { Menu, LogOut, ChevronDown, Store, User, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { getUserRoles } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  routeType: "admin" | "seller" | "rider" | "customer" | "super-admin";
  lang: string;
}

const NavItem = ({
  href,
  icon: Icon,
  title,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      onClick={onClick}
      href={href}
      className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm border border-primary/10 relative"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
      <Icon
        className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : "text-muted-foreground"}`}
      />
      {title}
    </Link>
  );
};

function SidebarContent({
  routes,
  lang,
  isBn,
  activeHref,
  onLogout,
}: {
  routes: DashboardRoute[];
  lang: string;
  isBn: boolean;
  activeHref: string | null;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-background/60 backdrop-blur-3xl border-r shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 -left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <Link href={`/${lang}`} className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-2.5 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
            <Store className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Gramer Bazar
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
        {routes.map((route) => (
          <NavItem
            key={route.href}
            href={`/${lang}${route.href}`}
            icon={route.icon}
            title={isBn ? route.titleBn : route.title}
            isActive={activeHref === route.href}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-muted/50 bg-background/40 relative z-10">
        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          {isBn ? "লগআউট" : "Logout"}
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({
  children,
  routeType,
  lang,
}: DashboardLayoutProps) {
  const routesMap: Record<DashboardLayoutProps["routeType"], DashboardRoute[]> = {
    admin: adminRoutes,
    'super-admin': superAdminRoutes,
    seller: sellerRoutes,
    rider: riderRoutes,
    customer: customerRoutes,
  };
  const routes = routesMap[routeType] || adminRoutes;
  const isBn = lang === "bn";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });
    } catch {
      // Ignore network error on logout
    }
    dispatch(logout());
    dispatch(api.util.resetApiState());
    router.push(`/${lang}/login`);
  };

  // Resolve the active route by the LONGEST matching href. A plain `find`
  // returns the first prefix match, so nested pages such as
  // `/[lang]/rider/deliveries` would resolve to the `/rider` dashboard entry.
  const activeHref =
    routes
      .filter(
        (r) =>
          pathname === `/${lang}${r.href}` ||
          pathname.startsWith(`/${lang}${r.href}/`),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  const currentRoute = routes.find((r) => r.href === activeHref);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent
          routes={routes}
          lang={lang}
          isBn={isBn}
          activeHref={activeHref}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        {/* Header */}
        <header className="sticky top-0 z-30 h-[76px] bg-background/70 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-muted/50 shadow-sm supports-[backdrop-filter]:bg-background/40">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarContent
                  routes={routes}
                  lang={lang}
                  isBn={isBn}
                  activeHref={activeHref}
                  onLogout={handleLogout}
                />
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
                <button className="flex items-center gap-2 hover:bg-muted/80 p-1.5 rounded-full transition-all duration-300 hover:shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold shadow-sm ring-1 ring-primary/20">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <div className="hidden md:block text-left text-sm mr-1">
                    <p className="font-semibold leading-none text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize font-medium">
                      {getUserRoles(user)[0]?.toLowerCase() || "User"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-muted/50">
                <div className="px-2 py-2 mb-2 border-b">
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                  <Link href={`/${lang}/profile`}>
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "প্রোফাইল" : "Profile"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 mb-1">
                  <Link href={`/${lang}/settings`}>
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{isBn ? "সেটিংস" : "Settings"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-xl py-2.5"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isBn ? "লগআউট" : "Logout"}</span>
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
