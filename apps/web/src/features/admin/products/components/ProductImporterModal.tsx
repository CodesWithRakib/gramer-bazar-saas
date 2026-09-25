'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  useRunProductImportMutation,
  useGetImportLogsQuery,
  ImportLog,
} from '@/features/catalog/catalogApi';
import {
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export function ProductImporterModal() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<'dummyjson' | 'openfoodfacts'>('dummyjson');
  const [mode, setMode] = useState<'DRY_RUN' | 'IMPORT' | 'RETRY_IMAGES'>('DRY_RUN');
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [lastResult, setLastResult] = useState<ImportLog | null>(null);

  const [runImport, { isLoading: isRunning }] = useRunProductImportMutation();
  const { data: logsData, refetch: refetchLogs } = useGetImportLogsQuery({ limit: 10 });

  const handleRun = async () => {
    try {
      setLastResult(null);
      const res = await runImport({
        source,
        mode,
        limit,
        category: category.trim() || undefined,
        updateExisting,
      }).unwrap();

      setLastResult(res.log);
      if (mode === 'DRY_RUN') {
        toast.info(
          `Dry Run Complete: ${res.log.totalFetched} fetched, ${res.log.createdCount} to create, ${res.log.duplicatesCount} duplicates.`
        );
      } else {
        toast.success(
          `Import Succeeded: ${res.log.createdCount} products created with local images.`
        );
      }
      refetchLogs();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to execute import');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <DownloadCloud className="h-4 w-4" />
          <span>Bulk Product Importer</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DownloadCloud className="h-5 w-5 text-primary" />
            Bulk Product Importer & Normalizer
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="run" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="run">Execute Import</TabsTrigger>
            <TabsTrigger value="logs">Import History Logs</TabsTrigger>
          </TabsList>

          {/* TAB 1: RUN IMPORT */}
          <TabsContent value="run" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select
                  value={source}
                  onValueChange={(val: 'dummyjson' | 'openfoodfacts') => setSource(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dummyjson">
                      DummyJSON (General Catalog, Electronics, Beauty, Groceries)
                    </SelectItem>
                    <SelectItem value="openfoodfacts">
                      Open Food Facts (Food, Groceries & Ingredients)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Legitimate public source adapter with strict duplicate check and local image download.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Execution Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(val: 'DRY_RUN' | 'IMPORT' | 'RETRY_IMAGES') => setMode(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRY_RUN">
                      Dry Run (Preview & Validate without changing Database)
                    </SelectItem>
                    <SelectItem value="IMPORT">
                      Actual Import (Save to DB & Download Local Images)
                    </SelectItem>
                    <SelectItem value="RETRY_IMAGES">
                      Retry Failed Images
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Dry-run tests category mapping and duplicates before writing to disk or database.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Limit</Label>
                <Select
                  value={limit.toString()}
                  onValueChange={(val) => setLimit(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Products</SelectItem>
                    <SelectItem value="10">10 Products</SelectItem>
                    <SelectItem value="20">20 Products</SelectItem>
                    <SelectItem value="50">50 Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specific Category Filter (Optional)</Label>
                <Input
                  placeholder="e.g. groceries, beauty, electronics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <div className="space-y-0.5">
                <Label>Update Existing Records</Label>
                <p className="text-xs text-muted-foreground">
                  If enabled, existing products matching barcode/SKU will be updated. Default preserves manual edits.
                </p>
              </div>
              <Switch checked={updateExisting} onCheckedChange={setUpdateExisting} />
            </div>

            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing remote data, mapping categories & downloading images...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="h-4 w-4" />
                  <span>{mode === 'DRY_RUN' ? 'Run Dry-Run Preview' : 'Start Actual Import'}</span>
                </>
              )}
            </Button>

            {/* RESULTS CARD */}
            {lastResult && (
              <div className="rounded-xl border p-4 bg-card space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-base">Execution Summary</span>
                  </div>
                  <Badge
                    variant={lastResult.status === 'COMPLETED' ? 'default' : 'secondary'}
                    className={
                      lastResult.status === 'COMPLETED'
                        ? 'bg-emerald-600'
                        : 'bg-amber-600'
                    }
                  >
                    {lastResult.status} ({lastResult.mode})
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-muted/40 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {lastResult.totalFetched}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Total Fetched</div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg">
                    <div className="text-2xl font-bold">
                      {lastResult.createdCount}
                    </div>
                    <div className="text-xs mt-0.5">
                      {lastResult.mode === 'DRY_RUN' ? 'To Create' : 'Created in DB'}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg">
                    <div className="text-2xl font-bold">
                      {lastResult.duplicatesCount}
                    </div>
                    <div className="text-xs mt-0.5">Duplicates Skipped</div>
                  </div>
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
                    <div className="text-2xl font-bold">
                      {lastResult.failedCount + lastResult.imageFailuresCount}
                    </div>
                    <div className="text-xs mt-0.5">Image / Map Errors</div>
                  </div>
                </div>

                {lastResult.errorSummary && (
                  <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{lastResult.errorSummary}</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: IMPORT HISTORY LOGS */}
          <TabsContent value="logs" className="space-y-4 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Recent import operations and audit trail
              </span>
              <Button variant="ghost" size="sm" onClick={() => refetchLogs()}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {logsData?.items?.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground border rounded-lg">
                  No import logs recorded yet.
                </div>
              ) : (
                logsData?.items?.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-card text-xs flex flex-col sm:flex-row justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm capitalize">{log.source}</span>
                        <Badge variant="outline">{log.mode}</Badge>
                        <Badge
                          variant={log.status === 'COMPLETED' ? 'default' : 'destructive'}
                          className="text-[10px]"
                        >
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-3">
                        <span>Fetched: {log.totalFetched}</span>
                        <span>Created: {log.createdCount}</span>
                        <span>Duplicates: {log.duplicatesCount}</span>
                        <span>Img Failures: {log.imageFailuresCount}</span>
                      </div>
                    </div>
                    <div className="text-right text-muted-foreground text-[11px] self-end sm:self-center">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
