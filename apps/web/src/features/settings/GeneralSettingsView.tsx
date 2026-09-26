"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/features/settings/settingsApi";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CreditCard,
  Globe,
  Radio,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  ArrowLeft,
} from "lucide-react";

const settingsSchema = z.object({
  platformName: z.string().min(2, "Platform name is required").max(150),
  supportEmail: z.string().email("A valid support email is required"),
  supportPhone: z.string().optional(),
  allowSellerRegistration: z.boolean(),
  sslczPublicUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      "Must be a valid HTTP or HTTPS URL (e.g. https://your-tunnel.ngrok-free.app or https://api.yourdomain.com)",
    )
    .optional(),
  sslczStoreId: z.string().optional(),
  sslczStorePassword: z.string().optional(),
  sslczIsLive: z.boolean().default(false),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export interface GeneralSettingsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function GeneralSettingsView({ lang = 'en', namespace }: GeneralSettingsViewProps) {
  const isBn = lang === 'bn';
  const pathname = usePathname();
  const basePath = namespace || (pathname.includes('/super-admin') ? 'super-admin' : 'admin');

  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: settings, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      platformName: settings?.platformName ?? "",
      supportEmail: settings?.supportEmail ?? "",
      supportPhone: settings?.supportPhone ?? "",
      allowSellerRegistration: settings?.allowSellerRegistration ?? true,
      sslczPublicUrl: settings?.sslczPublicUrl ?? "",
      sslczStoreId: settings?.sslczStoreId ?? "",
      sslczStorePassword: "",
      sslczIsLive: settings?.sslczIsLive ?? false,
    },
  });

  const defaultPublicUrl =
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
      : "") || "https://api.yourdomain.com";
  const watchedPublicUrl =
    form.watch("sslczPublicUrl") || defaultPublicUrl;
  const cleanPublicUrl = watchedPublicUrl.trim().replace(/\/+$/, "");
  const isLive = form.watch("sslczIsLive");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(isBn ? "ক্লিপবোর্ডে কপি করা হয়েছে" : "Copied to clipboard");
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const payload: Record<string, any> = {
        platformName: values.platformName,
        supportEmail: values.supportEmail,
        supportPhone: values.supportPhone,
        allowSellerRegistration: values.allowSellerRegistration,
        sslczPublicUrl: values.sslczPublicUrl?.trim(),
        sslczStoreId: values.sslczStoreId?.trim(),
        sslczIsLive: values.sslczIsLive,
      };

      if (
        values.sslczStorePassword &&
        values.sslczStorePassword.trim() !== ""
      ) {
        payload.sslczStorePassword = values.sslczStorePassword.trim();
      }

      await updateSettings(payload).unwrap();
      form.setValue("sslczStorePassword", "");
      toast.success(
        isBn
          ? "সকল সেটিংস সফলভাবে সংরক্ষিত হয়েছে"
          : "Settings saved successfully",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) ||
          (isBn ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Failed to save settings"),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p>{isBn ? "সেটিংস লোড হচ্ছে..." : "Loading system settings..."}</p>
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="p-8 text-center text-destructive space-y-4">
        <p>{isBn ? "সেটিংস লোড করা যায়নি" : "Failed to load settings."}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {isBn ? "পুনরায় চেষ্টা করুন" : "Retry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Back button */}
      <div>
        <Link
          href={`/${lang}/${basePath}/settings`}
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {isBn ? "সেটিংস হাবে ফিরে যান" : "Back to Settings Hub"}
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {isBn
            ? "সিস্টেম ও গেটওয়ে কনফিগারেশন"
            : "System & Gateway Configuration"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isBn
            ? "মার্কেটপ্লেস সাধারণ তথ্য, SSLCOMMERZ পেমেন্ট গেটওয়ে ও লোকাল ngrok টানেল পরিচালনা করুন।"
            : "Configure marketplace details, SSLCOMMERZ payment gateway, and dynamic ngrok tunnel."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Card 1: SSLCOMMERZ & ngrok Tunnel */}
          <Card
            className="border-0 shadow-sm ring-1 ring-primary/20 rounded-2xl overflow-hidden"
            id="gateway"
          >
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {isBn
                        ? "SSLCOMMERZ পেমেন্ট গেটওয়ে ও ngrok টানেল"
                        : "SSLCOMMERZ Gateway & ngrok Tunnel"}
                    </CardTitle>
                    <CardDescription>
                      {isBn
                        ? "গেটওয়ে ক্রিডেনশিয়াল এবং আইপিএন (IPN) এর জন্য পাবলিক টানেল URL"
                        : "Manage gateway credentials and live HTTPS tunnel for callbacks & IPN"}
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant={isLive ? "destructive" : "secondary"}
                  className="font-mono text-xs px-3 py-1 flex items-center gap-1.5"
                >
                  <Radio
                    className={`w-3 h-3 ${isLive ? "text-red-500 animate-pulse" : "text-emerald-500 animate-ping"}`}
                  />
                  {isLive ? "PRODUCTION LIVE" : "SANDBOX / DEV"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Ngrok Banner */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/80 flex items-start gap-3 text-sm">
                <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {isBn
                      ? "ডাইনামিক ngrok টানেল সাপোর্ট"
                      : "Dynamic ngrok Tunnel Support"}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {isBn
                      ? "ngrok রিস্টার্ট হলে নতুন URL টি এখানে পেস্ট করে সেভ করুন। সার্ভার রিস্টার্ট করা ছাড়াই SSLCOMMERZ কলব্যাক ও আইপিএন তাত্ক্ষণিকভাবে নতুন টানেলে কাজ করবে।"
                      : "When you restart ngrok or change your tunnel URL, simply paste it below and save. SSLCOMMERZ callbacks and IPN webhooks will immediately use the new tunnel without restarting the NestJS server."}
                  </p>
                </div>
              </div>

              {/* Public URL Input */}
              <FormField
                control={form.control}
                name="sslczPublicUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center justify-between">
                      <span>
                        {isBn
                          ? "পাবলিক টানেল / কলব্যাক বেস URL"
                          : "Public Tunnel / Gateway Base URL"}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        (Active ngrok URL or Production Domain)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="https://your-tunnel.ngrok-free.app"
                          className="font-mono text-sm pl-9"
                        />
                        <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      {isBn
                        ? "SSLCOMMERZ গেটওয়ে ব্রাউজার রিডাইরেক্ট এবং সার্ভার-টু-সার্ভার IPN পাঠাতে এই HTTPS URL ব্যবহার করবে।"
                        : "SSLCOMMERZ uses this public HTTPS URL to reach your local backend for callbacks and server-to-server IPN webhooks."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Live Preview of Callback Endpoints */}
              <div className="rounded-xl bg-slate-950 p-4 text-slate-100 font-mono text-xs space-y-2.5 border border-slate-800">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1.5 font-sans font-medium text-xs">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    {isBn
                      ? "গেটওয়ে এন্ট্রিপয়েন্ট প্রিভিউ"
                      : "Active Gateway Endpoints Preview"}
                  </span>
                  <a
                    href={`${cleanPublicUrl}/api/v1/health`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                  >
                    <span>{isBn ? "হেলথ টেস্ট করুন" : "Test Health"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800/80">
                    <span className="truncate pr-2">
                      <span className="text-emerald-400 font-semibold">
                        SUCCESS:{" "}
                      </span>
                      {cleanPublicUrl}/api/v1/payments/sslcommerz/success
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${cleanPublicUrl}/api/v1/payments/sslcommerz/success`,
                          "success",
                        )
                      }
                      className="text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedKey === "success" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800/80">
                    <span className="truncate pr-2">
                      <span className="text-amber-400 font-semibold">
                        IPN WEBHOOK:{" "}
                      </span>
                      {cleanPublicUrl}/api/v1/payments/sslcommerz/ipn
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${cleanPublicUrl}/api/v1/payments/sslcommerz/ipn`,
                          "ipn",
                        )
                      }
                      className="text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedKey === "ipn" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Store ID & Password Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sslczStoreId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        {isBn ? "স্টোর আইডি (Store ID)" : "Store ID"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="your_store_id"
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {isBn
                          ? "SSLCOMMERZ মার্চেন্ট স্টোর আইডি"
                          : "Your SSLCOMMERZ Merchant Store ID"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sslczStorePassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold flex items-center justify-between">
                        <span>
                          {isBn
                            ? "স্টোর পাসওয়ার্ড (Store Password)"
                            : "Store Password"}
                        </span>
                        {settings?.hasSslczPassword && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal">
                            <ShieldCheck className="w-3 h-3" />
                            {isBn ? "কনফিগার করা আছে" : "Configured"}
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={
                              settings?.hasSslczPassword
                                ? "•••••••• (Leave blank to keep existing password)"
                                : "Enter store password"
                            }
                            className="font-mono text-sm pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {isBn
                          ? "পাসওয়ার্ড পরিবর্তন করতে চাইলে নতুনটি লিখুন, নাহলে খালি রাখুন"
                          : "Enter a new password to update, or leave blank to keep unchanged"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Is Live Toggle */}
              <FormField
                control={form.control}
                name="sslczIsLive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 p-4 rounded-xl border bg-muted/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        id="sslcz-is-live"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel
                        htmlFor="sslcz-is-live"
                        className="font-semibold cursor-pointer"
                      >
                        {isBn
                          ? "লাইভ / প্রোডাকশন মোড সক্রিয় করুন"
                          : "Enable Live Production Mode"}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {isBn
                          ? "টিক দেওয়া না থাকলে স্যান্ডবক্স (Sandbox) মোডে টেস্ট পেমেন্ট চলবে। লাইভ করতে টিক দিন।"
                          : "When unchecked, transactions use SSLCOMMERZ Sandbox. Check this only when using real merchant credentials."}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card 2: General Settings */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xl">
                {isBn ? "জেনারেল সেটিংস" : "General Settings"}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? "প্ল্যাটফর্মের সাধারণ তথ্য ও যোগাযোগের বিবরণ"
                  : "Update general platform information & contact channels"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="platformName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isBn ? "প্ল্যাটফর্মের নাম" : "Platform Name"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="supportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isBn ? "সাপোর্ট ইমেইল" : "Support Email"}
                      </FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isBn
                          ? "প্রধান যোগাযোগ নম্বর"
                          : "Primary Contact Phone"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          placeholder="+8801767476724"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Marketplace Controls */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xl">
                {isBn ? "মার্কেটপ্লেস কন্ট্রোল" : "Marketplace Controls"}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? "সেলার ও ব্যবহারকারী অপারেশন নিয়ন্ত্রণ করুন"
                  : "Control operations and registrations across the platform"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="allowSellerRegistration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        id="seller-reg"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel
                        htmlFor="seller-reg"
                        className="font-semibold cursor-pointer"
                      >
                        {isBn
                          ? "সেলার রেজিস্ট্রেশন উন্মুক্ত"
                          : "Allow New Seller Registrations"}
                      </FormLabel>
                      <FormDescription className="text-xs">
                        {isBn
                          ? "বন্ধ থাকলে প্ল্যাটফর্মে নতুন সেলার অ্যাকাউন্ট তৈরি করা যাবে না।"
                          : "When disabled, new seller accounts cannot be registered."}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSaving}
              className="rounded-xl h-12 px-8 shadow-md font-semibold text-base"
            >
              {isSaving
                ? isBn
                  ? "সংরক্ষণ হচ্ছে..."
                  : "Saving Settings..."
                : isBn
                  ? "পরিবর্তন সংরক্ষণ করুন"
                  : "Save Platform Settings"}
            </Button>
            {form.formState.isDirty && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {isBn ? "অসংরক্ষিত পরিবর্তন রয়েছে" : "Unsaved changes pending"}
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
