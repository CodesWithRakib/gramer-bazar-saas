import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Attribute } from '../entities/attribute.entity.js';
import { AttributeOption } from '../entities/attribute-option.entity.js';
import { ProductAttributeValue } from '../entities/product-attribute-value.entity.js';
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';
import { ProductAttributeValueInputDto } from '../dto/attribute.dto.js';

export interface ProductSpecGroup {
  specGroup: string;
  specs: Array<{
    attributeId: string;
    slug: string;
    nameEn: string;
    nameBn: string;
    dataType: AttributeDataType;
    unit: string | null;
    valueText: string | null;
    valueNumber: number | null;
    valueBoolean: boolean | null;
    optionId: string | null;
    optionSlug: string | null;
    displayValueEn: string;
    displayValueBn: string;
  }>;
}

/**
 * Persists structured product specifications and reads them back grouped for the
 * product detail page. Kept separate from the product/type services so both the
 * admin and seller product flows can reuse exactly the same validation.
 */
@Injectable()
export class ProductAttributeValuesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributesRepository: Repository<Attribute>,
    @InjectRepository(AttributeOption)
    private readonly optionsRepository: Repository<AttributeOption>,
    @InjectRepository(ProductAttributeValue)
    private readonly valuesRepository: Repository<ProductAttributeValue>,
  ) {}

  /** Replaces all spec values for a product from the submitted inputs. */
  async saveValues(
    productId: string,
    inputs: ProductAttributeValueInputDto[] | undefined,
  ): Promise<void> {
    // Always reset so removals are reflected.
    await this.valuesRepository.delete({ productId });
    if (!inputs || inputs.length === 0) return;

    const attributeIds = inputs
      .map((input) => input.attributeId)
      .filter((id): id is string => !!id);
    const slugs = inputs
      .map((input) => input.attributeSlug)
      .filter((slug): slug is string => !!slug);

    const orConditions = [];
    if (attributeIds.length > 0) orConditions.push({ id: In(attributeIds) });
    if (slugs.length > 0) orConditions.push({ slug: In(slugs) });
    if (orConditions.length === 0) {
      throw new BadRequestException('Each attribute value needs an attributeId or attributeSlug');
    }

    const attributes = await this.attributesRepository.find({ where: orConditions });
    const byId = new Map(attributes.map((a) => [a.id, a]));
    const bySlug = new Map(attributes.map((a) => [a.slug, a]));

    const options = await this.optionsRepository.find({
      where: { attributeId: In(attributes.map((a) => a.id)) },
    });
    const optionById = new Map(options.map((o) => [o.id, o]));
    const optionBySlug = new Map(options.map((o) => [`${o.attributeId}:${o.slug}`, o]));

    const seen = new Set<string>();
    const rows: ProductAttributeValue[] = [];

    for (const input of inputs) {
      const attribute = input.attributeId
        ? byId.get(input.attributeId)
        : input.attributeSlug
          ? bySlug.get(input.attributeSlug)
          : undefined;
      if (!attribute) {
        throw new BadRequestException(
          `Unknown attribute "${input.attributeId ?? input.attributeSlug}"`,
        );
      }
      if (seen.has(attribute.id)) {
        throw new BadRequestException(`Duplicate value for attribute "${attribute.nameEn}"`);
      }
      seen.add(attribute.id);

      let optionId: string | null = null;
      if (input.optionId) {
        const option = optionById.get(input.optionId);
        if (!option || option.attributeId !== attribute.id) {
          throw new BadRequestException(`Option does not belong to attribute "${attribute.nameEn}"`);
        }
        optionId = option.id;
      } else if (input.optionSlug) {
        const option = optionBySlug.get(`${attribute.id}:${input.optionSlug}`);
        if (!option) {
          throw new BadRequestException(
            `Unknown option "${input.optionSlug}" for attribute "${attribute.nameEn}"`,
          );
        }
        optionId = option.id;
      }

      const isSelect =
        attribute.dataType === AttributeDataType.SELECT ||
        attribute.dataType === AttributeDataType.MULTI_SELECT ||
        attribute.dataType === AttributeDataType.RANGE;
      if (isSelect && !optionId) {
        throw new BadRequestException(
          `Attribute "${attribute.nameEn}" requires a selected option value`,
        );
      }

      rows.push(
        this.valuesRepository.create({
          productId,
          attributeId: attribute.id,
          optionId,
          valueText: input.valueText ?? null,
          valueNumber: input.valueNumber ?? null,
          valueBoolean: input.valueBoolean ?? null,
        }),
      );
    }

    await this.valuesRepository.save(rows);
  }

  /** Returns grouped, display-ready specs for a single product. */
  async getSpecGroups(productId: string): Promise<ProductSpecGroup[]> {
    const values = await this.valuesRepository.find({
      where: { productId },
      relations: ['attribute', 'option'],
    });
    if (values.length === 0) return [];

    const groups = new Map<string, ProductSpecGroup>();
    for (const value of values) {
      const attribute = value.attribute;
      if (!attribute) continue;
      const groupName = 'Specifications';
      const group = groups.get(groupName) ?? { specGroup: groupName, specs: [] };

      const display = this.formatValue(attribute, value);
      group.specs.push({
        attributeId: attribute.id,
        slug: attribute.slug,
        nameEn: attribute.nameEn,
        nameBn: attribute.nameBn,
        dataType: attribute.dataType,
        unit: attribute.unit,
        valueText: value.valueText,
        valueNumber: value.valueNumber === null ? null : Number(value.valueNumber),
        valueBoolean: value.valueBoolean,
        optionId: value.optionId,
        optionSlug: value.option?.slug ?? null,
        displayValueEn: display.en,
        displayValueBn: display.bn,
      });
      groups.set(groupName, group);
    }

    for (const group of groups.values()) {
      group.specs.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }
    return [...groups.values()];
  }

  private formatValue(
    attribute: Attribute,
    value: ProductAttributeValue,
  ): { en: string; bn: string } {
    if (value.option) {
      return { en: value.option.value, bn: value.option.valueBn ?? value.option.value };
    }
    if (value.valueNumber !== null) {
      const num = Number(value.valueNumber);
      const suffix = attribute.unit ? ` ${attribute.unit}` : '';
      return { en: `${num}${suffix}`, bn: `${num}${suffix}` };
    }
    if (value.valueBoolean !== null) {
      return {
        en: value.valueBoolean ? 'Yes' : 'No',
        bn: value.valueBoolean ? 'হ্যাঁ' : 'না',
      };
    }
    return { en: value.valueText ?? '—', bn: value.valueText ?? '—' };
  }
}
