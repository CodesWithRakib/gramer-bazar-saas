'use client';

import React, { use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'সিস্টেম সেটিংস' : 'System Settings'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isBn ? 'গ্লোবাল মার্কেটপ্লেস কনফিগারেশন' : 'Manage global marketplace configurations.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'জেনারেল সেটিংস' : 'General Settings'}</CardTitle>
          <CardDescription>
            {isBn ? 'প্ল্যাটফর্মের সাধারণ তথ্য আপডেট করুন' : 'Update general platform information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">{isBn ? 'প্ল্যাটফর্মের নাম' : 'Platform Name'}</Label>
            <Input id="platformName" defaultValue="Gramer Bazar" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">{isBn ? 'সাপোর্ট ইমেইল' : 'Support Email'}</Label>
            <Input id="supportEmail" defaultValue="support@gramerbazar.com" type="email" />
          </div>
          <Button>{isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'মার্কেটপ্লেস কন্ট্রোল' : 'Marketplace Controls'}</CardTitle>
          <CardDescription>
            {isBn ? 'অপারেশন নিয়ন্ত্রণ করুন' : 'Control operations across the platform'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="maintenance" />
            <Label htmlFor="maintenance" className="font-medium">
              {isBn ? 'মেইনটেন্যান্স মোড চালু করুন' : 'Enable Maintenance Mode'}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            {isBn 
              ? 'এটি চালু থাকলে শুধুমাত্র অ্যাডমিনরা ওয়েবসাইটে প্রবেশ করতে পারবেন।' 
              : 'When enabled, only admins can access the website.'}
          </p>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="seller-reg" defaultChecked />
            <Label htmlFor="seller-reg" className="font-medium">
              {isBn ? 'সেলার রেজিস্ট্রেশন উন্মুক্ত' : 'Allow New Seller Registrations'}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
