'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Home, Grid, ShoppingBag, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setCartOpen } from '@/store/slices/cartSlice';

const MobileNavItem = ({ 
  href, 
  icon: Icon, 
  label, 
  isActive, 
  badge,
  onClick 
}: { 
  href?: string, 
  icon: React.ElementType, 
  label: string, 
  isActive: boolean,
  badge?: number,
  onClick?: () => void
}) => {
  const content = (
    <>
      <div className="relative">
        <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary drop-shadow-sm' : 'text-muted-foreground'}`} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center w-full h-full hover:bg-muted/30 transition-colors"
      >
        {content}
      </button>
    );
  }

  return (
    <Link 
      href={href!} 
      className="flex flex-col items-center justify-center w-full h-full hover:bg-muted/30 transition-colors"
    >
      {content}
    </Link>
  );
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const params = useParams();
  const dispatch = useDispatch();
  
  const lang = (params?.lang as string) || 'en';
  const isBn = lang === 'bn';
  
  const { items, isOpen } = useSelector((state: RootState) => state.cart);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const getIsActive = (path: string) => {
    if (path === '/') {
      return pathname === `/${lang}` || pathname === '/';
    }
    return pathname.startsWith(`/${lang}${path}`);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 z-50 w-full border-t border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around h-16 pb-safe">
        <MobileNavItem 
          href={`/${lang}`} 
          icon={Home} 
          label={isBn ? 'হোম' : 'Home'} 
          isActive={getIsActive('/')} 
        />
        <MobileNavItem 
          href={`/${lang}/categories`} 
          icon={Grid} 
          label={isBn ? 'ক্যাটাগরি' : 'Categories'} 
          isActive={getIsActive('/categories')} 
        />
        <MobileNavItem 
          onClick={() => dispatch(setCartOpen(true))} 
          icon={ShoppingBag} 
          label={isBn ? 'কার্ট' : 'Cart'} 
          isActive={isOpen}
          badge={cartItemCount}
        />
        <MobileNavItem 
          href={`/${lang}/customer/profile`} 
          icon={User} 
          label={isBn ? 'অ্যাকাউন্ট' : 'Account'} 
          isActive={getIsActive('/customer/profile')} 
        />
      </nav>
      {/* Spacer to prevent content from hiding behind the absolute nav bar */}
      <div className="h-16 md:hidden w-full pb-safe shrink-0"></div>
    </>
  );
}
