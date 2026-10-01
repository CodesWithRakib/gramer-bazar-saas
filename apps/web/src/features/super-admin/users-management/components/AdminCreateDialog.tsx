'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { customToast } from '@/components/ui/custom-toast';
import { useCreateAdminMutation } from '../adminsApi';

export interface AdminCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
  canCreateSuperAdmin?: boolean;
}

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  role: 'ADMIN',
};

export function AdminCreateDialog({
  open,
  onOpenChange,
  lang = 'en',
  canCreateSuperAdmin = false,
}: AdminCreateDialogProps) {
  const isBn = lang === 'bn';
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createAdmin, { isLoading }] = useCreateAdminMutation();

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = isBn ? 'নাম আবশ্যক' : 'First name is required';
    if (!form.lastName.trim()) next.lastName = isBn ? 'নাম আবশ্যক' : 'Last name is required';
    if (!/^01[0-9]{9}$/.test(form.phone.trim()))
      next.phone = isBn ? 'সঠিক ফোন নম্বর দিন' : 'Enter a valid 11-digit phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = isBn ? 'সঠিক ইমেইল দিন' : 'Enter a valid email address';
    if (form.password.length < 8)
      next.password = isBn ? 'কমপক্ষে ৮ অক্ষর' : 'Minimum 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validate()) return;

    try {
      await createAdmin({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        role: form.role,
      }).unwrap();
      customToast.success(isBn ? 'অ্যাডমিন তৈরি হয়েছে' : 'Admin created successfully');
      setForm(EMPTY_FORM);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? ((error as { data?: { message?: string } }).data?.message ?? '')
          : '';
      customToast.error(message || (isBn ? 'তৈরি করা যায়নি' : 'Could not create admin'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-1.5rem)]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isBn ? 'নতুন অ্যাডমিন তৈরি' : 'Create Admin Account'}</DialogTitle>
            <DialogDescription className="text-xs">
              {isBn
                ? 'নতুন অপারেশনাল অ্যাডমিন অ্যাকাউন্ট তৈরি করুন এবং পরবর্তীতে পারমিশন নির্ধারণ করুন।'
                : 'Create an administrative account. Fine-grained permissions can be assigned afterwards.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{isBn ? 'নাম' : 'First name'}</Label>
              <Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
              {errors.firstName && <p className="text-[11px] text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isBn ? 'পদবি' : 'Last name'}</Label>
              <Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
              {errors.lastName && <p className="text-[11px] text-destructive">{errors.lastName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isBn ? 'ফোন' : 'Phone'}</Label>
              <Input
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
              {errors.phone && <p className="text-[11px] text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (optional)'}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isBn ? 'পাসওয়ার্ড' : 'Password'}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
              {errors.password && <p className="text-[11px] text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isBn ? 'রোল' : 'Role'}</Label>
              <Select
                value={form.role}
                onValueChange={(v) => update('role', v)}
                disabled={!canCreateSuperAdmin}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  {canCreateSuperAdmin && <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {isBn ? 'তৈরি করুন' : 'Create admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
