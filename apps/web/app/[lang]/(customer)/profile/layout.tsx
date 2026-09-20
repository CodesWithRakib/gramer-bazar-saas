'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, ShieldCheck, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${lang}`);
  };

  const menuItems = [
    {
      title: isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Info',
      href: `/${lang}/profile`,
      icon: User,
    },
    {
      title: isBn ? 'আমার উইশলিস্ট' : 'My Wishlist',
      href: `/${lang}/profile/wishlist`,
      icon: Heart,
    },
    {
      title: isBn ? 'অ্যাড্রেস বুক' : 'Address Book',
      href: `/${lang}/profile/address`,
      icon: MapPin,
    },
    {
      title: isBn ? 'নিরাপত্তা' : 'Security',
      href: `/${lang}/profile/security`,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
        {isBn ? 'আমার একাউন্ট' : 'My Account'}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex flex-col gap-2 sticky top-24">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              );
            })}
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isBn ? 'লগআউট' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
