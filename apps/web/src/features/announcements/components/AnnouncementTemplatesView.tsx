'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetAnnouncementTemplatesQuery } from '../announcementsApi';
import { Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnnouncementTemplatesView() {
  const { data: templates, isLoading } = useGetAnnouncementTemplatesQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Announcement Templates
          </h2>
          <p className="text-muted-foreground">
            Manage reusable announcement templates.
          </p>
        </div>
        <Button>Create Template</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates && templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.message}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-12 border rounded-lg border-dashed">
            No templates found. Click "Create Template" to add one.
          </div>
        )}
      </div>
    </div>
  );
}
