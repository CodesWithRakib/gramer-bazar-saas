'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  useGetAdminFlashSalesQuery, 
  useCreateFlashSaleMutation, 
  useUpdateFlashSaleMutation, 
  useDeleteFlashSaleMutation,
  FlashSale,
} from '@/features/flash-sales/flashSalesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Flame, Plus, Trash2, Calendar, Edit, Image as ImageIcon, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminPagination from '@/components/ui/AdminPagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export interface AdminFlashSalesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminFlashSalesView({ lang = 'en' }: AdminFlashSalesViewProps) {
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useGetAdminFlashSalesQuery({ page, limit }, {
    skip: !isAuthenticated,
  });

  const [createFlashSale] = useCreateFlashSaleMutation();
  const [updateFlashSale] = useUpdateFlashSaleMutation();
  const [deleteFlashSale] = useDeleteFlashSaleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [flashSaleToDelete, setFlashSaleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    bannerImage: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN')) {
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, user, router, lang]);

  const rawSales = data?.data || [];
  const meta = data?.meta;

  const filteredSales = useMemo(() => {
    return rawSales.filter((sale) => {
      const matchesSearch = !search.trim() || sale.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? sale.isActive : !sale.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [rawSales, search, statusFilter]);

  if (!isAuthenticated || !user?.roles?.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN')) return null;

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      startDate: '',
      endDate: '',
      bannerImage: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sale: FlashSale) => {
    setIsEditing(true);
    setFormData({
      id: sale.id,
      name: sale.name,
      bannerImage: sale.bannerImage || '',
      startDate: sale.startDate ? new Date(sale.startDate).toISOString().slice(0, 16) : '',
      endDate: sale.endDate ? new Date(sale.endDate).toISOString().slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateFlashSale({ id, data: { isActive } }).unwrap();
      toast.success(isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } catch {
      toast.error(isBn ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!flashSaleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFlashSale(flashSaleToDelete).unwrap();
      toast.success(isBn ? 'ফ্ল্যাশ সেল মুছে ফেলা হয়েছে' : 'Flash Sale deleted');
      setFlashSaleToDelete(null);
    } catch {
      toast.error(isBn ? 'মুছতে ব্যর্থ হয়েছে' : 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      bannerImage: formData.bannerImage || undefined,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateFlashSale({ id: formData.id, data: payload }).unwrap();
        toast.success(isBn ? 'ফ্ল্যাশ সেল আপডেট হয়েছে' : 'Flash Sale updated successfully');
      } else {
        await createFlashSale(payload).unwrap();
        toast.success(isBn ? 'ফ্ল্যাশ সেল তৈরি হয়েছে' : 'Flash Sale created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (isBn ? 'ব্যর্থ হয়েছে' : 'Operation failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="h-8 w-8 text-red-500 fill-current" />
            {isBn ? 'ফ্ল্যাশ সেল ম্যানেজমেন্ট' : 'Flash Sale Management'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn ? 'সীমিত সময়ের ক্যাম্পেইন ও বিশেষ মূল্যছাড় নিয়ন্ত্রণ করুন।' : 'Configure time-limited flash sale promotions and items.'}
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
                  setPage(1);
                }}
                placeholder={isBn ? 'ক্যাম্পেইনের নাম দিয়ে খুঁজুন...' : 'Search by campaign name...'}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
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
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="ACTIVE">{isBn ? 'সক্রিয়' : 'Active'}</SelectItem>
                  <SelectItem value="INACTIVE">{isBn ? 'নিষ্ক্রিয়' : 'Inactive'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Slot */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateModal} className="rounded-full px-6 h-11 whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                {isBn ? 'নতুন ফ্ল্যাশ সেল' : 'Create Flash Sale'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditing ? (isBn ? 'ফ্ল্যাশ সেল এডিট করুন' : 'Edit Flash Sale') : (isBn ? 'নতুন ফ্ল্যাশ সেল' : 'New Flash Sale')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{isBn ? 'নাম' : 'Name'}</Label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Ramadan Super Sale"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isBn ? 'ব্যানার ইমেজ URL (ঐচ্ছিক)' : 'Banner Image URL (Optional)'}</Label>
                  <Input 
                    value={formData.bannerImage} 
                    onChange={e => setFormData({...formData, bannerImage: e.target.value})} 
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isBn ? 'শুরুর তারিখ' : 'Start Date'}</Label>
                  <Input 
                    type="datetime-local" 
                    required
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isBn ? 'শেষের তারিখ' : 'End Date'}</Label>
                  <Input 
                    type="datetime-local" 
                    required
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>

                <Button type="submit" className="w-full mt-6 rounded-full">
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Flash Sale'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'নাম' : 'Name'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'আইটেম' : 'Items'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-border">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-32 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-36 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-8 w-24 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-12 rounded-full bg-muted"></div></td>
                      <td className="py-4 px-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-muted"></div></td>
                    </tr>
                  ))
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <Flame className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো ফ্ল্যাশ সেল পাওয়া যায়নি' : 'No flash sales found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || statusFilter !== 'ALL'
                            ? (isBn ? 'আপনার ফিল্টারের সাথে কোনো ফ্ল্যাশ সেল মেলেনি' : 'No flash sales match your search or filter.')
                            : (isBn ? 'বর্তমানে কোনো ফ্ল্যাশ সেল ক্যাম্পেইন নেই' : 'No active flash sales campaigns.')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          {sale.bannerImage && <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
                          <span>{sale.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-xs gap-0.5 text-muted-foreground">
                          <span><Calendar className="h-3 w-3 inline mr-1 text-muted-foreground"/> Start: {new Date(sale.startDate).toLocaleDateString()}</span>
                          <span><Calendar className="h-3 w-3 inline mr-1 text-muted-foreground"/> End: {new Date(sale.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 rounded-full text-xs"
                          onClick={() => router.push(`/${lang}/admin/flash-sales/${sale.id}/items`)}
                        >
                          {isBn ? 'আইটেম পরিচালনা' : 'Manage Items'}
                        </Button>
                      </td>
                      <td className="py-3.5 px-4">
                        <Switch 
                          checked={sale.isActive} 
                          onCheckedChange={(val: boolean) => handleToggleActive(sale.id, val)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(sale)} className="h-8 w-8 rounded-full">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setFlashSaleToDelete(sale.id)} className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination inside card */}
        <AdminPagination
          totalItems={meta?.total ?? filteredSales.length}
          itemsPerPage={limit}
          currentPage={page}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          lang={isBn ? 'bn' : 'en'}
          itemLabel={{
            singular: isBn ? 'ফ্ল্যাশ সেল' : 'flash sale',
            plural: isBn ? 'ফ্ল্যাশ সেল' : 'flash sales',
          }}
        />

        <ConfirmDialog
          isOpen={!!flashSaleToDelete}
          onClose={() => setFlashSaleToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={isBn ? 'ফ্ল্যাশ সেল মুছে ফেলতে চান?' : 'Delete Flash Sale?'}
          description={isBn ? 'এই অ্যাকশনটি বাতিল করা যাবে না।' : 'This action cannot be undone.'}
          confirmLabel={isBn ? 'মুছে ফেলুন' : 'Delete'}
          cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
