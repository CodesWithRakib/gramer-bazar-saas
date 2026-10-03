import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ProductAttributeValuesService } from './product-attribute-values.service.js';
import { Attribute } from '../entities/attribute.entity.js';
import { AttributeOption } from '../entities/attribute-option.entity.js';
import { ProductAttributeValue } from '../entities/product-attribute-value.entity.js';
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';

describe('ProductAttributeValuesService', () => {
  let service: ProductAttributeValuesService;

  const attributesRepository = { find: vi.fn() };
  const optionsRepository = { find: vi.fn() };
  const valuesRepository = {
    delete: vi.fn(),
    create: vi.fn((x: unknown) => x),
    save: vi.fn(async (x: unknown) => x),
    find: vi.fn(),
  };

  const socketAttribute = {
    id: 'attr-socket',
    slug: 'socket',
    nameEn: 'Socket',
    nameBn: 'সকেট',
    dataType: AttributeDataType.SELECT,
    unit: null,
  } as unknown as Attribute;

  const am5Option = {
    id: 'opt-am5',
    attributeId: 'attr-socket',
    slug: 'am5',
    value: 'AM5',
    valueBn: null,
  } as unknown as AttributeOption;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAttributeValuesService,
        { provide: getRepositoryToken(Attribute), useValue: attributesRepository },
        { provide: getRepositoryToken(AttributeOption), useValue: optionsRepository },
        { provide: getRepositoryToken(ProductAttributeValue), useValue: valuesRepository },
      ],
    }).compile();
    service = module.get(ProductAttributeValuesService);
  });

  it('rejects a select attribute without a chosen option', async () => {
    attributesRepository.find.mockResolvedValue([socketAttribute]);
    optionsRepository.find.mockResolvedValue([am5Option]);

    await expect(
      service.saveValues('product-1', [{ attributeSlug: 'socket' }]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('resolves option by slug and persists the value', async () => {
    attributesRepository.find.mockResolvedValue([socketAttribute]);
    optionsRepository.find.mockResolvedValue([am5Option]);

    await service.saveValues('product-1', [
      { attributeSlug: 'socket', optionSlug: 'am5' },
    ]);

    expect(valuesRepository.delete).toHaveBeenCalledWith({ productId: 'product-1' });
    expect(valuesRepository.save).toHaveBeenCalledTimes(1);
    const saved = valuesRepository.save.mock.calls[0][0] as unknown as Array<{
      attributeId: string;
      optionId: string;
    }>;
    expect(saved[0]).toMatchObject({ attributeId: 'attr-socket', optionId: 'opt-am5' });
  });

  it('rejects duplicate values for the same attribute', async () => {
    attributesRepository.find.mockResolvedValue([socketAttribute]);
    optionsRepository.find.mockResolvedValue([am5Option]);

    await expect(
      service.saveValues('product-1', [
        { attributeSlug: 'socket', optionSlug: 'am5' },
        { attributeSlug: 'socket', optionSlug: 'am5' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unknown attribute slug', async () => {
    attributesRepository.find.mockResolvedValue([socketAttribute]);
    optionsRepository.find.mockResolvedValue([]);

    await expect(
      service.saveValues('product-1', [{ attributeSlug: 'does-not-exist' }]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('clears existing values when no inputs are provided', async () => {
    await service.saveValues('product-1', undefined);

    expect(valuesRepository.delete).toHaveBeenCalledWith({ productId: 'product-1' });
    expect(valuesRepository.save).not.toHaveBeenCalled();
  });
});
