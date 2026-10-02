'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Search, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customToast } from '@/components/ui/custom-toast';
import { getBroadcastDictionary } from '@/lib/broadcast-i18n';
import {
  useGetBroadcastTemplatesQuery,
  usePreviewAudienceMutation,
  useCreateBroadcastCampaignMutation,
  useSendBroadcastCampaignMutation,
  useSearchCustomersQuery,
  type BroadcastAudienceConfig,
  type BroadcastAudienceType,
} from '../broadcastApi';

const AUDIENCE_TYPES: BroadcastAudienceType[] = [
  'ALL_CUSTOMERS',
  'SELECTED_CUSTOMERS',
  'ACTIVE_CUSTOMERS',
  'INACTIVE_CUSTOMERS',
  'ORDERED_BEFORE',
  'NO_RECENT_ORDER',
  'AREA_BASED',
];

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function extractKeys(body: string): string[] {
  const matches = body.match(VARIABLE_PATTERN) ?? [];
  return matches
    .map((match) => match.replace(/[{}\s]/g, ''))
    .filter((key, index, all) => all.indexOf(key) === index);
}

export interface BroadcastCampaignWizardProps {
  lang?: string;
}

export function BroadcastCampaignWizard({ lang = 'en' }: BroadcastCampaignWizardProps) {
  const t = getBroadcastDictionary(lang);
  const router = useRouter();
  const isBn = lang === 'bn';

  const stepKeys = [
    'details',
    'template',
    'audience',
    'variables',
    'preview',
    'schedule',
    'confirm',
  ] as const;
  const [stepIndex, setStepIndex] = useState(0);
  const stepKey = stepKeys[stepIndex];

  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audienceType, setAudienceType] = useState<BroadcastAudienceType>('ALL_CUSTOMERS');
  const [optInRequired, setOptInRequired] = useState(true);
  const [inactiveDays, setInactiveDays] = useState(30);
  const [districtId, setDistrictId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [sendNow, setSendNow] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { data: templates } = useGetBroadcastTemplatesQuery({ page: 1, limit: 100 });
  const { data: customers } = useSearchCustomersQuery(
    { search: customerSearch || undefined, limit: 8 },
    { skip: audienceType !== 'SELECTED_CUSTOMERS' },
  );
  const [previewAudience, { data: preview, isLoading: isPreviewing }] =
    usePreviewAudienceMutation();
  const [createCampaign, { isLoading: isCreating }] = useCreateBroadcastCampaignMutation();
  const [sendCampaign] = useSendBroadcastCampaignMutation();

  const selectedTemplate = useMemo(
    () => templates?.data.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  const variableKeys = useMemo(
    () => (selectedTemplate ? extractKeys(selectedTemplate.body) : []),
    [selectedTemplate],
  );

  const audienceConfig: BroadcastAudienceConfig = useMemo(
    () => ({
      isOptInRequired: optInRequired,
      inactiveDays,
      districtId: audienceType === 'AREA_BASED' && districtId ? districtId : undefined,
      customerIds: audienceType === 'SELECTED_CUSTOMERS' ? selectedIds : undefined,
    }),
    [optInRequired, inactiveDays, districtId, audienceType, selectedIds],
  );

  // Refresh the preview whenever the audience or template changes.
  useEffect(() => {
    if (!selectedTemplate) return;
    void previewAudience({ audienceType, audienceConfig })
      .unwrap()
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceType, audienceConfig, selectedTemplate?.id]);

  const renderedMessage = useMemo(() => {
    if (!selectedTemplate) return '';
    const sample: Record<string, string> = {
      customer_name: isBn ? 'রাকিব' : 'Rakib',
      customer_phone: '+8801700000000',
      ...variables,
    };
    return selectedTemplate.body.replace(
      VARIABLE_PATTERN,
      (full, key: string) => sample[key] ?? full,
    );
  }, [selectedTemplate, variables, isBn]);

  const validateStep = (): string | null => {
    if (stepKey === 'details' && !title.trim()) return t.wizard.titleRequired;
    if (stepKey === 'template' && !templateId) return t.wizard.templateRequired;
    if (stepKey === 'preview' && preview && preview.recipientCount === 0) {
      return t.wizard.noRecipients;
    }
    if (stepKey === 'schedule' && scheduleLater && !scheduledAt) return t.wizard.scheduleRequired;
    return null;
  };

  const next = () => {
    const error = validateStep();
    if (error) {
      customToast.error(error);
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, stepKeys.length - 1));
  };

  const back = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const toggleCustomer = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async () => {
    if (!confirmed) return;
    const error = validateStep();
    if (error) {
      customToast.error(error);
      return;
    }
    try {
      const created = await createCampaign({
        title: title.trim(),
        templateId,
        audienceType,
        audienceConfig,
        scheduledAt: scheduleLater && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      }).unwrap();

      if (sendNow && !scheduleLater) {
        await sendCampaign(created.id).unwrap();
        customToast.success(t.campaignDetail.sent);
      } else if (scheduleLater) {
        customToast.success(t.wizard.createdScheduled);
      } else {
        customToast.success(t.wizard.created);
      }

      router.push(`/${lang}/super-admin/broadcast/campaigns/${created.id}`);
    } catch (err) {
      const message = (err as { data?: { message?: string | string[] } })?.data?.message;
      customToast.error(Array.isArray(message) ? message[0] : message || t.wizard.createError);
    }
  };

  const steps = stepKeys.map((key) => t.wizard.steps[key]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/${lang}/super-admin/broadcast/campaigns`)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{t.cards.newCampaignTitle}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t.cards.newCampaignDesc}</p>
      </div>

      {/* Step indicator */}
      <ol className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => index <= stepIndex && setStepIndex(index)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                index === stepIndex
                  ? 'border-primary bg-primary/10 text-primary'
                  : index < stepIndex
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10'
                    : 'text-muted-foreground'
              }`}
            >
              {index < stepIndex ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
              {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border bg-card p-5">
        {stepKey === 'details' && (
          <div className="space-y-2">
            <Label htmlFor="cw-title">{t.wizard.campaignTitle}</Label>
            <Input
              id="cw-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.wizard.campaignTitlePlaceholder}
            />
          </div>
        )}

        {stepKey === 'template' && (
          <div className="space-y-3">
            <Label>{t.wizard.selectTemplate}</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder={t.wizard.selectTemplate} />
              </SelectTrigger>
              <SelectContent>
                {(templates?.data ?? []).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} · {template.language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="whitespace-pre-wrap break-words text-sm">{selectedTemplate.body}</p>
              </div>
            )}
          </div>
        )}

        {stepKey === 'audience' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.wizard.audienceType}</Label>
              <Select
                value={audienceType}
                onValueChange={(v) => setAudienceType(v as BroadcastAudienceType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t.audience.types[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm">{t.audience.optInRequired}</span>
              <Switch checked={optInRequired} onCheckedChange={setOptInRequired} />
            </div>

            {(audienceType === 'ACTIVE_CUSTOMERS' ||
              audienceType === 'INACTIVE_CUSTOMERS' ||
              audienceType === 'NO_RECENT_ORDER') && (
              <div className="space-y-1.5">
                <Label htmlFor="cw-days">{t.audience.inactiveDays}</Label>
                <Input
                  id="cw-days"
                  type="number"
                  min={1}
                  max={365}
                  value={inactiveDays}
                  onChange={(e) => setInactiveDays(Number(e.target.value) || 30)}
                />
              </div>
            )}

            {audienceType === 'AREA_BASED' && (
              <div className="space-y-1.5">
                <Label htmlFor="cw-district">{t.audience.districtId}</Label>
                <Input
                  id="cw-district"
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  placeholder="uuid"
                />
                <p className="text-xs text-muted-foreground">{t.audience.areaNote}</p>
              </div>
            )}

            {audienceType === 'SELECTED_CUSTOMERS' && (
              <div className="space-y-2">
                <Label>{t.audience.selectedCustomers}</Label>
                <div className="relative">
                  <Search
                    className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder={t.audience.searchCustomers}
                    className="ps-9"
                  />
                </div>
                <ul className="max-h-56 divide-y overflow-y-auto rounded-xl border">
                  {(customers ?? []).map((customer) => (
                    <li key={customer.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {customer.name ?? customer.phone}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {customer.phone}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(customer.id)}
                          onChange={() => toggleCustomer(customer.id)}
                          className="h-4 w-4"
                        />
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  {t.audience.selectedCustomers}: {selectedIds.length}
                </p>
              </div>
            )}

            <div className="rounded-xl border bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">{t.audience.estimatedRecipients}</p>
              <p className="text-lg font-bold">
                {isPreviewing ? '…' : (preview?.recipientCount ?? '—')}
              </p>
              {preview && preview.excludedOptOutCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {preview.excludedOptOutCount} {t.audience.excludedOptOut}
                </p>
              )}
            </div>
          </div>
        )}

        {stepKey === 'variables' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{t.wizard.variablesHint}</p>
            {variableKeys.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.wizard.selectTemplate}</p>
            )}
            {variableKeys.map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`cw-var-${key}`}>{`{{${key}}}`}</Label>
                <Input
                  id={`cw-var-${key}`}
                  value={variables[key] ?? ''}
                  onChange={(e) => setVariables((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        {stepKey === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.mockWarning}</span>
            </div>
            <PreviewRow label={t.campaigns.campaign} value={title || '—'} />
            <PreviewRow label={t.wizard.template} value={selectedTemplate?.name ?? '—'} />
            <PreviewRow label={t.wizard.language} value={selectedTemplate?.language ?? '—'} />
            <PreviewRow label={t.wizard.provider} value={selectedTemplate?.provider ?? 'MOCK'} />
            <PreviewRow
              label={t.wizard.audienceType}
              value={t.audience.types[audienceType]}
            />
            <PreviewRow
              label={t.wizard.recipientCount}
              value={isPreviewing ? '…' : String(preview?.recipientCount ?? '—')}
            />
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                {t.wizard.renderedMessage}
              </p>
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="whitespace-pre-wrap break-words text-sm">{renderedMessage || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {stepKey === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm">{t.wizard.scheduleLater}</span>
              <Switch checked={scheduleLater} onCheckedChange={setScheduleLater} />
            </div>
            {scheduleLater && (
              <div className="space-y-1.5">
                <Label htmlFor="cw-when">{t.wizard.scheduledAt}</Label>
                <Input
                  id="cw-when"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {stepKey === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">{t.wizard.reviewTitle}</h2>
            <p className="text-xs text-muted-foreground">{t.wizard.reviewHint}</p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t.campaigns.campaign}</span>
                <span className="font-medium">{title}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t.wizard.template}</span>
                <span className="font-medium">{selectedTemplate?.name ?? '—'}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t.wizard.recipientCount}</span>
                <span className="font-medium">{preview?.recipientCount ?? '—'}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">{t.wizard.schedule}</span>
                <span className="font-medium">
                  {scheduleLater && scheduledAt
                    ? new Date(scheduledAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')
                    : t.wizard.sendNow}
                </span>
              </li>
            </ul>

            {!scheduleLater && (
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm">{t.wizard.sendNow}</span>
                <Switch checked={sendNow} onCheckedChange={setSendNow} />
              </div>
            )}

            <label className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              <span>{t.wizard.confirmWarning}</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={back} disabled={stepIndex === 0}>
          {t.wizard.back}
        </Button>
        {stepIndex < stepKeys.length - 1 ? (
          <Button onClick={next}>{t.wizard.next}</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isCreating || !confirmed}>
            {isCreating && <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {isCreating ? t.wizard.creating : t.wizard.create}
          </Button>
        )}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );
}

export default BroadcastCampaignWizard;
