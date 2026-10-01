'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { customToast } from '@/components/ui/custom-toast';
import {
  AdminAccount,
  useGetPermissionCatalogQuery,
  useSetAdminPermissionsMutation,
} from '../adminsApi';

export interface AdminPermissionsDialogProps {
  admin: AdminAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
}

export function AdminPermissionsDialog({
  admin,
  open,
  onOpenChange,
  lang = 'en',
}: AdminPermissionsDialogProps) {
  const isBn = lang === 'bn';
  const { data: catalog, isLoading } = useGetPermissionCatalogQuery(undefined, { skip: !open });
  const [setPermissions, { isLoading: isSaving }] = useSetAdminPermissionsMutation();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (admin) {
      setSelected(new Set(admin.directPermissions));
      setSearch('');
    }
  }, [admin]);

  const inherited = useMemo(() => {
    if (!admin) return new Set<string>();
    const direct = new Set(admin.directPermissions);
    return new Set(admin.effectivePermissions.filter((p) => !direct.has(p)));
  }, [admin]);

  const grouped = useMemo(() => {
    const permissions = catalog?.permissions ?? [];
    const term = search.trim().toLowerCase();
    const filtered = term
      ? permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            (p.description ?? '').toLowerCase().includes(term)
        )
      : permissions;

    const map = new Map<string, typeof filtered>();
    for (const permission of filtered) {
      const list = map.get(permission.group) ?? [];
      list.push(permission);
      map.set(permission.group, list);
    }
    return Array.from(map.entries());
  }, [catalog, search]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSave = async () => {
    if (!admin) return;
    try {
      await setPermissions({ id: admin.id, permissions: Array.from(selected) }).unwrap();
      customToast.success(isBn ? 'পারমিশন সংরক্ষণ হয়েছে' : 'Permissions updated', {
        description: admin.email || admin.phone,
      });
      onOpenChange(false);
    } catch {
      customToast.error(isBn ? 'পারমিশন সংরক্ষণ ব্যর্থ' : 'Could not update permissions');
    }
  };

  const isSuperAdmin = admin?.isSuperAdmin ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            {isSuperAdmin ? (
              <ShieldCheck className="w-4 h-4 text-primary" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-primary" />
            )}
            {isBn ? 'পারমিশন ব্যবস্থাপনা' : 'Permission Management'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {admin ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || admin.email : ''}
            {!isSuperAdmin && (
              <span className="block mt-1">
                {isBn
                  ? 'রোল থেকে পাওয়া পারমিশন ধূসর দেখানো হয়; এখান থেকে অতিরিক্ত পারমিশন সক্রিয়/নিষ্ক্রিয় করা যায়।'
                  : 'Grey badges are inherited from the role. Toggle to grant or revoke account-specific permissions.'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex-1 overflow-hidden flex flex-col gap-4">
          {isSuperAdmin ? (
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                {isBn
                  ? 'সুপার অ্যাডমিনের পারমিশন সিস্টেম-নির্ধারিত এবং সম্পাদনা করা যায় না।'
                  : 'Super Admin permissions are system-defined and cannot be edited.'}
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isBn ? 'পারমিশন খুঁজুন...' : 'Search permissions...'}
                  className="ps-9"
                />
              </div>

              <div className="flex-1 overflow-y-auto pe-1 space-y-5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  grouped.map(([group, permissions]) => (
                    <div key={group} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions.map((permission) => {
                          const isInherited = inherited.has(permission.name);
                          const isChecked = selected.has(permission.name) || isInherited;
                          return (
                            <label
                              key={permission.name}
                              className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                            >
                              <Checkbox
                                checked={isChecked}
                                disabled={isInherited}
                                onCheckedChange={() => toggle(permission.name)}
                                className="mt-0.5"
                              />
                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-medium break-all">
                                    {permission.name}
                                  </span>
                                  {permission.sensitive && (
                                    <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                      {isBn ? 'সংবেদনশীল' : 'sensitive'}
                                    </Badge>
                                  )}
                                  {isInherited && (
                                    <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                      {isBn ? 'রোল থেকে' : 'role'}
                                    </Badge>
                                  )}
                                </span>
                                {permission.description && (
                                  <span className="block text-[11px] text-muted-foreground mt-0.5">
                                    {permission.description}
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isSuperAdmin ? (isBn ? 'বন্ধ করুন' : 'Close') : isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          {!isSuperAdmin && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {isBn ? 'সংরক্ষণ' : 'Save permissions'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
