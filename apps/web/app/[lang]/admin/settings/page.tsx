'use client';

import React, { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/settingsApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const settingsSchema = z.object({
  platformName: z.string().min(2, 'Platform name is required').max(150),
  supportEmail: z.string().email('A valid support email is required'),
  allowSellerRegistration: z.boolean(),
});

export default function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: settings, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      platformName: settings?.platformName ?? '',
      supportEmail: settings?.supportEmail ?? '',
      allowSellerRegistration: settings?.allowSellerRegistration ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await updateSettings(values).unwrap();
      toast.success(isBn ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings saved');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) || (isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save settings'),
      );
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading settings...'}</div>;
  }

  if (isError || !settings) {
    return (
      <div className="p-8 text-center text-destructive">
        {isBn ? 'সেটিংস লোড করা যায়নি' : 'Failed to load settings'}
      </div>
    );
  }

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'জেনারেল সেটিংস' : 'General Settings'}</CardTitle>
              <CardDescription>
                {isBn ? 'প্ল্যাটফর্মের সাধারণ তথ্য আপডেট করুন' : 'Update general platform information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="platformName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? 'প্ল্যাটফর্মের নাম' : 'Platform Name'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? 'সাপোর্ট ইমেইল' : 'Support Email'}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'মার্কেটপ্লেস কন্ট্রোল' : 'Marketplace Controls'}</CardTitle>
              <CardDescription>
                {isBn ? 'অপারেশন নিয়ন্ত্রণ করুন' : 'Control operations across the platform'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="allowSellerRegistration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        id="seller-reg"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="seller-reg" className="font-medium">
                        {isBn ? 'সেলার রেজিস্ট্রেশন উন্মুক্ত' : 'Allow New Seller Registrations'}
                      </FormLabel>
                      <FormDescription>
                        {isBn
                          ? 'বন্ধ থাকলে নতুন সেলার অ্যাকাউন্ট তৈরি করা যাবে না।'
                          : 'When disabled, new seller accounts cannot be registered.'}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
            {isSaving
              ? isBn
                ? 'সংরক্ষণ হচ্ছে...'
                : 'Saving...'
              : isBn
                ? 'সংরক্ষণ করুন'
                : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
