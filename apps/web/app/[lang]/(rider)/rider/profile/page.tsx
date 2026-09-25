'use client';

import React, { use } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User as UserIcon, MapPin, Bike } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function RiderProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${lang}/login`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-lg">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-muted-foreground">{user?.phone}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            {isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isBn ? 'পুরো নাম' : 'Full Name'}</Label>
            <Input value={`${user?.firstName || ''} ${user?.lastName || ''}`} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? 'ইমেইল' : 'Email'}</Label>
            <Input value={user?.email || 'N/A'} readOnly className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bike className="w-5 h-5 text-primary" />
            {isBn ? 'বাহনের তথ্য' : 'Vehicle Details'}
          </CardTitle>
          <CardDescription>
            {isBn ? 'ডেলিভারির জন্য ব্যবহৃত বাহন' : 'Vehicle used for deliveries'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isBn ? 'বাহনের ধরন' : 'Vehicle Type'}</Label>
            <Input defaultValue="Motorcycle" />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? 'লাইসেন্স প্লেট' : 'License Plate'}</Label>
            <Input defaultValue="DHAKA-H-12-3456" />
          </div>
          <Button className="w-full mt-2">
            {isBn ? 'সংরক্ষণ করুন' : 'Save Details'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {isBn ? 'কাজের এলাকা' : 'Service Area'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{isBn ? 'বর্তমান এলাকা' : 'Current Area'}</Label>
            <Input defaultValue="Savar, Dhaka" />
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full flex items-center gap-2 mt-8" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
        {isBn ? 'লগ আউট' : 'Log Out'}
      </Button>
    </div>
  );
}
