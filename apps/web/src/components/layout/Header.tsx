'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Menu, ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setLoginModalOpen, logout } from '@/store/slices/authSlice';
import { setCartOpen } from '@/store/slices/cartSlice';

interface HeaderProps {
  lang: string;
}

export function Header({ lang }: HeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const isBn = lang === 'bn';
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartItemsCount = useSelector((state: RootState) => 
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(`/${lang}/search`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href={`/${lang}`} className="font-bold text-xl text-primary flex items-center gap-2">
            <span>{isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
          <Input
            type="search"
            placeholder={isBn ? 'পণ্য খুঁজুন...' : 'Search for products...'}
            className="w-full pr-10 rounded-full bg-muted/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-r-full">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-full">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm truncate max-w-[120px]">
              {isBn ? 'খানসামা, দিনাজপুর' : 'Khansama, Dinajpur'}
            </span>
          </Button>
          <div className="flex gap-2 ml-2 items-center">
            <Link href={lang === 'en' ? '/bn' : '/en'}>
              <Button variant="ghost" size="sm" className="font-semibold">
                {lang === 'en' ? 'BN' : 'EN'}
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" onClick={() => dispatch(setCartOpen(true))} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <Button variant="ghost" className="font-medium" onClick={() => dispatch(logout())}>
                {user?.firstName || (isBn ? 'প্রোফাইল' : 'Profile')} (Logout)
              </Button>
            ) : (
              <Button onClick={() => dispatch(setLoginModalOpen(true))}>
                {isBn ? 'লগইন' : 'Login'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden p-3 border-t">
        <form onSubmit={handleSearch} className="relative w-full">
          <Input
            type="search"
            placeholder={isBn ? 'পণ্য খুঁজুন...' : 'Search products...'}
            className="w-full pr-10 rounded-full bg-muted/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-r-full">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
