'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetPublicProductTypesQuery, ProductSpecGroup } from '@/features/catalog/catalogApi';

const NONE = '__none__';

/** Local editing state for one dynamic attribute value. */
export interface AttributeStateValue {
  optionSlug?: string;
  valueText?: string;
  valueNumber?: string;
  valueBoolean?: boolean;
}

export type AttributeValueMap = Record<string, AttributeStateValue>;

/** Rebuild the editor state from a persisted product's grouped specs (edit mode). */
export function attributeStateFromSpecGroups(
  specGroups?: ProductSpecGroup[] | null
): AttributeValueMap {
  const next: AttributeValueMap = {};
  if (!specGroups) return next;
  for (const group of specGroups) {
    for (const spec of group.specs) {
      next[spec.attributeId] = {
        optionSlug: spec.optionSlug ?? undefined,
        valueText: spec.valueText ?? undefined,
        valueNumber:
          spec.valueNumber !== null && spec.valueNumber !== undefined
            ? String(spec.valueNumber)
            : undefined,
        valueBoolean: spec.valueBoolean ?? undefined,
      };
    }
  }
  return next;
}

/** Convert editor state into the API `attributeValues` payload, dropping empty rows. */
export function buildAttributeValuesPayload(values: AttributeValueMap) {
  return Object.entries(values)
    .map(([attributeId, value]) => ({
      attributeId,
      optionSlug: value.optionSlug || undefined,
      valueText: value.valueText?.trim() || undefined,
      valueNumber:
        value.valueNumber !== undefined && value.valueNumber !== ''
          ? Number(value.valueNumber)
          : undefined,
      valueBoolean: value.valueBoolean,
    }))
    .filter(
      (value) =>
        value.optionSlug !== undefined ||
        value.valueText !== undefined ||
        value.valueNumber !== undefined ||
        value.valueBoolean === true
    );
}

/**
 * Schema-driven product type + specification fields.
 *
 * Fields are generated from the selected category's product type mappings, so
 * no category-specific branching is needed — Electronics, Medicine, Grocery or
 * any future vertical render exactly the attributes configured for it.
 */
export function ProductAttributesSection({
  categoryId,
  productTypeId,
  onProductTypeChange,
  attributeValues,
  onAttributeValuesChange,
  isBn = false,
}: {
  categoryId: string;
  productTypeId: string;
  onProductTypeChange: (id: string) => void;
  attributeValues: AttributeValueMap;
  onAttributeValuesChange: React.Dispatch<React.SetStateAction<AttributeValueMap>>;
  isBn?: boolean;
}) {
  const { data: productTypes = [] } = useGetPublicProductTypesQuery(
    { categoryId, includeMappings: true },
    { skip: !categoryId }
  );

  const selected = productTypes.find((pt) => pt.id === productTypeId) ?? null;
  const mappings = selected?.attributeMappings ?? [];

  const setValue = (attributeId: string, patch: AttributeStateValue) => {
    onAttributeValuesChange((prev) => ({
      ...prev,
      [attributeId]: { ...prev[attributeId], ...patch },
    }));
  };

  if (!categoryId) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isBn ? 'প্রোডাক্ট টাইপ' : 'Product Type'}</Label>
          <Select
            value={productTypeId || NONE}
            onValueChange={(value) => {
              onProductTypeChange(value === NONE ? '' : value);
              onAttributeValuesChange({});
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>— None / Generic —</SelectItem>
              {productTypes.map((pt) => (
                <SelectItem key={pt.id} value={pt.id}>
                  {isBn ? pt.nameBn : pt.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {productTypes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {isBn
                ? 'এই ক্যাটাগরির জন্য কোনো প্রোডাক্ট টাইপ নেই।'
                : 'No product types are defined for this category.'}
            </p>
          )}
        </div>
      </div>

      {mappings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mappings.map((mapping) => {
            const attribute = mapping.attribute;
            if (!attribute) return null;
            const value = attributeValues[attribute.id] ?? {};
            const label = isBn ? attribute.nameBn : attribute.nameEn;
            const required = mapping.isRequired ? (
              <span className="text-destructive"> *</span>
            ) : null;

            const isOptionType =
              attribute.dataType === 'SELECT' ||
              attribute.dataType === 'MULTI_SELECT' ||
              attribute.dataType === 'RANGE';

            if (isOptionType) {
              return (
                <div key={attribute.id} className="space-y-2">
                  <Label>
                    {label}
                    {required}
                  </Label>
                  <Select
                    value={value.optionSlug || NONE}
                    onValueChange={(selectedOption) =>
                      setValue(attribute.id, {
                        optionSlug: selectedOption === NONE ? undefined : selectedOption,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {(attribute.options ?? []).map((option) => (
                        <SelectItem key={option.id} value={option.slug}>
                          {isBn && option.valueBn ? option.valueBn : option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            if (attribute.dataType === 'NUMBER') {
              return (
                <div key={attribute.id} className="space-y-2">
                  <Label>
                    {label}
                    {attribute.unit ? ` (${attribute.unit})` : ''}
                    {required}
                  </Label>
                  <Input
                    type="number"
                    value={value.valueNumber ?? ''}
                    onChange={(e) => setValue(attribute.id, { valueNumber: e.target.value })}
                  />
                </div>
              );
            }

            if (attribute.dataType === 'BOOLEAN') {
              return (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between rounded-lg border p-3 shadow-xs"
                >
                  <Label className="cursor-pointer">{label}</Label>
                  <Switch
                    checked={value.valueBoolean ?? false}
                    onCheckedChange={(checked) => setValue(attribute.id, { valueBoolean: checked })}
                  />
                </div>
              );
            }

            // TEXT, DATE and any future scalar type fall back to a text input.
            return (
              <div key={attribute.id} className="space-y-2">
                <Label>
                  {label}
                  {attribute.unit ? ` (${attribute.unit})` : ''}
                  {required}
                </Label>
                <Input
                  type={attribute.dataType === 'DATE' ? 'date' : 'text'}
                  value={value.valueText ?? ''}
                  onChange={(e) => setValue(attribute.id, { valueText: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
