"use client";

import React, { use, useState, useMemo } from "react";
import {
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  Banner,
} from "@/features/banners/bannersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Image as ImageIcon, Trash2, Edit, Search, X } from "lucide-react";
import Image from "next/image";
import { AdminPagination } from "@/components/ui/AdminPagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

export interface AdminBannersViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminBannersView({ lang = 'en' }: AdminBannersViewProps) {
  const isBn = lang === "bn";

  const { data: banners = [], isLoading } = useGetAdminBannersQuery();
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    displayOrder: 0,
    isActive: true,
  });

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      const matchesSearch =
        !search.trim() ||
        banner.title.toLowerCase().includes(search.toLowerCase()) ||
        (banner.linkUrl && banner.linkUrl.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || (statusFilter === "ACTIVE" ? banner.isActive : !banner.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [banners, search, statusFilter]);

  const paginatedBanners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBanners.slice(start, start + pageSize);
  }, [filteredBanners, currentPage, pageSize]);

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || "",
        displayOrder: banner.displayOrder,
        isActive: banner.isActive,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        imageUrl: "",
        linkUrl: "",
        displayOrder: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        linkUrl: formData.linkUrl || undefined,
      };

      if (editingBanner) {
        await updateBanner({ id: editingBanner.id, data: payload }).unwrap();
      } else {
        await createBanner(payload).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save banner:", err);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      await updateBanner({
        id: banner.id,
        data: { isActive: !banner.isActive },
      }).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteBanner(bannerToDelete).unwrap();
      toast.success(isBn ? "ব্যানার মুছে ফেলা হয়েছে" : "Banner deleted successfully");
    } catch {
      toast.error(isBn ? "ব্যানার মুছতে সমস্যা হয়েছে" : "Failed to delete banner");
    } finally {
      setBannerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isBn ? "প্রচারমূলক ব্যানারসমূহ" : "Campaign Banners"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn
              ? "হোমপেজ ও বিভিন্ন পেজের ব্যানার স্লাইডার এবং প্রচার নিয়ন্ত্রণ করুন।"
              : "Manage marketing promotional banners, hero sliders, and custom links."}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
        {/* Top Toolbar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            {/* Search Pill */}
            <div className="relative w-full max-w-md min-w-[200px] flex-1 sm:w-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isBn ? "ব্যানারের শিরোনাম বা লিংক খুঁজুন..." : "Search banners by title or link..."}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-44 md:w-48">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? "সকল স্ট্যাটাস" : "All Status"}</SelectItem>
                  <SelectItem value="ACTIVE">{isBn ? "সক্রিয়" : "Active"}</SelectItem>
                  <SelectItem value="INACTIVE">{isBn ? "নিষ্ক্রিয়" : "Inactive"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Slot */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()} className="rounded-full px-6 h-11 whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                {isBn ? "নতুন ব্যানার যোগ করুন" : "Add Banner"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? (isBn ? "ব্যানার সম্পাদনা" : "Edit Banner") : (isBn ? "নতুন ব্যানার" : "Create New Banner")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">{isBn ? "ব্যানার শিরোনাম" : "Banner Title"}</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Summer Campaign"
                    className="rounded-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">{isBn ? "ইমেজ URL" : "Image URL"}</Label>
                  <Input
                    id="imageUrl"
                    required
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/banner.jpg"
                    className="rounded-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="linkUrl">{isBn ? "টার্গেট লিংক (ঐচ্ছিক)" : "Target Link (Optional)"}</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkUrl: e.target.value })
                    }
                    placeholder="/products?category=summer"
                    className="rounded-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayOrder">{isBn ? "প্রদর্শনের ক্রম" : "Display Order"}</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="rounded-lg"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">{isBn ? "সক্রিয়" : "Active"}</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full"
                  >
                    {isBn ? "বাতিল" : "Cancel"}
                  </Button>
                  <Button type="submit" className="rounded-full">
                    {editingBanner ? (isBn ? "আপডেট করুন" : "Update Banner") : (isBn ? "তৈরি করুন" : "Create Banner")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <TableRow>
                  <TableHead className="py-3.5 px-4 w-28">{isBn ? "প্রিভিউ" : "Preview"}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? "শিরোনাম" : "Title"}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? "টার্গেট লিংক" : "Link"}</TableHead>
                  <TableHead className="py-3.5 px-4 w-24">{isBn ? "ক্রম" : "Order"}</TableHead>
                  <TableHead className="py-3.5 px-4 w-24 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? "পদক্ষেপ" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                      <TableCell className="py-3.5 px-4"><div className="h-10 w-16 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-3.5 px-4"><div className="h-4 w-32 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-3.5 px-4"><div className="h-4 w-28 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-3.5 px-4"><div className="h-4 w-12 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-3.5 px-4 text-center"><div className="h-6 w-12 rounded-full bg-muted mx-auto"></div></TableCell>
                      <TableCell className="py-3.5 px-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : paginatedBanners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? "কোনো ব্যানার পাওয়া যায়নি" : "No banners found"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || statusFilter !== "ALL"
                            ? (isBn ? "আপনার ফিল্টারের সাথে কোনো ব্যানার মেলেনি" : "No banners match your search or filter.")
                            : (isBn ? "বর্তমানে কোনো ক্যাম্পেইন ব্যানার যোগ করা হয়নি" : "No campaign banners created yet.")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBanners.map((banner) => (
                    <TableRow key={banner.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <TableCell className="py-3.5 px-4">
                        <div className="relative h-12 w-20 rounded-lg overflow-hidden border bg-muted">
                          {banner.imageUrl ? (
                            <Image
                              src={banner.imageUrl}
                              alt={banner.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 m-auto mt-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-semibold text-foreground">{banner.title}</TableCell>
                      <TableCell className="py-3.5 px-4 text-muted-foreground text-xs max-w-[200px] truncate font-mono">
                        {banner.linkUrl || "—"}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-muted-foreground font-mono">{banner.displayOrder}</TableCell>
                      <TableCell className="py-3.5 px-4 text-center">
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => handleToggleStatus(banner)}
                        />
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(banner)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setBannerToDelete(banner.id)}
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={isBn ? "মুছে ফেলুন" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination inside card */}
        <AdminPagination
          totalItems={filteredBanners.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setPageSize(newLimit);
            setCurrentPage(1);
          }}
          lang={isBn ? "bn" : "en"}
          itemLabel={{
            singular: isBn ? "ব্যানার" : "banner",
            plural: isBn ? "ব্যানার" : "banners",
          }}
        />
      </div>

      <ConfirmDialog
        open={!!bannerToDelete}
        onOpenChange={(open) => {
          if (!open) setBannerToDelete(null);
        }}
        title={isBn ? "ব্যানার মুছে ফেলতে চান?" : "Delete Banner?"}
        description={
          isBn
            ? "আপনি কি নিশ্চিত যে আপনি এই ব্যানারটি মুছে ফেলতে চান? এটি আর হোমপেজ বা ক্যাম্পেইনে প্রদর্শিত হবে না।"
            : "Are you sure you want to delete this promotional banner? It will immediately disappear from live storefronts."
        }
        confirmLabel={isBn ? "মুছে ফেলুন" : "Delete Banner"}
        cancelLabel={isBn ? "বাতিল" : "Cancel"}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        isBn={isBn}
      />
    </div>
  );
}
