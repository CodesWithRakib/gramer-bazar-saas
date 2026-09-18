'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}`);
    }
  }, [isAuthenticated, router, lang]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${lang}`);
  };

  return (
    <div className="container max-w-2xl py-12 space-y-6">
      <h1 className="text-3xl font-bold">{isBn ? 'আমার প্রোফাইল' : 'My Profile'}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{user.firstName} {user.lastName}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.roles?.map((role) => (
                  <span key={role} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              {isBn ? 'লগআউট করুন' : 'Logout'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
