'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUpdateUserRolesMutation, Role, User } from '@/features/users/usersApi';
import { Checkbox } from '@/components/ui/checkbox';

const roleSchema = z.object({
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

const ALL_ROLES = [Role.CUSTOMER, Role.SELLER, Role.RIDER, Role.ADMIN];

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
  isSuperAdminMode,
}: {
  user: User;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isSuperAdminMode?: boolean;
}) {
  const [updateRoles, { isLoading }] = useUpdateUserRolesMutation();
  
  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    values: {
      roles: user?.roles?.map((r) => r.name) || [Role.CUSTOMER],
    }
  });

  const onSubmit = async (values: z.infer<typeof roleSchema>) => {
    try {
      await updateRoles({ id: user.id, roles: values.roles }).unwrap();
      toast.success('Roles updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update roles');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Roles - {user?.firstName} {user?.lastName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Roles</FormLabel>
                  </div>
                  {ALL_ROLES.map((role) => (
                    <FormField
                      key={role}
                      control={form.control}
                      name="roles"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={role}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, role])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== role
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {role}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Roles'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
