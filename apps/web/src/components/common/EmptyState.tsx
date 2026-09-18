import React from 'react';
import { FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = 'No Data Found',
  description = 'There is currently nothing to show here.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px] border rounded-lg bg-muted/20 border-dashed">
      <div className="bg-muted p-4 rounded-full mb-4 text-muted-foreground">
        {icon || <FileIcon className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
