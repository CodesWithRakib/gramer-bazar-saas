import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Attribute } from '../entities/attribute.entity.js';
import { AttributeOption } from '../entities/attribute-option.entity.js';
import { ProductTypeAttribute } from '../entities/product-type-attribute.entity.js';
import { ProductAttributeValue } from '../entities/product-attribute-value.entity.js';
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';
import { CreateAttributeDto, UpdateAttributeDto } from '../dto/attribute.dto.js';
import { slugify } from '../../common/utils/slug.js';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributesRepository: Repository<Attribute>,
    @InjectRepository(AttributeOption)
    private readonly optionsRepository: Repository<AttributeOption>,
    @InjectRepository(ProductTypeAttribute)
    private readonly mappingsRepository: Repository<ProductTypeAttribute>,
    @InjectRepository(ProductAttributeValue)
    private readonly valuesRepository: Repository<ProductAttributeValue>,
  ) {}

  private assertSelectable(dataType: AttributeDataType, hasOptions: boolean): void {
    const needsOptions =
      dataType === AttributeDataType.SELECT ||
      dataType === AttributeDataType.MULTI_SELECT ||
      dataType === AttributeDataType.RANGE;
    if (needsOptions && !hasOptions) {
      throw new BadRequestException(
        `Attribute of type ${dataType} requires at least one option value`,
      );
    }
  }

  private buildOptions(attributeId: string, options: NonNullable<CreateAttributeDto['options']>) {
    return options.map((option, index) => {
      const slug = slugify(option.slug || option.value, 'option', 120);
      return this.optionsRepository.create({
        id: option.id,
        attributeId,
        value: option.value.trim(),
        valueBn: option.valueBn ?? null,
        slug,
        sortOrder: option.sortOrder ?? index,
        isActive: option.isActive ?? true,
      });
    });
  }

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.attributesRepository.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`An attribute with slug "${slug}" already exists`);
    }
  }

  async create(dto: CreateAttributeDto): Promise<Attribute> {
    const dataType = dto.dataType ?? AttributeDataType.TEXT;
    const options = dto.options ?? [];
    this.assertSelectable(dataType, options.length > 0);

    const slug = slugify(dto.slug || dto.nameEn, 'attribute', 120);
    await this.assertSlugAvailable(slug);

    const attribute = this.attributesRepository.create({
      nameEn: dto.nameEn.trim(),
      nameBn: dto.nameBn.trim(),
      slug,
      dataType,
      unit: dto.unit ?? null,
      isFilterable: dto.isFilterable ?? true,
      isVariantAxis: dto.isVariantAxis ?? false,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.attributesRepository.save(attribute);

    if (options.length > 0) {
      await this.optionsRepository.save(this.buildOptions(saved.id, options));
    }
    return this.findOne(saved.id);
  }

  async findAll(search?: string, isActive?: boolean, dataType?: AttributeDataType) {
    const where: FindOptionsWhere<Attribute> = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (dataType) where.dataType = dataType;

    const query = this.attributesRepository
      .createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.options', 'options')
      .orderBy('attribute.sortOrder', 'ASC')
      .addOrderBy('attribute.nameEn', 'ASC')
      .addOrderBy('options.sortOrder', 'ASC');

    if (Object.keys(where).length > 0) {
      query.where(where);
    }
    if (search) {
      query.andWhere(
        '(attribute.nameEn ILIKE :search OR attribute.nameBn ILIKE :search OR attribute.slug ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<Attribute> {
    const attribute = await this.attributesRepository.findOne({
      where: { id },
      relations: ['options'],
      order: { options: { sortOrder: 'ASC' } },
    });
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    return attribute;
  }

  async findBySlug(slug: string): Promise<Attribute> {
    const attribute = await this.attributesRepository.findOne({
      where: { slug },
      relations: ['options'],
      order: { options: { sortOrder: 'ASC' } },
    });
    if (!attribute) {
      throw new NotFoundException(`Attribute with slug ${slug} not found`);
    }
    return attribute;
  }

  async update(id: string, dto: UpdateAttributeDto): Promise<Attribute> {
    const attribute = await this.findOne(id);

    if (dto.slug && dto.slug !== attribute.slug) {
      const slug = slugify(dto.slug, 'attribute', 120);
      await this.assertSlugAvailable(slug, id);
      attribute.slug = slug;
    }

    const nextDataType = dto.dataType ?? attribute.dataType;
    if (dto.options === undefined) {
      this.assertSelectable(nextDataType, (attribute.options?.length ?? 0) > 0);
    } else {
      this.assertSelectable(nextDataType, dto.options.length > 0);
    }

    Object.assign(attribute, {
      nameEn: dto.nameEn ?? attribute.nameEn,
      nameBn: dto.nameBn ?? attribute.nameBn,
      dataType: nextDataType,
      unit: dto.unit !== undefined ? dto.unit : attribute.unit,
      isFilterable: dto.isFilterable ?? attribute.isFilterable,
      isVariantAxis: dto.isVariantAxis ?? attribute.isVariantAxis,
      sortOrder: dto.sortOrder ?? attribute.sortOrder,
      isActive: dto.isActive ?? attribute.isActive,
    });
    const saved = await this.attributesRepository.save(attribute);

    if (dto.options !== undefined) {
      const incomingIds = new Set(dto.options.map((o) => o.id).filter(Boolean) as string[]);
      const existing = await this.optionsRepository.find({ where: { attributeId: id } });
      const removable = existing.filter((o) => !incomingIds.has(o.id));
      if (removable.length > 0) {
        await this.optionsRepository.remove(removable);
      }
      const built = this.buildOptions(id, dto.options);
      if (built.length > 0) {
        await this.optionsRepository.save(built);
      }
    }

    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const attribute = await this.findOne(id);

    const usage = await this.valuesRepository.count({ where: { attributeId: id } });
    if (usage > 0) {
      throw new BadRequestException(
        `Cannot delete attribute "${attribute.nameEn}" because ${usage} products use it. Deactivate it instead.`,
      );
    }
    const mapped = await this.mappingsRepository.count({ where: { attributeId: id } });
    if (mapped > 0) {
      await this.mappingsRepository.delete({ attributeId: id });
    }
    await this.attributesRepository.remove(attribute);
  }
}
