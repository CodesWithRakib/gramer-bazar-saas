'use client';

import React, { useMemo, useState } from 'react';
import { Braces, Loader2 } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
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
  useCreateBroadcastTemplateMutation,
  useUpdateBroadcastTemplateMutation,
  type BroadcastTemplate,
  type BroadcastTemplateCategory,
  type BroadcastTemplateStatus,
} from '../broadcastApi';

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
const CATEGORIES: BroadcastTemplateCategory[] = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
const STATUSES: BroadcastTemplateStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

function extractKeys(body: string): string[] {
  const matches = body.match(VARIABLE_PATTERN) ?? [];
  return matches
    .map((match) => match.replace(/[{}\s]/g, ''))
    .filter((key, index, all) => all.indexOf(key) === index);
}

function renderPreview(body: string, samples: Record<string, string>): string {
  return body.replace(VARIABLE_PATTERN, (full, key: string) => samples[key] ?? `[${key}]`);
}

/** Render a template body as React nodes, highlighting {{variables}} visually. */
function HighlightedBody({ body }: { body: string }) {
  const parts = body.split(VARIABLE_PATTERN);
  return (
    <p className="whitespace-pre-wrap break-words text-sm">
      {parts.map((part, index) => {
        const isVariable = index % 2 === 1;
        if (isVariable) {
          return (
            <span
              key={`v-${index}`}
              className="mx-0.5 rounded bg-primary/10 px-1 font-medium text-primary"
            >
              {`{{${part}}}`}
            </span>
          );
        }
        return <React.Fragment key={`t-${index}`}>{part}</React.Fragment>;
      })}
    </p>
  );
}

interface TemplateFormProps {
  lang: string;
  template?: BroadcastTemplate | null;
  onClose: () => void;
}

/**
 * Form body. Mounted only while the dialog is open, so local state initializes
 * from the edited template on mount without an initialization effect.
 */
function TemplateForm({ lang, template, onClose }: TemplateFormProps) {
  const t = getBroadcastDictionary(lang);
  const isEdit = !!template;

  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [language, setLanguage] = useState(template?.language ?? (lang === 'bn' ? 'bn' : 'en'));
  const [category, setCategory] = useState<BroadcastTemplateCategory>(
    template?.category ?? 'MARKETING',
  );
  const [status, setStatus] = useState<BroadcastTemplateStatus>(template?.status ?? 'DRAFT');
  const [body, setBody] = useState(template?.body ?? '');

  const [createTemplate, { isLoading: isCreating }] = useCreateBroadcastTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateBroadcastTemplateMutation();
  const isSaving = isCreating || isUpdating;

  const variableKeys = useMemo(() => extractKeys(body), [body]);

  const samples = useMemo(() => {
    const map: Record<string, string> = {
      customer_name: lang === 'bn' ? 'রাকিব' : 'Rakib',
      customer_phone: '+8801700000000',
      shop_name: lang === 'bn' ? 'গ্রামের বাজার' : 'Gramer Bazar',
      offer_link: 'https://gramerbazar.com/offers',
    };
    for (const key of variableKeys) {
      const existing = template?.variables?.find((v) => v.key === key);
      if (existing?.example) map[key] = existing.example;
    }
    return map;
  }, [variableKeys, template, lang]);

  const insertVariable = (key: string) => setBody((prev) => `${prev}{{${key}}}`);

  const handleSave = async () => {
    if (!name.trim()) {
      customToast.error(t.templateForm.nameRequired);
      return;
    }
    if (!body.trim()) {
      customToast.error(t.templateForm.bodyRequired);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      language,
      category,
      status,
      body,
      variables: variableKeys.map((key) => {
        const existing = template?.variables?.find((v) => v.key === key);
        return {
          key,
          label: existing?.label ?? null,
          example: existing?.example ?? null,
          required: existing?.required ?? true,
        };
      }),
    };

    try {
      if (isEdit && template) {
        await updateTemplate({ id: template.id, ...payload }).unwrap();
      } else {
        await createTemplate(payload).unwrap();
      }
      customToast.success(t.templates.saved);
      onClose();
    } catch (error) {
      const message = (error as { data?: { message?: string | string[] } })?.data?.message;
      customToast.error(
        Array.isArray(message) ? message[0] : (message ?? t.templateForm.invalidVariables),
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? t.templateForm.editTitle : t.templateForm.createTitle}</DialogTitle>
        <DialogDescription className="text-xs">{t.templates.subtitle}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="bt-name">{t.templateForm.name}</Label>
            <Input
              id="bt-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.templateForm.namePlaceholder}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bt-desc">{t.templateForm.description}</Label>
            <Input
              id="bt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.templateForm.description}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="bt-lang">{t.templateForm.language}</Label>
            <Input id="bt-lang" value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t.templateForm.category}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as BroadcastTemplateCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t.templateForm.status}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as BroadcastTemplateStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bt-body">{t.templateForm.body}</Label>
          <Textarea
            id="bt-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.templateForm.bodyPlaceholder}
            rows={5}
          />
        </div>

        {variableKeys.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Braces className="h-3.5 w-3.5" aria-hidden="true" />
              {t.templateForm.variables}
            </p>
            <div className="flex flex-wrap gap-2">
              {variableKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => insertVariable(key)}
                  className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {`{{${key}}}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
          <p className="text-xs font-semibold text-muted-foreground">{t.templateForm.preview}</p>
          {body.trim() ? (
            <HighlightedBody body={renderPreview(body, samples)} />
          ) : (
            <p className="text-sm text-muted-foreground">{t.templateForm.bodyPlaceholder}</p>
          )}
        </div>

        {template && (
          <div className="space-y-1 rounded-xl border p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{t.templateForm.providerInfo}</p>
            <p>
              {t.templateForm.providerStatus}: {template.providerStatus}
            </p>
            <p>Provider: {template.provider}</p>
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          {t.templateForm.cancel}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSaving ? t.templateForm.saving : t.templateForm.save}
        </Button>
      </DialogFooter>
    </>
  );
}

export interface BroadcastTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
  template?: BroadcastTemplate | null;
}

export function BroadcastTemplateDialog({
  open,
  onOpenChange,
  lang = 'en',
  template,
}: BroadcastTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-3xl">
        <TemplateForm lang={lang} template={template} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export default BroadcastTemplateDialog;
