"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useGetAdminProductRequestByIdQuery,
  useUpdateProductRequestStatusMutation,
} from "@/features/product-requests/productRequestsApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function AdminProductRequestDetailsPage({
  params: { lang, id },
}: {
  params: { lang: string; id: string };
}) {
  const isBn = lang === "bn";
  const router = useRouter();

  const {
    data: request,
    isLoading,
    isError,
  } = useGetAdminProductRequestByIdQuery(id);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateProductRequestStatusMutation();

  const [status, setStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [linkedProductId, setLinkedProductId] = useState<string>("");
  const [remark, setRemark] = useState<string>("");

  const [prevRequestId, setPrevRequestId] = useState<string | undefined>(
    undefined,
  );
  if (request && request.id !== prevRequestId) {
    setPrevRequestId(request.id);
    setStatus(request.status);
    setAdminNotes(request.adminNotes || "");
    setLinkedProductId(request.linkedProductId || "");
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        {isBn ? "লোড হচ্ছে..." : "Loading..."}
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="py-8 text-center text-red-500">
        {isBn ? "অনুরোধ খুঁজে পাওয়া যায়নি" : "Request not found"}
      </div>
    );
  }

  const handleUpdate = async () => {
    try {
      await updateStatus({
        id,
        data: {
          status,
          adminNotes: adminNotes || undefined,
          linkedProductId: linkedProductId || undefined,
          remark: remark || undefined,
        },
      }).unwrap();

      toast.success(
        isBn ? "স্থিতি আপডেট করা হয়েছে" : "Status updated successfully",
      );
      setRemark(""); // Clear remark after submit
    } catch (error) {
      toast.error(
        isBn ? "আপডেট করতে ত্রুটি হয়েছে" : "Failed to update status",
      );
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "PENDING":
        return "bg-yellow-500";
      case "REVIEWING":
        return "bg-blue-500";
      case "SEARCHING":
        return "bg-purple-500";
      case "FOUND":
        return "bg-orange-500";
      case "PRODUCT_ADDED":
      case "CUSTOMER_NOTIFIED":
        return "bg-green-500";
      case "CLOSED":
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/${lang}/admin/product-requests`}
        className="flex items-center text-sm text-primary hover:underline w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {isBn ? "অনুরোধ তালিকায় ফিরে যান" : "Back to Requests"}
      </Link>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Details & Update Form */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.requestedProductName}</CardTitle>
                  <CardDescription>ID: {request.id}</CardDescription>
                </div>
                <Badge
                  className={`${getStatusColor(request.status)} text-white hover:${getStatusColor(request.status)}`}
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {isBn ? "গ্রাহক" : "Customer"}
                  </p>
                  <p className="font-medium">{request.user?.name}</p>
                  <p className="text-muted-foreground">{request.user?.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {isBn ? "তারিখ" : "Date"}
                  </p>
                  <p className="font-medium">
                    {new Intl.DateTimeFormat(isBn ? "bn-BD" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(request.createdAt))}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-muted-foreground text-sm mb-1">
                  {isBn ? "বিবরণ" : "Description"}
                </p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {request.description || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  {isBn ? "অন্যান্য তথ্য" : "Preferred Information"}
                </p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {request.preferredInformation || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? "পরিচালনা করুন" : "Manage Request"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isBn ? "বর্তমান স্থিতি" : "Current Status"}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="REVIEWING">REVIEWING</SelectItem>
                    <SelectItem value="SEARCHING">SEARCHING</SelectItem>
                    <SelectItem value="FOUND">FOUND</SelectItem>
                    <SelectItem value="PRODUCT_ADDED">PRODUCT_ADDED</SelectItem>
                    <SelectItem value="CUSTOMER_NOTIFIED">
                      CUSTOMER_NOTIFIED
                    </SelectItem>
                    <SelectItem value="CLOSED">CLOSED</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(status === "PRODUCT_ADDED" ||
                status === "CUSTOMER_NOTIFIED" ||
                status === "FOUND") && (
                <div className="space-y-2">
                  <Label>
                    {isBn ? "লিঙ্ক করা প্রোডাক্ট আইডি" : "Linked Product ID"}
                  </Label>
                  <Input
                    placeholder="UUID of the product in catalog"
                    value={linkedProductId}
                    onChange={(e) => setLinkedProductId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isBn
                      ? "ক্যাটালগ থেকে প্রোডাক্টের আইডি এখানে দিন।"
                      : "Provide the ID of the product from the catalog."}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  {isBn
                    ? "গ্রাহকের জন্য মন্তব্য (ঐচ্ছিক)"
                    : "Remark for Customer (Optional)"}
                </Label>
                <Input
                  placeholder={
                    isBn
                      ? "গ্রাহক এই মেসেজটি দেখতে পাবেন..."
                      : "Customer will see this message..."
                  }
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {isBn ? "অ্যাডমিন নোট (গোপন)" : "Admin Notes (Internal)"}
                </Label>
                <Textarea
                  placeholder={
                    isBn
                      ? "শুধুমাত্র অ্যাডমিনদের জন্য..."
                      : "For admin use only..."
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating
                  ? isBn
                    ? "আপডেট হচ্ছে..."
                    : "Updating..."
                  : isBn
                    ? "আপডেট সেভ করুন"
                    : "Save Update"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="w-full md:w-80">
          <Card>
            <CardHeader>
              <CardTitle>
                {isBn ? "স্ট্যাটাস হিস্ট্রি" : "Status History"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.statusHistory?.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {index === 0 ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>
                      {index !== (request.statusHistory?.length || 1) - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-sm">{history.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat(isBn ? "bn-BD" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(history.createdAt))}
                      </p>
                      {history.remark && (
                        <p className="text-xs mt-1">{history.remark}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
