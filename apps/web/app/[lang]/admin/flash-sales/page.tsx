'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  useGetAdminFlashSalesQuery, 
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useDeleteFlashSaleMutation
} from '@/features/flash-sales/flashSalesApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Flame, Plus, Trash2, Calendar, Edit, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFlashSalesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminFlashSalesQuery({ page, limit: 10 }, {
    skip: !isAuthenticated,
  });

  const [createFlashSale] = useCreateFlashSaleMutation();
  const [updateFlashSale] = useUpdateFlashSaleMutation();
  const [deleteFlashSale] = useDeleteFlashSaleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    bannerImage: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('ADMIN')) {
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, user, router, lang]);

  if (!isAuthenticated || !user?.roles?.includes('ADMIN')) return null;

  const flashSales = data?.data || [];
  const meta = data?.meta;

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

  const handleOpenEditModal = (sale: any) => {
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
    } catch (error) {
      toast.error(isBn ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    try {
      await deleteFlashSale(id).unwrap();
      toast.success(isBn ? 'ফ্ল্যাশ সেল মুছে ফেলা হয়েছে' : 'Flash Sale deleted');
    } catch (error) {
      toast.error(isBn ? 'মুছতে ব্যর্থ হয়েছে' : 'Deletion failed');
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
    } catch (error: any) {
      toast.error(error?.data?.message || (isBn ? 'ব্যর্থ হয়েছে' : 'Operation failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Flame className="h-8 w-8 text-red-500 fill-current" />
          {isBn ? 'ফ্ল্যাশ সেল ম্যানেজমেন্ট' : 'Flash Sale Management'}
        </h1>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateModal}>
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
                  placeholder="e.g. Winter Mega Sale"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{isBn ? 'ব্যানার ইমেজ URL' : 'Banner Image URL'}</Label>
                <Input 
                  value={formData.bannerImage} 
                  onChange={e => setFormData({...formData, bannerImage: e.target.value})} 
                  placeholder="https://..."
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

              <Button type="submit" className="w-full mt-6">
                {isBn ? 'সংরক্ষণ করুন' : 'Save Flash Sale'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">{isBn ? 'নাম' : 'Name'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'আইটেম' : 'Items'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-6 py-4 font-medium text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                ) : flashSales.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">No flash sales found.</td></tr>
                ) : (
                  flashSales.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {sale.bannerImage && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                          {sale.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs gap-1">
                          <span><Calendar className="h-3 w-3 inline mr-1"/> Start: {new Date(sale.startDate).toLocaleDateString()}</span>
                          <span><Calendar className="h-3 w-3 inline mr-1"/> End: {new Date(sale.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/${lang}/admin/flash-sales/${sale.id}/items`)}
                        >
                          Manage Items
                        </Button>
                      </td>
                      <td className="px-6 py-4">
                        <Switch 
                          checked={sale.isActive} 
                          onCheckedChange={(val: boolean) => handleToggleActive(sale.id, val)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(sale)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                {page} / {meta.totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
